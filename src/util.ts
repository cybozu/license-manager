import {
  isMatchPackage as isMatchPackageOrigin,
  isMatchName as isMatchNameOrigin,
  isMatchVersion as isMatchVersionOrigin,
} from "./functions/depsUtils";

// 利用者がlicense-manager.config.jsで使用するユーティリティ関数を定義する
export const isMatchPackage = isMatchPackageOrigin;
export const isMatchName = isMatchNameOrigin;
export const isMatchVersion = isMatchVersionOrigin;
