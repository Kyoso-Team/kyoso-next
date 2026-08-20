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
  onlyEdited = true
) {
  const condition = field.errors && !field.isValid
  return onlyEdited ? condition && field.isEdited : condition;
}
