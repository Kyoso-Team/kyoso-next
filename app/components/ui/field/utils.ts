import type { AnyFieldApi } from "@tanstack/vue-form";

export function isInvalid(field: AnyFieldApi) {
  return field.state.meta.isTouched && !field.state.meta.isValid;
}
