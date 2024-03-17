import { analyze } from "@/analyze";
import { consoleMock } from "__tests__/helpers/consoleMock";
import { processMock } from "__tests__/helpers/processMock";
import pc from "picocolors";
import { beforeEach, describe, expect, it } from "vitest";

describe("analyze : override-licenses", () => {
  beforeEach(() => {
    processMock(__dirname);
    consoleMock();
  });

  const analyzeDefaultOption = { packageManager: "npm", workspace: "", cwd: __dirname, query: "" };

  it("allow all licenses with allowLicense and overrideLicense options", async () => {
    await analyze({
      ...analyzeDefaultOption,
      allowLicenses: ["FOO_LICENSE", "BAR_LICENSE", "BAZ_LICENSE"],
      allowPackages: [],
    });

    expect(console.log).toBeCalledWith(pc.green("✅ All dependencies confirmed"));
    expect(console.log).toBeCalledWith("💡 Detected license-manager.config.js");
  });

  it("apply specified config file", async () => {
    await analyze({
      ...analyzeDefaultOption,
      allowLicenses: ["OVERRIDE_LICENSE"],
      allowPackages: [],
      configFilePath: "awesome-config.js",
    });

    expect(console.log).toBeCalledWith(pc.green("✅ All dependencies confirmed"));
    expect(console.log).toBeCalledWith("💡 Detected awesome-config.js");
    expect(console.log).toBeCalledWith("load awesome-config.js");
  });
});
