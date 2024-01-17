import { Config, Dependency } from "../types";
import { getLicense, isMatchPackage } from "./depsUtils";
import { getDependenciesForNpm, getDependenciesForPnpm } from "./getDependencies";
import { getApacheNotice, getLicenseText } from "./getLicenseText";

export const aggregate = async (
  packageManager: string,
  query: string,
  cwd: string,
  workspace: string,
  unreadLicenseTextPattern: Array<string | RegExp>,
  config: Config
): Promise<Dependency[]> => {
  let deps;
  if (packageManager === "pnpm") {
    if (![":root *", ":root .prod"].includes(query))
      throw new Error("query cannot be specified when the package manager is pnpm.");
    const option = query.includes(".prod") ? "-P" : "";
    deps = await getDependenciesForPnpm(option, cwd, workspace);
  } else {
    deps = await getDependenciesForNpm(query, cwd, workspace);
  }

  return Promise.all(
    deps.map(async (dep: any): Promise<Dependency> => {
      const license = getLicense(dep, config.overrideLicense);
      const unreadLicenseText = unreadLicenseTextPattern.some((pattern) => isMatchPackage(dep, pattern));
      const licenseTextData = unreadLicenseText ? null : await getLicenseText(dep, config.overrideLicenseText);
      const apacheNotice = !unreadLicenseText && license === "Apache-2.0" ? getApacheNotice(dep) : null;

      return {
        ...dep,
        license,
        ...(licenseTextData || {}),
        ...(apacheNotice || {}),
      };
    })
  );
};
