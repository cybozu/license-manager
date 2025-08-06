import { describe, expect, it } from "vitest";
import { Dependency } from "../types";
import { getLicense, isMatchPackage, isMatchName, isMatchVersion } from "./../functions/depsUtils";

const deps = (obj: Partial<Dependency>) => obj as Dependency;

describe("getLicense", () => {
  it("it should return license", () => {
    expect(getLicense(deps({ license: "MIT" }))).toBe("MIT");
    expect(getLicense(deps({ license: { type: "MIT", url: "https://example.com" } }))).toBe("MIT");
    expect(getLicense(deps({ licenses: [{ type: "MIT", url: "https://example.com" }] }))).toBe("MIT");
    expect(
      getLicense(
        deps({
          licenses: [
            { type: "MIT", url: "https://example.com/MIT" },
            { type: "ISC", url: "https://example.com/ISC" },
          ],
        })
      )
    ).toBe("(MIT OR ISC)");
  });

  it("verify overrideLicense", () => {
    expect(getLicense(deps({ license: "MIT" }), () => "BSD")).toBe("BSD");
    expect(getLicense(deps({ license: "MIT" }), undefined)).toBe("MIT");
  });
});

describe("isMatchPackage", () => {
  it("verify package match", () => {
    expect(isMatchPackage(deps({ name: "foo", version: "1.2.3" }), "foo")).toBe(true);
    expect(isMatchPackage(deps({ name: "foo", version: "1.2.3" }), "foo@1.2.3")).toBe(true);
    expect(isMatchPackage(deps({ name: "foo", version: "1.2.3" }), "foo@*")).toBe(true);
    expect(isMatchPackage(deps({ name: "foo", version: "1.2.3" }), "foo@all")).toBe(true);

    expect(isMatchPackage(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/bar")).toBe(true);
    expect(isMatchPackage(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/bar@1.2.3")).toBe(true);
    expect(isMatchPackage(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/bar@*")).toBe(true);
    expect(isMatchPackage(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/bar@all")).toBe(true);

    expect(isMatchPackage(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/*")).toBe(true);
    expect(isMatchPackage(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/*@1.2.3")).toBe(true);
    expect(isMatchPackage(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/*@*")).toBe(true);
    expect(isMatchPackage(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/*@all")).toBe(true);

    expect(isMatchPackage(deps({ name: "foo", version: "1.2.3" }), "xxx")).toBe(false);
    expect(isMatchPackage(deps({ name: "foo", version: "1.2.3" }), "foo@1.2.4")).toBe(false);
    expect(isMatchPackage(deps({ name: "foo", version: "1.2.3" }), "xxx@*")).toBe(false);
    expect(isMatchPackage(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/*@1.2.4")).toBe(false);
  });
});

describe("isMatchName", () => {
  it("verify package name match", () => {
    expect(isMatchName(deps({ name: "foo", version: "1.2.3" }), "foo")).toBe(true);
    expect(isMatchName(deps({ name: "foo", version: "1.2.3" }), "foo@1.2.3")).toBe(true);
    expect(isMatchName(deps({ name: "foo", version: "1.2.3" }), "foo@*")).toBe(true);
    expect(isMatchName(deps({ name: "foo", version: "1.2.3" }), "foo@all")).toBe(true);

    expect(isMatchName(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/bar")).toBe(true);
    expect(isMatchName(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/bar@1.2.3")).toBe(true);
    expect(isMatchName(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/bar@*")).toBe(true);
    expect(isMatchName(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/bar@all")).toBe(true);

    expect(isMatchName(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/*")).toBe(true);
    expect(isMatchName(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/*@1.2.3")).toBe(true);
    expect(isMatchName(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/*@*")).toBe(true);
    expect(isMatchName(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/*@all")).toBe(true);

    expect(isMatchName(deps({ name: "foo", version: "1.2.3" }), "xxx")).toBe(false);
    expect(isMatchName(deps({ name: "foo", version: "1.2.3" }), "xxx@*")).toBe(false);
    expect(isMatchName(deps({ name: "foo", version: "1.2.3" }), "foo@1.2.4")).toBe(true);
    expect(isMatchName(deps({ name: "@foo/bar", version: "1.2.3" }), "@foo/*@1.2.4")).toBe(true);
  });
});

describe("isMatchVersion", () => {
  it("verify version match", () => {
    expect(isMatchVersion(deps({ version: "1.0.0" }), "1.0.0")).toBe(true);
    expect(isMatchVersion(deps({ version: "1.0.0" }), "*")).toBe(true);
    expect(isMatchVersion(deps({ version: "1.0.0" }), "all")).toBe(true);

    expect(isMatchVersion(deps({ version: "1.0.0" }), "0.0.0")).toBe(false);
  });
});
