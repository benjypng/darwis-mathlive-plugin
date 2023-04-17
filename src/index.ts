import "@logseq/libs";

import renderMathLive from "./renderMathLive";

function main() {
  console.log("darwis-mathlive-plugin loaded");

  logseq.provideStyle(`
		.mathlive {
			width: 100% !important;
      font-size: 22px;
      border-radius: 8px;
      padding: 0 0 20px 20px;
      border: 2px solid rgba(0, 0, 0, .3);
			margin: 0px;
			box-shadow: 0 0 15px rgba(0, 0, 0, .2);
		}
											`);

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
