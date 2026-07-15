import type {
  FieldArrayStore,
  FieldStore,
  FormSchema,
  RequiredPath,
} from "@formisch/vue";

export function isInvalid<
  TSchema extends FormSchema,
  TFieldPath extends RequiredPath,
>(
  field:
    | FieldStore<TSchema, TFieldPath>
    | FieldArrayStore<TSchema, TFieldPath>,
) {
  return field.errors && field.isEdited && !field.isValid;
}
