// ※ You need to run npm run build
const { isMatchPackage, isMatchName, isMatchVersion } = require("../../../../dist/index");

module.exports = {
  overrideLicense: (dep) => {
    if (isMatchPackage(dep, "foo@1.2.3")) {
      return "FOO_LICENSE";
    }
    if (isMatchName(dep, "bar")) {
      return "BAR_LICENSE";
    }
    if (dep.name === "baz" && isMatchVersion(dep, "1.2.3")) {
      return "BAZ_LICENSE";
    }
    return undefined;
  },
};
