import { Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { fetcher } from "../functions/fetcher";

// @ts-ignore
global.fetch = vi.fn();
// @ts-ignore
const mockFetch = global.fetch as Mock;

describe("fetcher", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("check call to clearTimeout function on success", async () => {
    mockFetch.mockImplementationOnce(() => Promise.resolve());
    const clearTimeoutMock = vi.spyOn(global, "clearTimeout");
    await fetcher("https://example.com");

    expect(clearTimeoutMock).toBeCalled();
  });

  it("check call to clearTimeout function on error", async () => {
    mockFetch.mockImplementationOnce(() => Promise.reject("reject"));
    const clearTimeoutMock = vi.spyOn(global, "clearTimeout");

    try {
      await fetcher("https://example.com");
    } catch {
      // do nothing
    }

    expect(clearTimeoutMock).toBeCalled();
  });
});
