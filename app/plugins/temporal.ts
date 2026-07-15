import { Temporal } from "@js-temporal/polyfill";

export default defineNuxtPlugin(() => {
  if (!globalThis.Temporal) {
    Object.assign(globalThis, { Temporal });
  }
});
