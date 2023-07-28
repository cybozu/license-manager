import fs from "fs";
import path from "path";
import { Config } from "../types";

export const loadConfigScript = async (relativeConfigPath: string = ""): Promise<Partial<Config>> => {
  const configPath = path.join(process.cwd(), relativeConfigPath || "license-manager.config.js");

  if (!fs.existsSync(configPath)) {
    return {};
  }

  console.log("💡 Detected license-manager.config.js");

  const requirePath = path.relative(__dirname, configPath);
  const config = require(requirePath);

  // TODO: need validation

  return config;
};
