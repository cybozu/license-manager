import fs from "fs";
import path from "path";
import { Config } from "../types";

export const loadConfigScript = async (relativeConfigPathArg?: string): Promise<Partial<Config>> => {
  const relativeConfigPath = relativeConfigPathArg || "license-manager.config.js";
  const configPath = path.join(process.cwd(), relativeConfigPath);

  if (!fs.existsSync(configPath)) {
    return {};
  }

  console.log(`💡 Detected ${relativeConfigPath}`);

  const requirePath = path.relative(__dirname, configPath);
  const config = require(requirePath);

  // TODO: need validation

  return config;
};
