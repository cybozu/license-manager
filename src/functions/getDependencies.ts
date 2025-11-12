import { exec as actualExec } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import pc from "picocolors";
import { RawDependency, RawPnpmLicenses } from "../types";

const exec = promisify(actualExec);

export const getDependenciesForNpm = async (npmQueryString: string, cwd: string, workspace: string) => {
  const workspaceOption = workspace ? ` -ws ${workspace}` : "";
  const command = `npm query "${npmQueryString}"${workspaceOption}`;

  const { stdout, stderr } = await exec(command, { maxBuffer: 10000 * 1024, cwd: cwd || undefined });

  if (stderr) {
    console.warn(`🚨 ${pc.bgYellow("npm query : stderr")} ${stderr}`);
  }

  return JSON.parse(stdout) as RawDependency[];
};

export const getDependenciesForPnpm = async (option: string, cwd: string, workspace: string) => {
  const workspaceOption = workspace ? ` --filter ${workspace}` : "";
  const command = `pnpm licenses list --json ${option}${workspaceOption}`;

  const { stdout, stderr } = await exec(command, { maxBuffer: 10000 * 1024, cwd: cwd || undefined });

  if (stderr) {
    console.warn(`🚨 ${pc.bgYellow("pnpm license list : stderr")} ${stderr}`);
  }

  const rawLicenses = JSON.parse(stdout) as RawPnpmLicenses;
  const promises = Object.values(rawLicenses).flatMap((deps) =>
    deps.flatMap<Promise<RawDependency>>((dep) => {
      const { name, license } = dep;

      if ("paths" in dep) {
        const { versions } = dep;
        return dep.paths.map(async (path, index) => {
          const { author, repository } = await getPackageJsonFields(path);
          return {
            name,
            license,
            version: versions[index],
            path,
            ...(author && { author }),
            ...(repository && { repository }),
          };
        });
      }

      return [
        (async () => {
          const { author, repository } = await getPackageJsonFields(dep.path);
          return {
            name,
            license,
            version: dep.version,
            path: dep.path,
            ...(author && { author }),
            ...(repository && { repository }),
          };
        })(),
      ];
    }),
  );

  return Promise.all(promises);
};

const getPackageJsonFields = async (
  packagePath: string,
): Promise<{ author?: RawDependency["author"]; repository?: RawDependency["repository"] }> => {
  const packageJsonPath = join(packagePath, "package.json");

  try {
    const packageJsonContent = await readFile(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);
    return {
      author: packageJson.author,
      repository: packageJson.repository,
    };
  } catch (error) {
    // If we can't read the package.json, just skip adding author and repository
    return { author: undefined, repository: undefined };
  }
};
