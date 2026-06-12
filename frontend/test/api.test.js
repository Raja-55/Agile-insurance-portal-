import { expect, test } from "vitest";

import { apiRequest } from "../src/utils/api.js";

test("apiRequest falls back safely when the backend returns invalid JSON", async () => {
  const originalFetch = globalThis.fetch;
  const originalLocalStorage = globalThis.localStorage;

  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };

  globalThis.fetch = async () =>
    new Response("not valid json", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  try {
    const payload = await apiRequest("/api/admin/dashboard");
    expect(payload).toEqual({ message: "not valid json" });
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.localStorage = originalLocalStorage;
  }
});
