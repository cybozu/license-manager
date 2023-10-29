import fs from "fs";
import path from "path";
import pc from "picocolors";
import { aggregate } from "./functions/aggregate";
import { isMatchLicense, isMatchPackage } from "./functions/depsUtils";
import { loadConfigScript } from "./functions/loadConfigScript";
import { Config, Dependency } from "./types";
import { detectPackageManager } from "./functions/detectPackageManager";

export type ExtractArgs = {
  workspace: string;
  query: string;
  cwd: string;
  extractLicenses: Array<string | RegExp>;
  excludePackages: Array<string | RegExp>;
  output: string;
  json: boolean;
  packageManager: string;
};

export const extract = async (cliArgs: ExtractArgs) => {
  console.log("🔪 Extract licenses...");

  const config = await loadConfigScript();
  const args = mergeConfig(cliArgs, config);
  const dependencies = await aggregate(
    args.packageManager,
    args.query,
    args.cwd,
    args.workspace,
    args.excludePackages,
    config
  );

  const targetDependencies = dependencies.filter((dep) => {
    if (args.extractLicenses.length && !args.extractLicenses.some((pattern) => isMatchLicense(dep, pattern))) {
      return false;
    }
    if (args.excludePackages.some((pkg) => isMatchPackage(dep, pkg))) {
      return false;
    }
    return true;
  });

  // check license text
  const licenseNotFoundDeps = targetDependencies
    .filter((dep) => !dep.licenseText)
    .map((dep) => `${dep.name}@${dep.version}`);

  if (licenseNotFoundDeps.length) {
    console.error(pc.red("🚨 License text not found"));
    licenseNotFoundDeps.forEach((txt) => {
      console.error(pc.red(txt));
    });
    process.exit(1);
  }

  let writeFilePath;
  if (args.json) {
    writeFilePath = outputDepsAsJSON(targetDependencies, args.output);
  } else {
    writeFilePath = outputDepsAsText(targetDependencies, args.output);
  }

  console.log(pc.green(`✅ Extracted to ${writeFilePath}`));
};

const mergeConfig = (args: ExtractArgs, config: Partial<Config>): ExtractArgs => {
  return {
    query: args.query || config.extract?.query || ":root .prod",
    cwd: args.cwd || config.cwd || "",
    workspace: args.workspace || config.workspace || "",
    extractLicenses: [...args.extractLicenses, ...(config.extract?.extractLicenses || [])],
    excludePackages: [...args.excludePackages, ...(config.extract?.excludePackages || [])],
    output: args.output || config.extract?.output || "",
    json: args.json || config.extract?.format === "json",
    packageManager: args.packageManager || config.packageManager || detectPackageManager(),
  };
};

const outputDepsAsText = (deps: Dependency[], output: string) => {
  const licenseText = deps
    .map((dep) => {
      const values = [dep.name];
      dep.author && values.push(`author: ${getAuthor(dep)}`);
      dep.repository?.url && values.push(`repository: ${getRepository(dep)}`);
      dep.license && values.push(`license: ${dep.license}`);
      dep.licenseText && values.push(`${dep.licenseText}`);
      dep.apacheNotice && values.push(`${dep.apacheNotice}`);
      return values.join("\n");
    })
    .join(`\n\n\n`);

  const writeFilePath = path.join(process.cwd(), output || "licenses.txt");
  const dir = path.dirname(writeFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(writeFilePath, licenseText);

  return writeFilePath;
};

const outputDepsAsJSON = (deps: Dependency[], output: string) => {
  const writeFilePath = path.join(process.cwd(), output || "licenses.json");
  const dir = path.dirname(writeFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(writeFilePath, JSON.stringify(deps, null, 2));

  return writeFilePath;
};

const getAuthor = ({ author }: Dependency) => {
  if (!author) return "";
  if (typeof author === "string") return author;

  const name = author.name;
  const email = author.email ? `<${author.email}>` : "";
  const url = author.url ? `(${author.url})` : "";

  return `${name}${email}${url}`;
};

const getRepository = ({ repository }: Dependency) => {
  if (!repository) return "";
  if (typeof repository === "string") return repository;
  return repository.url;
};
