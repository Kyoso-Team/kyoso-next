import { addTypeTemplate, defineNuxtModule, updateTemplates } from "@nuxt/kit";
import { consola } from "consola";
import { join } from "pathe";

export default defineNuxtModule({
  setup(options, nuxt) {
    const modalsDir = join(nuxt.options.rootDir, "app/components/modals");
    let modalNames: string[] = [];

    const template = addTypeTemplate({
      filename: "types/modal-options.d.ts",
      getContents: () => {
        const union = modalNames.length ? modalNames.map((n) => `'${n}'`).join(" | ") : "never";
        return `// Auto-generated — do not edit\nexport type ModalName = ${union}\n`;
      },
    });

    nuxt.hook("components:extend", (components) => {
      modalNames = components
        .filter((c) => c.filePath.startsWith(modalsDir))
        .map((c) => c.pascalName);
    });

    nuxt.hook("builder:watch", async (event, path) => {
      if (path.includes("components/modals")) {
        consola.info("Detected changes in modals dir, updating types...");
        await updateTemplates({ filter: (t) => t.filename === template.filename });
      }
    });
  },
});
