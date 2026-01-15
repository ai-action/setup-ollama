import { type ChildProcess, spawn } from 'node:child_process';
import os from 'node:os';

import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';
import { gte } from 'semver';

import { run } from '.';

jest.mock('@actions/core');
jest.mock('@actions/exec');
jest.mock('@actions/tool-cache');
jest.mock('node:child_process');
jest.mock('node:os');

const mockedCore = jest.mocked(core);
const mockedExec = jest.mocked(exec);
const mockedOs = jest.mocked(os);
const mockedSpawn = jest.mocked(spawn);
const mockedTc = jest.mocked(tc);

beforeEach(() => {
  jest.resetAllMocks();
});

const name = 'cli-name';
const pathToTarball = 'path/to/tarball';
const pathToCLI = 'path/to/cli';

describe.each([
  ['darwin', '0.14.0'],
  ['win32', '0.14.0'],
  ['linux', '0.13.5'],
  ['linux', '0.14.0'],
])('when platform is %p and version is %p', (platform, version) => {
  beforeEach(() => {
    mockedOs.platform.mockReturnValue(platform as NodeJS.Platform);
    mockedOs.arch.mockReturnValue('arm64');

    mockedCore.getInput.mockImplementation((input) => {
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
    mockedTc.downloadTool.mockResolvedValueOnce(pathToTarball);
    const isWin32 = platform === 'win32';
    const extract = isWin32 ? mockedTc.extractZip : mockedTc.extractTar;
    extract.mockResolvedValueOnce(pathToCLI);
    const unref = jest.fn();
    mockedSpawn.mockReturnValueOnce({ unref } as unknown as ChildProcess);

    await run();

    expect(mockedTc.downloadTool).toHaveBeenCalledWith(
      expect.stringContaining('https://ollama.com/download/ollama-'),
    );

    expect(extract).toHaveBeenCalledWith(
      pathToTarball,
      undefined,
      platform === 'linux' && gte(version, '0.14.0')
        ? ['--use-compress-program=zstd', '-x']
        : undefined,
    );

    const extension = isWin32 ? '.exe' : '';
    expect(mockedExec.exec).toHaveBeenCalledWith('mv', [
      `${binPath}/ollama${extension}`,
      cliPath + extension,
    ]);

    expect(mockedTc.cacheFile).toHaveBeenCalledWith(
      cliPath + extension,
      name + extension,
      name,
      version,
    );

    expect(mockedCore.addPath).toHaveBeenCalledWith(binPath);

    expect(mockedSpawn).toHaveBeenCalledWith(name, ['serve'], {
      detached: true,
      stdio: 'ignore',
    });
    expect(unref).toHaveBeenCalledTimes(1);
  });
});

describe('error', () => {
  it('throws error', async () => {
    const message = 'error';
    mockedCore.getInput.mockImplementationOnce(() => {
      throw new Error(message);
    });
    await run();
    expect(mockedCore.setFailed).toHaveBeenCalledWith(message);
  });
});
