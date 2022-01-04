import '@logseq/libs';

import { registerMathLive } from './mathliveCustom';

function main() {
  const pluginId = logseq.baseInfo.id;
  console.info(`#${pluginId}: MAIN`);

  registerMathLive();
}

logseq.ready(main).catch(console.error);
