import os from 'node:os';

import { getBinaryPath, getDownloadObject, hasZst } from './utils';

jest.mock('node:os');
const mockedOs = jest.mocked(os);

const platforms = ['darwin', 'linux', 'win32'] as const;
const architectures = ['arm64', 'x64'] as const;

const cases = platforms.reduce(
  (testSuites, platform) => [
    ...testSuites,
    ...architectures.map(
      (arch) => [platform, arch] as [NodeJS.Platform, NodeJS.Architecture],
    ),
  ],
  [] as [NodeJS.Platform, NodeJS.Architecture][],
);

describe.each(['0.13.5', '0.14.0'])('getDownloadObject', (version) => {
  describe.each(cases)(
    'when platform is %p and arch is %p',
    (platform, arch) => {
      beforeEach(() => {
        jest.resetAllMocks();
        mockedOs.platform.mockReturnValue(platform as NodeJS.Platform);
        mockedOs.arch.mockReturnValueOnce(arch);
      });

      it('gets download object', () => {
        expect(getDownloadObject(version)).toMatchSnapshot();
      });
    },
  );
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

describe('hasZst', () => {
  const cases = [
    ['0.13.5', 'darwin', false],
    ['0.13.5', 'linux', false],
    ['0.13.5', 'win32', false],
    ['0.14.0', 'darwin', false],
    ['0.14.0', 'linux', true],
    ['0.14.0', 'win32', false],
    ['0.14.1', 'darwin', false],
    ['0.14.1', 'linux', true],
    ['0.14.1', 'win32', false],
    ['1.0.0', 'darwin', false],
    ['1.0.0', 'linux', true],
    ['1.0.0', 'win32', false],
  ] as const;

  describe.each(cases)('when OS is %p', (version, os, expected) => {
    beforeEach(() => {
      jest.resetAllMocks();
      mockedOs.platform.mockReturnValueOnce(os);
    });

    it('returns boolean', () => {
      expect(hasZst(version)).toBe(expected);
    });
  });
});
