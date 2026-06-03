import type os from 'node:os';

import type { Mocked } from 'vitest';

vi.mock('node:os', () => ({
  platform: vi.fn(),
  arch: vi.fn(),
}));

const { getBinaryPath, getDownloadObject, hasZst } = await import('./utils');

const mockedOs = (await import('node:os')) as unknown as Mocked<typeof os>;

const platforms = ['darwin', 'linux', 'win32'] as const;
const architectures = ['arm64', 'x64'] as const;

const cases = platforms.reduce<[NodeJS.Platform, NodeJS.Architecture][]>(
  (testSuites, platform) => [
    ...testSuites,
    ...architectures.map(
      (arch) => [platform, arch] as [NodeJS.Platform, NodeJS.Architecture],
    ),
  ],
  [],
);

describe.each(['0.13.5', '0.14.0'])('getDownloadObject', (version) => {
  describe.each(cases)(
    'when platform is %s and arch is %s',
    (platform, arch) => {
      beforeEach(() => {
        vi.clearAllMocks();
        mockedOs.platform.mockReturnValue(platform);
        mockedOs.arch.mockReturnValueOnce(arch);
      });

      it('gets download object', () => {
        expect(getDownloadObject(version)).toMatchSnapshot();
      });
    },
  );
});

describe('getBinaryPath', () => {
  describe.each(platforms)('when OS is %s', (osPlatform) => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockedOs.platform.mockReturnValueOnce(osPlatform);
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

  describe.each(cases)('when OS is %s', (version, os, expected) => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockedOs.platform.mockReturnValueOnce(os);
    });

    it('returns boolean', () => {
      expect(hasZst(version)).toBe(expected);
    });
  });
});
