// FIXME: 2023/03/07時点で @types/node で fetch の型情報が定義されていないため、回避策として undici の fetch 関数の型を利用する。
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924#issuecomment-1246622957
declare global {
  const fetch: typeof import("undici").fetch;
}

export const fetcher = async (url: string, timeout: number = 15000) => {
  const controller = new AbortController();
  const { signal } = controller;
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const res = await fetch(url, { signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
};
