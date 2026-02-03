export interface VendorSkillMeta {
  official?: boolean
  source: string
  skills: Record<string, string> // sourceSkillName -> outputSkillName
}

/**
 * Repositories to clone as submodules and generate skills from source
 */
export const submodules = {
  // vue: 'https://github.com/vuejs/docs',
  // nuxt: 'https://github.com/nuxt/nuxt',
  // vite: 'https://github.com/vitejs/vite',
  // unocss: 'https://github.com/unocss/unocss',
  // pnpm: 'https://github.com/pnpm/pnpm.io',
  // pinia: 'https://github.com/vuejs/pinia',
  vitest: 'https://github.com/vitest-dev/vitest',
  trpc: 'https://github.com/trpc/trpc',
  // vitepress: 'https://github.com/vuejs/vitepress',
}

/**
 * Already generated skills, sync with their `skills/` directory
 */
export const vendors: Record<string, VendorSkillMeta> = {
  'tsdown': {
    official: true,
    source: 'https://github.com/rolldown/tsdown',
    skills: {
      tsdown: 'tsdown',
    },
  },
  'turborepo': {
    official: true,
    source: 'https://github.com/vercel/turborepo',
    skills: {
      turborepo: 'turborepo',
    },
  },
  'web-design-guidelines': {
    source: 'https://github.com/vercel-labs/agent-skills',
    skills: {
      'web-design-guidelines': 'web-design-guidelines',
    },
  },
}

/**
 * Hand-written skills with Eamon Hyland's preferences/tastes/recommendations
 */
export const manual = [
  'ehyland',
]
