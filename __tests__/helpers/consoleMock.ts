import { vi } from "vitest";

export const consoleMock = () => {
  const mock = {
    log: vi.fn(),
    error: vi.fn(),
  } as unknown as Console;

  vi.spyOn(console, "log").mockImplementation(mock.log);
  vi.spyOn(console, "error").mockImplementation(mock.error);

  return mock;
};
