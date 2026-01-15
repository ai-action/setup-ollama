import { spawn } from 'node:child_process';
import path from 'node:path';

import { addPath, getInput, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import {
  cacheFile,
  downloadTool,
  extractTar,
  extractZip,
  find,
} from '@actions/tool-cache';

import { getBinaryPath, getDownloadObject, hasZst } from './utils';

const TOOL_NAME = 'ollama';

export async function run() {
  try {
    // Get the version and name of the tool to be installed
    const version = getInput('version');
    const name = getInput('name');

    // Find previously cached directory (if applicable)
    let binaryPath = find(name, version);
    const isCached = Boolean(binaryPath);

    /* istanbul ignore else */
    if (!isCached) {
      // Download the specific version of the tool (e.g., tarball/zipball)
      const download = getDownloadObject(version);
      const pathToTarball = await downloadTool(download.url);

      // Extract the tarball/zipball onto the host runner
      const extract = download.url.includes('.zip') ? extractZip : extractTar;
      const extractDirectory = await extract(
        pathToTarball,
        undefined,
        hasZst(version) ? ['--use-compress-program=zstd', '-x'] : undefined,
      );

      // Get the binary
      const binaryDirectory = path.join(
        extractDirectory,
        download.binaryDirectory,
      );
      binaryPath = getBinaryPath(binaryDirectory, name);

      // Rename the binary
      /* istanbul ignore else */
      if (name !== TOOL_NAME) {
        await exec('mv', [
          getBinaryPath(binaryDirectory, TOOL_NAME),
          binaryPath,
        ]);
      }
    }

    // Expose the tool by adding it to the PATH
    addPath(path.dirname(binaryPath));

    // Start the Ollama server in the background
    const subprocess = spawn(name, ['serve'], {
      detached: true,
      stdio: 'ignore',
    });
    subprocess.unref();

    // Cache the tool
    /* istanbul ignore else */
    if (!isCached) {
      const filename = getBinaryPath('', name);
      await cacheFile(binaryPath, filename, name, version);
    }
  } catch (error) {
    setFailed((error as Error).message);
  }
}

run();
