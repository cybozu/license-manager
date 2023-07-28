import { fs as memfs } from "memfs";
import fs from "fs";

export default {
  ...fs,
  existsSync: (path) => {
    if (path && path.toString().endsWith("license-manager.config.js")) {
      return fs.existsSync(path);
    }
    return memfs.existsSync(path);
  },
  mkdirSync: memfs.mkdirSync,
  writeFileSync: memfs.writeFileSync,
} as typeof fs;
