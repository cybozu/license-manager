import { analyze } from "@/analyze";
import { consoleMock } from "__tests__/helpers/consoleMock";
import { processMock } from "__tests__/helpers/processMock";
import pc from "picocolors";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { exec as actualExec } from "node:child_process";
import { promisify } from "node:util";

describe("analyze : managed-by-pnpm", () => {
  beforeAll(async () => {
    const exec = promisify(actualExec);
    // install local packages
    await exec(`pnpm i`, { cwd: __dirname });
  });
  beforeEach(() => {
    processMock(__dirname);
    consoleMock();
  });

  const analyzeDefaultOption = { packageManager: "pnpm", workspace: "", cwd: __dirname, query: "" };

  it("allow all licenses with allowLicense option", async () => {
    await analyze({
      ...analyzeDefaultOption,
      allowLicenses: ["MIT", "BSD", "Apache-2.0"],
      allowPackages: [],
    });

    expect(console.log).toBeCalledWith(pc.green("✅ All dependencies confirmed"));
  });

  it("allow all licenses with allowPackages option", async () => {
    await analyze({
      ...analyzeDefaultOption,
      allowLicenses: [],
      // In the case of pnpm, local packages do not have version information, so baz@1.2.3 cannot be tested.
      allowPackages: ["foo", "bar@*", "baz@*", "@dev/*"],
    });

    expect(console.log).toBeCalledWith(pc.green("✅ All dependencies confirmed"));
  });

  it("contains not allowed license", async () => {
    await expect(() =>
      analyze({
        ...analyzeDefaultOption,
        allowLicenses: ["MIT", "Apache-2.0"],
        allowPackages: [],
      })
    ).rejects.toThrowError("process.exit()");

    expect(console.error).toBeCalledWith(pc.red("🚨 Unconfirmed license found"));
    expect(console.error).toBeCalledWith([
      { name: "@dev/bar", license: "BSD" },
      { name: "bar", license: "BSD" },
    ]);
  });

  it("contains not allowed package", async () => {
    await expect(() =>
      analyze({
        ...analyzeDefaultOption,
        allowLicenses: [],
        allowPackages: ["foo", "baz", "@dev/foo", "@dev/bar@1.2.2", "@dev/baz"],
      })
    ).rejects.toThrowError("process.exit()");

    expect(console.error).toBeCalledWith(pc.red("🚨 Unconfirmed license found"));
    expect(console.error).toBeCalledWith([
      { name: "@dev/bar", license: "BSD" },
      { name: "bar", license: "BSD" },
    ]);
  });

  it("query option is not available", async () => {
    await expect(() =>
      analyze({
        ...analyzeDefaultOption,
        query: ":root > [name^=@dev/]",
        allowLicenses: [],
        allowPackages: ["@dev/*"],
      })
    ).rejects.toThrowError("query cannot be specified when the package manager is pnpm.");
  });
});
