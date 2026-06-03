import { type ChildProcess } from 'node:child_process';
import type os from 'node:os';

import type * as core from '@actions/core';
import type * as execModule from '@actions/exec';
import type * as tc from '@actions/tool-cache';
import type { Mocked, MockedFunction } from 'vitest';

const name = 'cli-name';
const pathToTarball = 'path/to/tarball';
const pathToCLI = 'path/to/cli';

vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

vi.mock('node:os', () => ({
  platform: vi.fn(),
  arch: vi.fn(),
}));

vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
  addPath: vi.fn(),
  setFailed: vi.fn(),
}));

vi.mock('@actions/exec', () => ({
  exec: vi.fn(),
}));

vi.mock('@actions/tool-cache', () => ({
  cacheFile: vi.fn(),
  downloadTool: vi.fn(),
  extractTar: vi.fn(),
  extractZip: vi.fn(),
  find: vi.fn(),
}));

const { run } = await import('.');
const { spawn } = await import('node:child_process');
const mockedOs = (await import('node:os')) as unknown as Mocked<typeof os>;

const { getInput, addPath, setFailed } =
  (await import('@actions/core')) as unknown as {
    getInput: MockedFunction<(typeof core)['getInput']>;
    addPath: MockedFunction<(typeof core)['addPath']>;
    setFailed: MockedFunction<(typeof core)['setFailed']>;
  };

const { exec } = (await import('@actions/exec')) as unknown as {
  exec: MockedFunction<typeof execModule.exec>;
};

const { cacheFile, downloadTool, extractTar, extractZip, find } =
  (await import('@actions/tool-cache')) as unknown as {
    cacheFile: MockedFunction<(typeof tc)['cacheFile']>;
    downloadTool: MockedFunction<(typeof tc)['downloadTool']>;
    extractTar: MockedFunction<(typeof tc)['extractTar']>;
    extractZip: MockedFunction<(typeof tc)['extractZip']>;
    find: MockedFunction<(typeof tc)['find']>;
  };

beforeEach(() => {
  vi.clearAllMocks();
  find.mockReturnValue('');
});

describe.each([
  ['darwin', '0.14.0'],
  ['win32', '0.14.0'],
  ['linux', '0.13.5'],
  ['linux', '0.14.0'],
])('when platform is %p and version is %p', (platform, version) => {
  beforeEach(() => {
    mockedOs.platform.mockReturnValue(platform as NodeJS.Platform);
    mockedOs.arch.mockReturnValue('arm64');

    getInput.mockImplementation((input: string) => {
      switch (input) {
        case 'version':
          return version;
        case 'name':
          return name;
        default:
          // eslint-disable-next-line no-console
          console.error(`Invalid input: ${input}`);
          return '';
      }
    });
  });

  const binPath = platform === 'linux' ? `${pathToCLI}/bin` : pathToCLI;
  const cliPath = `${binPath}/${name}`;

  it('downloads, extracts, and adds CLI to PATH', async () => {
    downloadTool.mockResolvedValueOnce(pathToTarball);
    const isWin32 = platform === 'win32';
    const extract = isWin32 ? extractZip : extractTar;
    extract.mockResolvedValueOnce(pathToCLI);
    const unref = vi.fn();
    (spawn as unknown as MockedFunction<typeof spawn>).mockReturnValueOnce({
      unref,
    } as unknown as ChildProcess);

    await run();

    expect(downloadTool).toHaveBeenCalledWith(
      expect.stringContaining('https://ollama.com/download/ollama-'),
    );

    const semver = await import('semver');
    expect(extract).toHaveBeenCalledWith(
      pathToTarball,
      undefined,
      platform === 'linux' && semver.gte(version, '0.14.0')
        ? ['--use-compress-program=zstd', '-x']
        : undefined,
    );

    const extension = isWin32 ? '.exe' : '';
    expect(exec).toHaveBeenCalledWith('mv', [
      `${binPath}/ollama${extension}`,
      cliPath + extension,
    ]);

    expect(cacheFile).toHaveBeenCalledWith(
      cliPath + extension,
      name + extension,
      name,
      version,
    );

    expect(addPath).toHaveBeenCalledWith(binPath);

    expect(spawn).toHaveBeenCalledWith(name, ['serve'], {
      detached: true,
      stdio: 'ignore',
    });
    expect(unref).toHaveBeenCalledTimes(1);
  });
});

describe('error', () => {
  it('throws error', async () => {
    const message = 'error';
    getInput.mockImplementationOnce(() => {
      throw new Error(message);
    });
    await run();
    expect(setFailed).toHaveBeenCalledWith(message);
  });
});
