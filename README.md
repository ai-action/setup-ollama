<p align="center">
  <img alt="Ollama" height="200" src="https://raw.githubusercontent.com/ai-action/assets/master/logos/ollama.svg">
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
        uses: ai-action/setup-ollama@v1

      - name: Run LLM
        run: ollama run llama3.2 'Explain the basics of machine learning.'
```

## Usage

Install Ollama:

```yaml
- uses: ai-action/setup-ollama@v1
```

Run a prompt against a [model](https://ollama.com/library):

```yaml
- run: ollama run tinyllama "What's a large language model?"
```

Cache the model to speed up CI:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.ollama
    key: ${{ runner.os }}-ollama

- run: ollama run tinyllama 'Define cache'
```

See [action.yml](action.yml).

## Inputs

### `version`

**Optional**: The CLI [version](https://github.com/ollama/ollama/releases). Defaults to [`0.13.5`](https://github.com/ollama/ollama/releases/tag/v0.13.5):

```yaml
- uses: ai-action/setup-ollama@v1
  with:
    version: 0.13.5
```

### `name`

**Optional**: The CLI name. Defaults to `ollama`:

```yaml
- uses: ai-action/setup-ollama@v1
  with:
    name: ollama
```

## License

[MIT](LICENSE)
