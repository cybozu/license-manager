export type RawDependency = {
  name: string;
  version: string;
  author?: string | { name: string; email?: string; url?: string };
  license?: string | { type: string; url: string };
  repository?: { url: string };
  path: string;
};

export type Dependency = RawDependency & {
  licenseText: string;
  apacheNotice?: string;
};

export type Config = {
  cwd?: string;
  workspace?: string;
  analyze?: {
    query?: string;
    allowLicenses?: Array<string | RegExp>;
    allowPackages?: Array<string | RegExp>;
  };
  extract?: {
    query?: string;
    extractLicenses?: Array<string | RegExp>;
    excludePackages?: Array<string | RegExp>;
    output?: string;
    format?: "json";
  };
  overrideLicense?: (dep: Dependency) => string | undefined;
  overrideLicenseText?: (
    dep: Dependency
  ) => string | undefined | { licenseText: string | undefined } | { licensePageUrl: string | undefined };
};
