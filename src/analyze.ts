import pc from "picocolors";
import { aggregate } from "./functions/aggregate";
import { getLicense, isMatchLicense, isMatchPackage } from "./functions/depsUtils";
import { loadConfigScript } from "./functions/loadConfigScript";
import { Config, Dependency } from "./types";
import { detectPackageManager } from "./functions/detectPackageManager";

export type AnalyzeArgs = {
  workspace: string;
  query: string;
  cwd: string;
  allowLicenses: Array<string | RegExp>;
  allowPackages: Array<string | RegExp>;
  packageManager: string;
};

export const analyze = async (cliArgs: AnalyzeArgs) => {
  console.log("🔎 Analyzing dependencies...");

  const config = await loadConfigScript();
  const args = mergeConfig(cliArgs, config);
  const unreadLicenseTextPattern = [/.*/];
  const dependencies = await aggregate(
    args.packageManager,
    args.query,
    args.cwd,
    args.workspace,
    unreadLicenseTextPattern,
    config
  );

  const errors: Array<{ name: string; license: string }> = [];

  dependencies.forEach((dep: Dependency) => {
    if (!isAllowLicense(dep, args)) {
      errors.push({
        name: dep.name,
        license: getLicense(dep),
      });
    }
  });

  if (errors.length) {
    console.error(pc.red("🚨 Unconfirmed license found"));
    console.error(errors);
    process.exit(1);
  }

  console.log(pc.green("✅ All dependencies confirmed"));
};

const mergeConfig = (args: AnalyzeArgs, config: Partial<Config>): AnalyzeArgs => {
  return {
    query: args.query || config.analyze?.query || ":root *",
    cwd: args.cwd || config.cwd || "",
    workspace: args.workspace || config.workspace || "",
    allowLicenses: [...args.allowLicenses, ...(config.analyze?.allowLicenses || [])],
    allowPackages: [...args.allowPackages, ...(config.analyze?.allowPackages || [])],
    packageManager: args.packageManager || config.packageManager || detectPackageManager(),
  };
};

const isAllowLicense = (dep: Dependency, args: AnalyzeArgs): boolean => {
  if (args.allowLicenses.some((pattern) => isMatchLicense(dep, pattern))) return true;

  const isMatchAllowPack = args.allowPackages.find((allowPack) => {
    return isMatchPackage(dep, allowPack);
  });

  if (isMatchAllowPack) return true;

  return false;
};
