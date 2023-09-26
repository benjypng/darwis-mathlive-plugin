import "@logseq/libs";
import { renderMathLive } from "./renderMathLive";

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

    .convertBtn {
      width: 100%;
      border: 1px solid black;
      border-radius: 8px;
    }
	`);

  logseq.Editor.registerSlashCommand("MathLive", async (e) => {
    await logseq.Editor
      .insertAtEditingCursor(`{{renderer :mathlive_${e.uuid}}}[:div {:is "mathlive-${e.uuid}"}]
`);
  });

  logseq.App.onMacroRendererSlotted(async ({ payload }) => {
    const [type] = payload.arguments;
    if (!type) return;
    if (!type.startsWith(":mathlive_")) return;
    renderMathLive(payload.uuid);
  });
}

logseq.ready(main).catch(console.error);
