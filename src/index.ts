import '@logseq/libs';

import { renderMathLive } from './mathliveCustom';

function main() {
  console.log('darwis-mathlive-plugin loaded');

  // Generate unique identifier
  const uniqueIdentifier = () =>
    Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '');

  logseq.Editor.registerSlashCommand('MathLive', async () => {
    const id = uniqueIdentifier();
    await logseq.Editor.insertAtEditingCursor(`[:div {:is "mathlivesave-${id}"}]
{{renderer :mathlivesave_${id}}}`);
  });

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const [type] = payload.arguments;

    if (!type.startsWith(':mathlivesave_')) return;

    const id = type.split('_')[1]?.trim();

    renderMathLive(id, payload.uuid);
  });
}

logseq.ready(main).catch(console.error);
