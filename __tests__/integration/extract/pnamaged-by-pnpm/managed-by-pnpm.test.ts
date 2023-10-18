import { ExtractArgs, extract } from "@/extract";
import { consoleMock } from "__tests__/helpers/consoleMock";
import { processMock } from "__tests__/helpers/processMock";
import { fs as memfs, vol } from "memfs";
import path from "path";
import pc from "picocolors";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { promisify } from "node:util";
import { exec as actualExec } from "node:child_process";

vi.mock("fs");

describe("extract : managed-by-pnpm", () => {
  beforeAll(async () => {
    const exec = promisify(actualExec);
    // install local packages
    await exec(`pnpm i`, { cwd: __dirname });
  });
  beforeEach(() => {
    processMock(__dirname);
    consoleMock();
  });

  afterEach(() => {
    vol.reset();
  });

  const extractDefaultOption: ExtractArgs = {
    packageManager: "pnpm",
    workspace: "",
    cwd: __dirname,
    query: "",
    extractLicenses: [],
    excludePackages: [],
    output: "",
    json: false,
  };

  it("extract all licenses", async () => {
    await extract({ ...extractDefaultOption });

    const expectedOutputPath = path.resolve(__dirname, "licenses.txt");

    expect(console.log).toBeCalledWith(pc.green(`✅ Extracted to ${expectedOutputPath}`));

    expect(memfs.readFileSync(expectedOutputPath).toString("utf-8")).toMatchSnapshot();
  });

  it("extract specified licenses", async () => {
    await extract({
      ...extractDefaultOption,
      extractLicenses: ["MIT", "Apache-2.0"],
    });

    const expectedOutputPath = path.resolve(__dirname, "licenses.txt");

    expect(console.log).toBeCalledWith(pc.green(`✅ Extracted to ${expectedOutputPath}`));

    expect(memfs.readFileSync(expectedOutputPath).toString("utf-8")).toMatchSnapshot();
  });

  it("extract licenses by excluding specified packages", async () => {
    await extract({
      ...extractDefaultOption,
      excludePackages: ["baz"],
    });

    const expectedOutputPath = path.resolve(__dirname, "licenses.txt");

    expect(console.log).toBeCalledWith(pc.green(`✅ Extracted to ${expectedOutputPath}`));

    expect(memfs.readFileSync(expectedOutputPath).toString("utf-8")).toMatchSnapshot();
  });

  it("query option is not available", async () => {
    await expect(() =>
      extract({
        ...extractDefaultOption,
        query: ":root > [name^=@dev/]",
      })
    ).rejects.toThrowError("query cannot be specified when the package manager is pnpm.");
  });

  it("output in json format", async () => {
    await extract({
      ...extractDefaultOption,
      json: true,
    });

    const expectedOutputPath = path.resolve(__dirname, "licenses.json");

    expect(console.log).toBeCalledWith(pc.green(`✅ Extracted to ${expectedOutputPath}`));

    const json = JSON.parse(memfs.readFileSync(expectedOutputPath).toString("utf-8"));

    const matchPattern = expect.objectContaining({
      name: expect.any(String),
      license: expect.any(String),
      path: expect.any(String),
      licenseTextPath: expect.any(String),
      licenseText: expect.any(String),
      // In the case of pnpm, local packages do not have version information, it does not have `version:`
    });

    expect(json[0]).toMatchObject(matchPattern);
    expect(json[1]).toMatchObject(matchPattern);
    expect(json[2]).toMatchObject(matchPattern);
  });
});
