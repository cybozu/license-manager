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
