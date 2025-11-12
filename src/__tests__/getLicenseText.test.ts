import glob from "glob";
import pc from "picocolors";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Dependency } from "../types";
import * as fetcher from "./../functions/fetcher";
import { getLicenseText } from "./../functions/getLicenseText";

const deps = (obj: Partial<Dependency>) => obj as Dependency;

describe("getLicenseText", () => {
  const dep = deps({ path: "/foo/bar", name: "dummy-library", version: "1.0" });

  it("verify invalid dep", async () => {
    await expect(getLicenseText(deps({}))).rejects.toThrow(/^invalid dep: .*/);
  });

  it("executing the subsequent process", async () => {
    const globSyncSpy = vi.spyOn(glob, "sync").mockReturnValue([]);
    await getLicenseText(dep);
    expect(globSyncSpy).toBeCalledTimes(1);
  });

  it("verify override license text", async () => {
    expect(await getLicenseText(dep, () => ({ licenseText: "override" }))).toEqual({
      licenseText: "override",
    });
    expect(await getLicenseText(dep, () => ({ licenseText: undefined }))).toBe(null);
  });

  it("verify override license page url", async () => {
    type Response = Awaited<ReturnType<typeof fetch>>;
    vi.spyOn(glob, "sync").mockReturnValue([]);

    // license page url is undefined
    expect(await getLicenseText(dep, () => ({ licensePageUrl: undefined }))).toBe(null);

    // license page is successfully loaded
    const spyLog = vi.spyOn(console, "log");
    vi.spyOn(fetcher, "fetcher").mockResolvedValueOnce({
      ok: true,
      text: () => "override",
    } as Extract<Response, "ok" | "text">);

    expect(await getLicenseText(dep, () => ({ licensePageUrl: "override-url" }))).toEqual({
      licenseText: "override",
    });
    expect(spyLog).toHaveBeenCalledWith(
      pc.green("✅ dummy-library@1.0 license page override-url was successfully loaded"),
    );
    spyLog.mockRestore();

    // license page not found
    const spyErrorLog = vi.spyOn(console, "error");
    vi.spyOn(fetcher, "fetcher").mockResolvedValueOnce({
      ok: false,
      text: () => "override",
    } as Extract<Response, "ok" | "text">);

    expect(await getLicenseText(dep, () => ({ licensePageUrl: "override-url" }))).toBe(null);
    expect(spyErrorLog).toHaveBeenCalledWith(pc.red("dummy-library@1.0 license page override-url not found"));
    spyErrorLog.mockReset();

    // license page not accessed
    vi.spyOn(fetcher, "fetcher").mockRejectedValueOnce({});
    expect(await getLicenseText(dep, () => ({ licensePageUrl: "override-url" }))).toBe(null);
    expect(spyErrorLog).toHaveBeenCalledWith(pc.red("dummy-library@1.0 license page override-url not accessed"));
    spyErrorLog.mockRestore();
  });
});
