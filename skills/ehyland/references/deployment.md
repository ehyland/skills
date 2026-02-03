---
name: deployment
description: How Deployment and CI/CD should be setup. Includes dockerfile and buildkite pipeline recommendations
---

# Project Setup

## Buildkite Pipelines

- Buildkite pipelines are defined in a yaml file `.buildkite/pipeline.yaml`
- Most CI pipelines start by building a docker image the subsequent jobs run in
- All CI jobs run on the same host machine so the image does not need to be published
- Most apps run on the same host machine as the CI jobs so the runtime image often does not need to be published
- Docker Compose file is used to define services that CI jobs run in
- When a new version of an app is ready to be deployed, the release image is tagged with `production` and the compose service is updated by running `update-media-server-container <service-name>`

### Example pipeline for an app

- `example-app` is the name of the app in the bellow code snippets

```yaml
# docker-compose.yml

services:
  builder:
    build:
      tags: ["local/example-app:builder-${BUILDKITE_BUILD_ID}"]
      target: builder
  release:
    build:
      tags: ["local/example-app:release-${BUILDKITE_BUILD_ID}"]
      target: release
    network_mode: service:playwright
    environment:
      - "E2E_TEST_MODE=true"
      - "DB_PATH=:memory:"
  playwright:
    build:
      tags: ["local/example-app:playwright-${BUILDKITE_BUILD_ID}"]
      target: playwright
    command: bun test:e2e
    environment:
      - CI=true
```

```yaml
# .buildkite/pipeline.yaml

x-run-builder: &run-builder
  plugins:
    - docker-compose#v5.12.1:
        run: builder

steps:
  - label: ":docker: Build"
    command: |
      docker buildx bake --progress plain

  - wait

  - label: test:e2e
    command: |
      docker compose up --force-recreate --exit-code-from playwright playwright release
    env:
      COMPOSE_PROJECT_NAME: e2e-${BUILDKITE_JOB_ID}

  - command: bun test
    <<: *run-builder

  - command: bun lint
    <<: *run-builder

  - command: bun format:check
    <<: *run-builder

  - command: bun typecheck
    <<: *run-builder

  - command: bun bun-version-sync --check
    <<: *run-builder

  - wait

  - label: Docker build & deploy
    branches: $BUILDKITE_PIPELINE_DEFAULT_BRANCH
    command: |
      export BUILD_TAG=$(
        docker buildx bake --print --progress quiet release | yq .target.release.tags[0]
      )

      docker tag $$BUILD_TAG local/example-app:production

      update-media-server-container example-app
```

