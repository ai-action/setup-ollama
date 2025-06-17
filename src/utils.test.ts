import os from 'os';

import { getBinaryPath, getDownloadObject } from './utils';

jest.mock('os');
const mockedOs = jest.mocked(os);

const platforms = ['darwin', 'linux', 'win32'] as const;
const architectures = ['arm64', 'x64'] as const;

const table = platforms.reduce(
  (testSuites, os) => [
    ...testSuites,
    ...architectures.map((arch) => [os, arch] as [string, NodeJS.Architecture]),
  ],
  [] as [string, NodeJS.Architecture][],
);

describe('getDownloadObject', () => {
  describe.each(table)('when OS is %p and arch is %p', (os, arch) => {
    const version = '0.5.10';

    beforeEach(() => {
      jest.resetAllMocks();
      mockedOs.platform.mockReturnValueOnce(os as NodeJS.Platform);
      mockedOs.arch.mockReturnValueOnce(arch);
    });

    it('gets download object', () => {
      expect(getDownloadObject(version)).toMatchSnapshot();
    });
  });
});

describe('getBinaryPath', () => {
  describe.each(platforms)('when OS is %p', (os) => {
    beforeEach(() => {
      jest.resetAllMocks();
      mockedOs.platform.mockReturnValueOnce(os);
    });

    it('returns CLI filepath', () => {
      const directory = 'directory';
      const name = 'name';
      expect(getBinaryPath(directory, name)).toMatchSnapshot();
    });
  });
});
