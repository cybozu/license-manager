import { Config, Dependency } from "../types";
import { getLicense, isMatchPackage } from "./depsUtils";
import { getDependencies } from "./getDependencies";
import { getApacheNotice, getLicenseText } from "./getLicenseText";

export const aggregate = async (
  query: string,
  cwd: string,
  workspace: string,
  unreadLicenseTextPattern: Array<string | RegExp>,
  config: Config
): Promise<Dependency[]> => {
  const deps = await getDependencies(query, cwd, workspace);

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
