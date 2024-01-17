import { Command } from "commander";
import { analyze } from "./analyze";
import { extract } from "./extract";

const program = new Command();

program
  .command("analyze")
  .description("Analyze licenses of dependencies")
  .option("-q, --query <string>", "npm query string (please see: https://docs.npmjs.com/cli/v8/commands/npm-query)")
  .option("--cwd <string>", "current working directory for npm query")
  .option(
    "-w, --workspace <string>",
    "workspace option for npm query (please see: https://docs.npmjs.com/cli/v8/commands/npm-query#workspace)"
  )
  .option("-l, --allowLicense <string...>", "allow licenses")
  .option("-p, --allowPackage <string...>", "allow packages (allowed without license)")
  .option("-m, --packageManager <npm|pnpm>", "package manager used to analyze licenses (default: auto detect)")
  .action((options) => {
    analyze({
      workspace: options.workspace || "",
      cwd: options.cwd || "",
      query: options.query,
      allowLicenses: options.allowLicense || [],
      allowPackages: options.allowPackage || [],
      packageManager: options.packageManager || "",
    });
  });

program
  .command("extract")
  .description("Extract licenses from dependencies into single file")
  .option("-q, --query <string>", "npm query string (please see: https://docs.npmjs.com/cli/v8/commands/npm-query)")
  .option("--cwd <string>", "current working directory for npm query")
  .option(
    "-w, --workspace <string>",
    "workspace option for npm query (please see: https://docs.npmjs.com/cli/v8/commands/npm-query#workspace)"
  )
  .option("-l, --extractLicense <string...>", "licenses to extract")
  .option("-p, --excludePackage <string...>", "packages to be excluded from extraction")
  .option("-o, --output <string>", "output file name")
  .option("--json", "output in JSON format")
  .option("-m, --packageManager <npm|pnpm>", "package manager used to extract licenses (default: auto detect)")
  .action((options) => {
    extract({
      workspace: options.workspace || "",
      cwd: options.cwd || "",
      query: options.query,
      extractLicenses: options.extractLicense || [],
      excludePackages: options.excludePackage || [],
      output: options.output || "",
      json: !!options.json,
      packageManager: options.packageManager || "",
    });
  });

program.parse();
