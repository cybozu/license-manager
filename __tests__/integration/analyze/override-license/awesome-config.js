module.exports = {
  overrideLicense: () => {
    console.log("load awesome-config.js");
    return "OVERRIDE_LICENSE";
  },
};
