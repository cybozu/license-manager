import { vi } from "vitest";

export const processMock = (dirname: string) => {
  const mock = {
    cwd: vi.fn(() => dirname),
    exit: vi.fn(() => {
      throw new Error("process.exit()");
    }),
  } as unknown as NodeJS.Process;

  vi.spyOn(process, "cwd").mockImplementation(mock.cwd);
  vi.spyOn(process, "exit").mockImplementation(mock.exit);

  return mock;
};
