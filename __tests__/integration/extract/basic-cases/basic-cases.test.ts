import { ExtractArgs, extract } from "@/extract";
import { consoleMock } from "__tests__/helpers/consoleMock";
import { processMock } from "__tests__/helpers/processMock";
import { fs as memfs, vol } from "memfs";
import path from "path";
import pc from "picocolors";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("fs");

describe("extract : basic-cases", () => {
  beforeEach(() => {
    processMock(__dirname);
    consoleMock();
  });

  afterEach(() => {
    vol.reset();
  });

  const extractDefaultOption: ExtractArgs = {
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

  it("license text not found in some packages", async () => {
    await expect(() =>
      extract({
        ...extractDefaultOption,
        query: ":root > [name^=@invalid/]",
      })
    ).rejects.toThrowError("process.exit()");

    const expectedOutputPath = path.resolve(__dirname, "licenses.txt");

    expect(console.error).toBeCalledWith(pc.red("🚨 License text not found"));
    expect(console.error).toBeCalledWith(pc.red("@invalid/baz@1.2.3"));
    expect(console.error).toBeCalledWith(pc.red("@invalid/foo@1.2.3"));

    expect(memfs.existsSync(expectedOutputPath)).toBe(false);
  });

  it("can specify query", async () => {
    await extract({
      ...extractDefaultOption,
      query: ":root > [name^=@dev/]",
    });

    const expectedOutputPath = path.resolve(__dirname, "licenses.txt");

    expect(console.log).toBeCalledWith(pc.green(`✅ Extracted to ${expectedOutputPath}`));

    expect(memfs.readFileSync(expectedOutputPath).toString("utf-8")).toMatchSnapshot();
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
      version: expect.any(String),
      license: expect.any(String),
      path: expect.any(String),
      realpath: expect.any(String),
      licenseTextPath: expect.any(String),
      licenseText: expect.any(String),
    });

    expect(json[0]).toMatchObject(matchPattern);
    expect(json[1]).toMatchObject(matchPattern);
    expect(json[2]).toMatchObject(matchPattern);
  });
});
