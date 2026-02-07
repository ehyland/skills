import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import * as p from '@clack/prompts'
import { llms, manual, submodules, vendors } from '../meta.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function exec(cmd: string, cwd = root): string {
  return execSync(cmd, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}

function execSafe(cmd: string, cwd = root): string | null {
  try {
    return exec(cmd, cwd)
  }
  catch {
    return null
  }
}

function getGitSha(dir: string): string | null {
  return execSafe('git rev-parse HEAD', dir)
}

function submoduleExists(path: string): boolean {
  const gitmodules = join(root, '.gitmodules')
  if (!existsSync(gitmodules))
    return false
  const content = readFileSync(gitmodules, 'utf-8')
  return content.includes(`path = ${path}`)
}

function getExistingSubmodulePaths(): string[] {
  const gitmodules = join(root, '.gitmodules')
  if (!existsSync(gitmodules))
    return []
  const content = readFileSync(gitmodules, 'utf-8')
  const matches = content.matchAll(/path\s*=\s*(.+)/g)
  return Array.from(matches, match => match[1].trim())
}

function removeSubmodule(submodulePath: string): void {
  // Deinitialize the submodule
  execSafe(`git submodule deinit -f ${submodulePath}`)
  // Remove from .git/modules
  const gitModulesPath = join(root, '.git', 'modules', submodulePath)
  if (existsSync(gitModulesPath)) {
    rmSync(gitModulesPath, { recursive: true })
  }
  // Remove from working tree and .gitmodules
  exec(`git rm -f ${submodulePath}`)
}

interface Project {
  name: string
  url: string
  type: 'source' | 'vendor' | 'llms'
  path: string
}

interface VendorConfig {
  source: string
  skills: Record<string, string> // sourceSkillName -> outputSkillName
}

async function initSubmodules(skipPrompt = false) {
  const allProjects: Project[] = [
    ...Object.entries(submodules).map(([name, url]) => ({
      name,
      url,
      type: 'source' as const,
      path: `sources/${name}`,
    })),
    ...Object.entries(vendors).map(([name, config]) => ({
      name,
      url: (config as VendorConfig).source,
      type: 'vendor' as const,
      path: `vendor/${name}`,
    })),
    ...Object.entries(llms).map(([name, url]) => ({
      name,
      url,
      type: 'llms' as const,
      path: `llms/${name}`,
    })),
  ]

  const spinner = p.spinner()

  // Check for extra submodules that are not in meta.ts
  const existingSubmodulePaths = getExistingSubmodulePaths()
  const expectedPaths = new Set(allProjects.map(p => p.path))
  const extraSubmodules = existingSubmodulePaths.filter(path => !expectedPaths.has(path))

  if (extraSubmodules.length > 0) {
    p.log.warn(`Found ${extraSubmodules.length} submodule(s) not in meta.ts:`)
    for (const path of extraSubmodules) {
      p.log.message(`  - ${path}`)
    }

    const shouldRemove = skipPrompt
      ? true
      : await p.confirm({
          message: 'Remove these extra submodules?',
          initialValue: true,
        })

    if (p.isCancel(shouldRemove)) {
      p.cancel('Cancelled')
      return
    }

    if (shouldRemove) {
      for (const submodulePath of extraSubmodules) {
        spinner.start(`Removing submodule: ${submodulePath}`)
        try {
          removeSubmodule(submodulePath)
          spinner.stop(`Removed: ${submodulePath}`)
        }
        catch (e) {
          spinner.stop(`Failed to remove ${submodulePath}: ${e}`)
        }
      }
    }
  }

  const existingProjects = allProjects.filter(p => p.type === 'llms' ? existsSync(join(root, p.path)) : submoduleExists(p.path))
  const newProjects = allProjects.filter(p => p.type === 'llms' ? !existsSync(join(root, p.path)) : !submoduleExists(p.path))

  if (newProjects.length === 0) {
    p.log.info('All projects already initialized')
    return
  }

  const selected = skipPrompt
    ? newProjects
    : await p.multiselect({
        message: 'Select projects to initialize',
        options: newProjects.map(project => ({
          value: project,
          label: `${project.name} (${project.type})`,
          hint: project.url,
        })),
        initialValues: newProjects,
      })

  if (p.isCancel(selected)) {
    p.cancel('Cancelled')
    return
  }

  for (const project of selected as Project[]) {
    spinner.start(`Initializing: ${project.name}`)

    // Ensure parent directory exists
    const parentDir = join(root, dirname(project.path))
    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true })
    }

    try {
      if (project.type === 'llms') {
        await downloadLlms(project.name, project.url)
        spinner.stop(`Downloaded: ${project.name}`)
      }
      else {
        exec(`git submodule add ${project.url} ${project.path}`)
        spinner.stop(`Added: ${project.name}`)
      }
    }
    catch (e) {
      spinner.stop(`Failed to initialize ${project.name}: ${e}`)
    }
  }

  p.log.success('Submodules initialized')

  if (existingProjects.length > 0) {
    p.log.info(`Already initialized: ${existingProjects.map(p => p.name).join(', ')}`)
  }
}

async function downloadLlms(name: string, url: string) {
  const dir = join(root, 'llms', name)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  }
  let content = await response.text()

  const baseUrl = new URL(url)
  // Basic regex to find links to other llms.txt files or md/mdx files with "llms" in path
  const links = [...content.matchAll(/\[.*?\]\((.*?llms.*?\.(?:txt|mdx?))\)/gi)]

  for (const match of links) {
    const originalLink = match[1]
    const linkUrl = new URL(originalLink, baseUrl)

    // Skip if it's the same URL as the entrypoint or different domain
    if (linkUrl.href === baseUrl.href || linkUrl.hostname !== baseUrl.hostname)
      continue

    const fileName = originalLink.split('/').pop() || 'llms-linked.txt'

    try {
      const res = await fetch(linkUrl.href)
      if (res.ok) {
        const text = await res.text()
        writeFileSync(join(dir, fileName), text)

        // Rewrite the link to be relative in the index content
        content = content.replaceAll(originalLink, `./${fileName}`)
      }
    }
    catch (e) {
      console.error(`Failed to download linked LLMS file ${linkUrl.href}: ${e}`)
    }
  }

  writeFileSync(join(dir, 'llms.txt'), content)
}

async function syncSubmodules() {
  const spinner = p.spinner()

  // Update all submodules
  spinner.start('Updating submodules...')
  try {
    exec('git submodule update --remote --merge')
    spinner.stop('Submodules updated')
  }
  catch (e) {
    spinner.stop(`Failed to update submodules: ${e}`)
    return
  }

  // Update LLMS files
  for (const [name, url] of Object.entries(llms)) {
    spinner.start(`Updating LLMS: ${name}`)
    try {
      await downloadLlms(name, url)
      spinner.stop(`Updated LLMS: ${name}`)
    }
    catch (e) {
      spinner.stop(`Failed to update LLMS ${name}: ${e}`)
    }
  }

  // Sync Type 2 skills
  for (const [vendorName, config] of Object.entries(vendors)) {
    const vendorConfig = config as VendorConfig
    const vendorPath = join(root, 'vendor', vendorName)
    const vendorSkillsPath = join(vendorPath, 'skills')

    if (!existsSync(vendorPath)) {
      p.log.warn(`Vendor submodule not found: ${vendorName}. Run init first.`)
      continue
    }

    if (!existsSync(vendorSkillsPath)) {
      p.log.warn(`No skills directory in vendor/${vendorName}/skills/`)
      continue
    }

    // Sync each specified skill
    for (const [sourceSkillName, outputSkillName] of Object.entries(vendorConfig.skills)) {
      const sourceSkillPath = join(vendorSkillsPath, sourceSkillName)
      const outputPath = join(root, 'skills', outputSkillName)

      if (!existsSync(sourceSkillPath)) {
        p.log.warn(`Skill not found: vendor/${vendorName}/skills/${sourceSkillName}`)
        continue
      }

      spinner.start(`Syncing skill: ${sourceSkillName} → ${outputSkillName}`)

      // Remove existing output directory to ensure clean sync
      if (existsSync(outputPath)) {
        rmSync(outputPath, { recursive: true })
      }
      mkdirSync(outputPath, { recursive: true })

      // Copy all files from source skill to output
      const files = readdirSync(sourceSkillPath, { recursive: true, withFileTypes: true })
      for (const file of files) {
        if (file.isFile()) {
          const fullPath = join(file.parentPath, file.name)
          const relativePath = fullPath.replace(sourceSkillPath, '')
          const destPath = join(outputPath, relativePath)

          // Ensure destination directory exists
          const destDir = dirname(destPath)
          if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true })
          }

          cpSync(fullPath, destPath)
        }
      }

      // Copy LICENSE file from vendor repo root if it exists
      const licenseNames = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'license.md', 'license.txt']
      for (const licenseName of licenseNames) {
        const licensePath = join(vendorPath, licenseName)
        if (existsSync(licensePath)) {
          cpSync(licensePath, join(outputPath, 'LICENSE.md'))
          break
        }
      }

      // Update SYNC.md (instead of GENERATION.md for vendored skills)
      const sha = getGitSha(vendorPath)
      const syncPath = join(outputPath, 'SYNC.md')
      const date = new Date().toISOString().split('T')[0]

      const syncContent = `# Sync Info

- **Source:** \`vendor/${vendorName}/skills/${sourceSkillName}\`
- **Git SHA:** \`${sha}\`
- **Synced:** ${date}
`

      writeFileSync(syncPath, syncContent)

      spinner.stop(`Synced: ${sourceSkillName} → ${outputSkillName}`)
    }
  }

  p.log.success('All skills synced')
}

async function checkUpdates() {
  const spinner = p.spinner()
  spinner.start('Fetching remote changes...')

  try {
    exec('git submodule foreach git fetch')
    spinner.stop('Fetched remote changes')
  }
  catch (e) {
    spinner.stop(`Failed to fetch: ${e}`)
    return
  }

  const updates: { name: string, type: string, behind: number }[] = []

  // Check sources
  for (const name of Object.keys(submodules)) {
    const path = join(root, 'sources', name)
    if (!existsSync(path))
      continue

    const behind = execSafe('git rev-list HEAD..@{u} --count', path)
    const count = behind ? Number.parseInt(behind) : 0
    if (count > 0) {
      updates.push({ name, type: 'source', behind: count })
    }
  }

  // Check vendors
  for (const [name, config] of Object.entries(vendors)) {
    const vendorConfig = config as VendorConfig
    const path = join(root, 'vendor', name)
    if (!existsSync(path))
      continue

    const behind = execSafe('git rev-list HEAD..@{u} --count', path)
    const count = behind ? Number.parseInt(behind) : 0
    if (count > 0) {
      const skillNames = Object.values(vendorConfig.skills).join(', ')
      updates.push({ name: `${name} (${skillNames})`, type: 'vendor', behind: count })
    }
  }

  if (updates.length === 0) {
    p.log.success('All submodules are up to date')
  }
  else {
    p.log.info('Updates available:')
    for (const update of updates) {
      p.log.message(`  ${update.name} (${update.type}): ${update.behind} commits behind`)
    }
  }
}

function getExpectedSkillNames(): Set<string> {
  const expected = new Set<string>()

  // Skills from submodules (generated skills use same name as submodule key)
  for (const name of Object.keys(submodules)) {
    expected.add(name)
  }

  // Skills from llms
  for (const name of Object.keys(llms)) {
    expected.add(name)
  }

  // Skills from vendors (use the output skill name)
  for (const config of Object.values(vendors)) {
    const vendorConfig = config as VendorConfig
    for (const outputName of Object.values(vendorConfig.skills)) {
      expected.add(outputName)
    }
  }

  // Manual skills
  for (const name of manual) {
    expected.add(name)
  }

  return expected
}

function getExistingSkillNames(): string[] {
  const skillsDir = join(root, 'skills')
  if (!existsSync(skillsDir))
    return []

  return readdirSync(skillsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
}

async function cleanup(skipPrompt = false) {
  const spinner = p.spinner()
  let hasChanges = false

  // 1. Find and remove extra submodules
  const allProjects: Project[] = [
    ...Object.entries(submodules).map(([name, url]) => ({
      name,
      url,
      type: 'source' as const,
      path: `sources/${name}`,
    })),
    ...Object.entries(vendors).map(([name, config]) => ({
      name,
      url: (config as VendorConfig).source,
      type: 'vendor' as const,
      path: `vendor/${name}`,
    })),
    ...Object.entries(llms).map(([name, url]) => ({
      name,
      url,
      type: 'llms' as const,
      path: `llms/${name}`,
    })),
  ]

  const existingSubmodulePaths = getExistingSubmodulePaths()
  const existingLlmPaths = existsSync(join(root, 'llms'))
    ? readdirSync(join(root, 'llms'), { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => `llms/${entry.name}`)
    : []

  const expectedPaths = new Set(allProjects.map(p => p.path))
  const extraSubmodules = existingSubmodulePaths.filter(path => !expectedPaths.has(path))
  const extraLlms = existingLlmPaths.filter(path => !expectedPaths.has(path))

  if (extraSubmodules.length > 0 || extraLlms.length > 0) {
    if (extraSubmodules.length > 0) {
      p.log.warn(`Found ${extraSubmodules.length} submodule(s) not in meta.ts:`)
      for (const path of extraSubmodules) {
        p.log.message(`  - ${path}`)
      }
    }

    if (extraLlms.length > 0) {
      p.log.warn(`Found ${extraLlms.length} LLMS directory(s) not in meta.ts:`)
      for (const path of extraLlms) {
        p.log.message(`  - ${path}`)
      }
    }

    const shouldRemove = skipPrompt
      ? true
      : await p.confirm({
          message: 'Remove these extra projects and directories?',
          initialValue: true,
        })

    if (p.isCancel(shouldRemove)) {
      p.cancel('Cancelled')
      return
    }

    if (shouldRemove) {
      hasChanges = true
      for (const submodulePath of extraSubmodules) {
        spinner.start(`Removing submodule: ${submodulePath}`)
        try {
          removeSubmodule(submodulePath)
          spinner.stop(`Removed: ${submodulePath}`)
        }
        catch (e) {
          spinner.stop(`Failed to remove ${submodulePath}: ${e}`)
        }
      }

      for (const llmPath of extraLlms) {
        spinner.start(`Removing LLMS directory: ${llmPath}`)
        try {
          rmSync(join(root, llmPath), { recursive: true })
          spinner.stop(`Removed: ${llmPath}`)
        }
        catch (e) {
          spinner.stop(`Failed to remove ${llmPath}: ${e}`)
        }
      }
    }
  }

  // 2. Find and remove extra skills
  const existingSkills = getExistingSkillNames()
  const expectedSkills = getExpectedSkillNames()
  const extraSkills = existingSkills.filter(name => !expectedSkills.has(name))

  if (extraSkills.length > 0) {
    p.log.warn(`Found ${extraSkills.length} skill(s) not in meta.ts:`)
    for (const name of extraSkills) {
      p.log.message(`  - skills/${name}`)
    }

    const shouldRemove = skipPrompt
      ? true
      : await p.confirm({
          message: 'Remove these extra skills?',
          initialValue: true,
        })

    if (p.isCancel(shouldRemove)) {
      p.cancel('Cancelled')
      return
    }

    if (shouldRemove) {
      hasChanges = true
      for (const skillName of extraSkills) {
        spinner.start(`Removing skill: ${skillName}`)
        try {
          rmSync(join(root, 'skills', skillName), { recursive: true })
          spinner.stop(`Removed: skills/${skillName}`)
        }
        catch (e) {
          spinner.stop(`Failed to remove skills/${skillName}: ${e}`)
        }
      }
    }
  }

  if (!hasChanges && extraSubmodules.length === 0 && extraLlms.length === 0 && extraSkills.length === 0) {
    p.log.success('Everything is clean, no unused projects or skills found')
  }
  else if (hasChanges) {
    p.log.success('Cleanup completed')
  }
}

async function main() {
  const args = process.argv.slice(2)
  const skipPrompt = args.includes('-y') || args.includes('--yes')
  const command = args.find(arg => !arg.startsWith('-'))

  // Handle subcommands directly
  if (command === 'init') {
    p.intro('Skills Manager - Init')
    await initSubmodules(skipPrompt)
    p.outro('Done')
    return
  }

  if (command === 'sync') {
    p.intro('Skills Manager - Sync')
    await syncSubmodules()
    p.outro('Done')
    return
  }

  if (command === 'check') {
    p.intro('Skills Manager - Check')
    await checkUpdates()
    p.outro('Done')
    return
  }

  if (command === 'cleanup') {
    p.intro('Skills Manager - Cleanup')
    await cleanup(skipPrompt)
    p.outro('Done')
    return
  }

  // No subcommand: show interactive menu (requires interaction)
  if (skipPrompt) {
    p.log.error('Command required when using -y flag')
    p.log.info('Available commands: init, sync, check, cleanup')
    process.exit(1)
  }

  p.intro('Skills Manager')

  const action = await p.select({
    message: 'What would you like to do?',
    options: [
      { value: 'sync', label: 'Sync projects', hint: 'Pull latest and sync Type 2 & 4 skills' },
      { value: 'init', label: 'Init projects', hint: 'Add new submodules or LLMS' },
      { value: 'check', label: 'Check updates', hint: 'See available updates (git only)' },
      { value: 'cleanup', label: 'Cleanup', hint: 'Remove unused projects and skills' },
    ],
  })

  if (p.isCancel(action)) {
    p.cancel('Cancelled')
    process.exit(0)
  }

  switch (action) {
    case 'init':
      await initSubmodules()
      break
    case 'sync':
      await syncSubmodules()
      break
    case 'check':
      await checkUpdates()
      break
    case 'cleanup':
      await cleanup()
      break
  }

  p.outro('Done')
}

main().catch(console.error)
