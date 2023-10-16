import { analyze } from "@/analyze";
import { consoleMock } from "__tests__/helpers/consoleMock";
import { processMock } from "__tests__/helpers/processMock";
import pc from "picocolors";
import { beforeEach, describe, expect, it } from "vitest";

describe("analyze : basic-cases", () => {
  beforeEach(() => {
    processMock(__dirname);
    consoleMock();
  });

  const analyzeDefaultOption = { packageManager: "npm", workspace: "", cwd: __dirname, query: "" };

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
      allowPackages: ["foo", "bar@*", "baz@1.2.3", "@dev/*"],
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

  it("can specify query", async () => {
    await analyze({
      ...analyzeDefaultOption,
      query: ":root > [name^=@dev/]",
      allowLicenses: [],
      allowPackages: ["@dev/*"],
    });

    expect(console.log).toBeCalledWith(pc.green("✅ All dependencies confirmed"));
  });
});
