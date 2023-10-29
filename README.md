# license-manager

license-manager is a CLI license management tool for npm dependencies.

## Requirement

node >= v18.14.0  
npm >= v9.3.1 (need `npm query`) or pnpm >= v8.10.0

## Install

```
npm install -g @cybozu/license-manager@latest
```

## Usage

### Analyze dependencies licenses

Analyze dependencies licenses.  
If invalid package found, it outputs error.

```
license-manager analyze -q ".prod" -w . -l MIT -l ISC -p "@types/*" -p "react@*"
```

### Extract dependencies licenses

Extract licenses to a single file.

```
license-manager extract -q ".prod" -w . -l MIT -l ISC -p "@types/*" -p "react@*"
```

## Options

### Common Options

#### `-q`, `--query`

**default:**

- **analyze: `":root *"`**
- **extract: `":root .prod"`**

Query string for npm query.  
license-manager uses [npm query](https://docs.npmjs.com/cli/v8/commands/npm-query) to search packages.

Attention: If the package manager is `pnpm`, it cannot be specified; it is the same as `":root *"` for analyze and `":root .prod"` for extract.

#### `--cwd`

**default: (empty / process.cwd())**

Current working directory for npm query.

#### `-w`, `--workspace`

**default: (ignored)**

Option for [`workspace` option](https://docs.npmjs.com/cli/v8/commands/npm-query#workspace) of npm query.

#### `-m`, `--packageManager`

**default: (empty / Automatically detects)**

Specify which package manager to use `npm` or `pnpm`.
Automatically detected if you are running the command with `npm run`, `npx`, or `pnpm run`.

### Options for `analyze` command

#### `-l`, `--allowLicense`

**default: (empty / All licenses are denied)**

Permitted license name.  
If any package is found for which this option is not specified, `analyze` command will output errors.

#### `-p`, `--allowPackage`

**default: (ignored)**

Permitted package name.  
Packages specified with this option are allowed regardless of the license.

```
-p foo@1.2.3
-p foo@1.2.3 -p bar@2.3.4

# Allow any version
-p foo
-p foo@*
-p foo@all

# Allow scoped package
-p @foo/*
```

### Options for `extract` command

#### `-l`, `--extractLicense`

**default: (empty / All licenses are extracted)**

Extracts only packages with the specified license.  
If omitted, all packages are extracted.

#### `-p`, `--excludePackage`

**default: (ignored)**

Excluded package name.

#### `-o`, `--output`

**default: "licenses.txt" or "licenses.json"**

Output file name.  
Relative path from the current directory.

#### `--json`

Output licenses in JSON format.  
Based on the results of npm query, and some fields be added.

- `licenseText` (string) : Extracted license text.
- `licenseTextPath` (string)(optional) : File path to license text file. Omitted if override function is used.
- `apacheNotice` (string)(optional) : Contents of NOTICE file. Exists only if Apache-2.0 license and NOTICE file exists.
- `apacheNoticePath` (string)(optional) : File path to NOTICE file.

## Config file

You can write all settings to `license-manager.config.js`.  
If `license-manager.config.js` exists in the current directory, it is automatically loaded.  
CLI options take precedence, but license and package specifications are merged.  
And you can also specify a override function in case the license and license text cannot be detected.

```js
module.exports = {
  workspace: ".",
  analyze: {
    query: ":workspace:is([name=app]) *",
    allowLicenses: ["MIT", /BSD.*/, "ISC"],
    allowPackages: ["mypackage", /eslint/],
  },
  extract: {
    query: ":workspace:is([name=app]) .prod",
    excludePackages: [/^@cybozu/],
    extractLicenses: [/BSD.*/, "ISC"],
    output: "mylicenses.json",
    format: "json",
  },
  overrideLicense: (dep) => {
    if (dep.name === "foo/bar") {
      return "MIT";
    }
    return;
  },
  overrideLicenseText: (dep) => {
    if (dep.name === "foo/bar") {
      return { licenseText: `MY PACKAGE LICENSE` };
    }

    if (dep.name === "license-manager") {
      return {
        licensePageUrl: `https://raw.githubusercontent.com/cybozu/license-manager/v${dep.version}/LICENSE`,
      };
    }
    return;
  },
};
```

### Utility functions

You can use utility functions in `license-manager.config.js.`

`isMatchPackage` : Verifying that package name and version match

`isMatchName` : Verifying that package name match

`isMatchVersion` : Verifying that package version match

```js

const { isMatchPackage } = require('@cybozu/license-manager');

module.exports = {
  ...
  overrideLicense: (dep) => {
    if (isMatchPackage(dep, "foo/bar@1.0.0")) {
      return "MIT";
    }
    return;
  },
};
```
