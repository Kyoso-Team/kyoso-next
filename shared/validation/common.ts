import * as v from "valibot";

export const initialUndefinedSchema = <TSchema extends v.GenericSchema>(schema: TSchema) =>
  v.pipe(v.union([v.undefined(), schema]), schema);
