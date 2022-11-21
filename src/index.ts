import "@logseq/libs";

import renderMathLive from "./renderMathLive";

function main() {
  console.log("darwis-mathlive-plugin loaded");

  // Generate unique identifier
  const uniqueIdentifier = () =>
    Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, "");

  logseq.Editor.registerSlashCommand("MathLive", async () => {
    const id = uniqueIdentifier();
    await logseq.Editor
      .insertAtEditingCursor(`{{renderer :mathlive_${id}}}[:div {:is "mathlive-${id}"}]
`);
  });

  logseq.App.onMacroRendererSlotted(async ({ payload }) => {
    const [type] = payload.arguments;
    if (!type.startsWith(":mathlive_")) return;
    const id = type.split("_")[1]?.trim();
    renderMathLive(id);
  });
}

logseq.ready(main).catch(console.error);
