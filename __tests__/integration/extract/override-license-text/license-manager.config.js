// ※ You need to run npm run build
// eslint-disable-next-line node/no-missing-require, node/no-unpublished-require
const { isMatchPackage, isMatchName, isMatchVersion } = require("../../../../dist/index");

module.exports = {
  overrideLicenseText: (dep) => {
    if (isMatchPackage(dep, "foo@1.2.3")) {
      return "FOO_LICENSE_TEXT";
    }
    if (isMatchName(dep, "bar")) {
      return "BAR_LICENSE_TEXT";
    }
    if (dep.name === "baz" && isMatchVersion(dep, "1.2.3")) {
      return { licenseText: "BAZ_LICENSE_TEXT" };
    }
    return undefined;
  },
};
