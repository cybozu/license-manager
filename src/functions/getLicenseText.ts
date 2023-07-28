import fs from "fs";
import glob from "glob";
import pc from "picocolors";
import { Config, Dependency } from "../types";
import { fetcher } from "./fetcher";

export const getLicenseText = async (
  dep: Dependency,
  overrideLicenseText?: Config["overrideLicenseText"]
): Promise<{
  licenseText: string;
  licenseTextPath?: string;
} | null> => {
  const depPath = dep.path;

  if (!depPath) {
    throw new Error("invalid dep: " + dep);
  }

  if (overrideLicenseText) {
    const result = overrideLicenseText(dep);

    if (typeof result === "string") return { licenseText: result };

    if (result !== undefined && "licenseText" in result) {
      return result.licenseText === undefined ? null : { licenseText: result.licenseText };
    }

    if (result !== undefined && "licensePageUrl" in result) {
      const licensePageUrl = result.licensePageUrl;
      if (licensePageUrl === undefined) return null;

      try {
        const res = await fetcher(licensePageUrl);
        if (res.ok) {
          console.log(pc.green(`✅ ${dep.name}@${dep.version} license page ${licensePageUrl} was successfully loaded`));
          const licenseText = await res.text();
          return { licenseText };
        }
        console.error(pc.red(`${dep.name}@${dep.version} license page ${licensePageUrl} not found`));
        return null;
      } catch (e) {
        console.error(pc.red(`${dep.name}@${dep.version} license page ${licensePageUrl} not accessed`));
        return null;
      }
    }
  }

  // TODO: read the file specified by "SEE LICENSE IN"
  const licensePattern = `${depPath}/LICEN@(S|C)E?(.*)`;

  const res = glob.sync(licensePattern, { nocase: true });
  if (res.length) {
    return {
      licenseTextPath: res[0],
      licenseText: readFile(res[0]),
    };
  }

  return null;
};

export const getApacheNotice = (
  dep: Dependency
): {
  apacheNotice: string;
  apacheNoticePath?: string;
} | null => {
  const depPath = dep.path;

  if (!depPath) {
    throw new Error("invalid dep: " + dep);
  }

  const noticePattern = `${depPath}/NOTICE?(.*)`;

  const res = glob.sync(noticePattern, { nocase: true });
  if (res.length) {
    return {
      apacheNoticePath: res[0],
      apacheNotice: readFile(res[0]),
    };
  }

  return null;
};

const readFile = (licensePath: string) => {
  const text = fs.readFileSync(licensePath).toString("utf-8");
  return text.replace(/\r\n/g, "\n");
};
