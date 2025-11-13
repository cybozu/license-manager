import { vi } from "vitest";

export const createFsMock = async (): Promise<unknown> => {
  const memfs = await vi.importActual<typeof import("memfs")>("memfs");
  const actual = await vi.importActual<typeof import("fs")>("fs");
  return {
    default: {
      ...actual,
      existsSync: (path: string) => {
        if (path && path.toString().endsWith("license-manager.config.js")) {
          return actual.existsSync(path);
        }
        return memfs.fs.existsSync(path);
      },
      mkdirSync: memfs.fs.mkdirSync,
      writeFileSync: memfs.fs.writeFileSync,
    },
  };
};
