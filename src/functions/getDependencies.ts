import { exec as actualExec } from "node:child_process";
import { promisify } from "node:util";
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
  return Object.values(rawLicenses).flatMap((deps) =>
    deps.map<RawDependency>(({ name, license, version, path }) => ({ name, license, version, path }))
  );
};
