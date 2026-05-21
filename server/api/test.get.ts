import { defineProtectedEventHandler } from "../utils/handlers/auth.handler";

export default defineProtectedEventHandler(async () => {
  return "hi";
});
