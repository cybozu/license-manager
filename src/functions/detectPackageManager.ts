export const detectPackageManager = () => {
  return process.env.npm_execpath?.includes("pnpm") ? "pnpm" : "npm";
};
