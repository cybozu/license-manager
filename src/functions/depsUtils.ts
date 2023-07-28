import { Config, Dependency } from "./../types";

export const getLicense = (dep: Dependency, overrideLicense?: Config["overrideLicense"]) => {
  if (overrideLicense) {
    const result = overrideLicense(dep);
    if (result) return result;
  }
  if (typeof dep.license === "string") return dep.license;
  if (typeof dep.license === "object") return dep.license.type;
  return "";
};

export const isMatchLicense = (dep: Dependency, licensePattern: string | RegExp) => {
  const depLicense = getLicense(dep);

  if (licensePattern instanceof RegExp) {
    return licensePattern.test(depLicense);
  }

  return depLicense === licensePattern.trim();
};

export const isMatchPackage = (dep: Dependency, packagePattern: string | RegExp) => {
  if (packagePattern instanceof RegExp) {
    return packagePattern.test(`${dep.name}@${dep.version}`);
  }

  let [, version = ""] = removeScopePrefix(packagePattern).split("@");
  version = version.trim();

  if (!isMatchName(dep, packagePattern)) return false;

  if (!version || isMatchVersion(dep, version)) return true;

  return false;
};

export const isMatchName = (dep: Dependency, comparePackageName: string) => {
  const depName = removeScopePrefix(dep.name);
  let [name = ""] = removeScopePrefix(comparePackageName).split("@");
  name = name.trim();

  const isStrictNameMatched = name === depName;
  const isScopeMatched = name.endsWith("/*") && depName.startsWith(name.substring(0, name.length - 2));

  return isStrictNameMatched || isScopeMatched;
};

export const isMatchVersion = (dep: Dependency, compareVersion: string) => {
  return compareVersion === "*" || compareVersion === "all" || dep.version === compareVersion;
};

const removeScopePrefix = (packagePattern: string) => {
  return packagePattern.startsWith("@") ? packagePattern.substring(1) : packagePattern;
};
