import { ExtractArgs, extract } from "@/extract";
import { consoleMock } from "__tests__/helpers/consoleMock";
import { processMock } from "__tests__/helpers/processMock";
import { fs as memfs, vol } from "memfs";
import path from "path";
import pc from "picocolors";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("fs");

describe("extract : override-license-text", () => {
  beforeEach(() => {
    processMock(__dirname);
    consoleMock();
  });

  afterEach(() => {
    vol.reset();
  });

  const extractDefaultOption: ExtractArgs = {
    packageManager: "npm",
    workspace: "",
    cwd: __dirname,
    query: "",
    extractLicenses: [],
    excludePackages: [],
    output: "",
    json: false,
  };

  it("extract all licenses with overrideLicenseText option", async () => {
    await extract({ ...extractDefaultOption });

    const expectedOutputPath = path.resolve(__dirname, "licenses.txt");

    expect(console.log).toBeCalledWith(pc.green(`✅ Extracted to ${expectedOutputPath}`));

    expect(memfs.readFileSync(expectedOutputPath).toString("utf-8")).toMatchSnapshot();
  });
});
