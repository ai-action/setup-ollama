<p align="center">
  <img alt="Ollama" height="200" src="https://github.com/ai-action/assets/blob/master/logos/ollama.svg?raw=true">
</p>

# setup-ollama

[![version](https://img.shields.io/github/release/ai-action/setup-ollama)](https://github.com/ai-action/setup-ollama/releases)
[![build](https://github.com/ai-action/setup-ollama/actions/workflows/build.yml/badge.svg)](https://github.com/ai-action/setup-ollama/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/ai-action/setup-ollama/graph/badge.svg?token=AB3XFS8HYL)](https://codecov.io/gh/ai-action/setup-ollama)

🦙 Set up GitHub Actions workflow with [Ollama](https://github.com/ollama/ollama).

## Quick Start

```yaml
# .github/workflows/ollama.yml
name: ollama
on: push
jobs:
  ollama:
    runs-on: ubuntu-latest
    steps:
      - name: Setup Ollama
        uses: ai-action/setup-ollama@v2

      - name: Run model
        run: ollama run gemma4:e2b 'What model are you?'
```

## Usage

Install Ollama:

```yaml
- uses: ai-action/setup-ollama@v2
```

Run a prompt against a [model](https://ollama.com/library):

```yaml
- run: ollama run gemma4 "What's a large language model?"
```

Cache the model to speed up CI:

```yaml
- uses: actions/cache@v5
  with:
    path: ~/.ollama
    key: ${{ runner.os }}-ollama

- run: ollama run gemma4 'Define cache'
```

See [action.yml](action.yml).

## Inputs

### `version`

**Optional**: The CLI [version](https://github.com/ollama/ollama/releases). Defaults to [`0.30.8`](https://github.com/ollama/ollama/releases/tag/v0.30.8):

```yaml
- uses: ai-action/setup-ollama@v2
  with:
    version: 0.30.8
```

### `name`

**Optional**: The CLI name. Defaults to `ollama`:

```yaml
- uses: ai-action/setup-ollama@v2
  with:
    name: ollama
```

## FAQ

### zstd: Cannot exec: No such file or directory

If you get the error on a Linux self-hosted runner:

```
tar (child): zstd: Cannot exec: No such file or directory
tar (child): Error is not recoverable: exiting now
```

It means that [zstd](https://github.com/facebook/zstd) is not installed.

To fix this error, you can install `zstd`:

```yaml
- name: Install zstd
  run: apt-get update && apt-get install zstd
```

Or use Ollama version <[0.14.0](https://github.com/ollama/ollama/releases/tag/v0.14.0):

```yaml
- uses: ai-action/setup-ollama@v2
  with:
    version: 0.13.5
```

See [#423](https://github.com/ai-action/setup-ollama/issues/423).

## License

[MIT](LICENSE)
