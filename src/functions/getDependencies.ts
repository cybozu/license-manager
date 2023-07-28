import { exec as actualExec } from "node:child_process";
import { promisify } from "node:util";
import pc from "picocolors";
import { RawDependency } from "../types";

const exec = promisify(actualExec);

export const getDependencies = async (npmQueryString: string, cwd: string, workspace: string) => {
  const workspaceOption = workspace ? ` -ws ${workspace}` : "";
  const command = `npm query "${npmQueryString}"${workspaceOption}`;

  const { stdout, stderr } = await exec(command, { maxBuffer: 10000 * 1024, cwd: cwd || undefined });

  if (stderr) {
    console.warn(`🚨 ${pc.bgYellow("npm query : stderr")} ${stderr}`);
  }

  return JSON.parse(stdout) as RawDependency[];
};
