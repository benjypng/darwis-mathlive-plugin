import { BlockIdentity } from '@logseq/libs/dist/LSPlugin.user';
import 'mathlive';

declare global {
  interface Window {
    HTMLDivElement: any;
  }
}

export const renderMathLive = (
  uniqueIdentifier: string,
  uuid: BlockIdentity
) => {
  const HTMLDivEl: typeof HTMLDivElement = top?.HTMLDivElement;

  const NAME = `mathlivesave-${uniqueIdentifier}`;

  class MathLive extends HTMLDivEl {
    constructor() {
      super();
    }

    static get observedAttributes() {
      return ['data-latex', 'data-uuid'];
    }

    connectedCallback() {
      this.render();

      window.setTimeout(async () => {
        const formulaDiv = top?.document.getElementById(
          `formula-${uniqueIdentifier}`
        );

        formulaDiv.addEventListener('input', async (ev) => {
          await logseq.Editor.upsertBlockProperty(
            uuid,
            'output',
            //@ts-expect-error
            ev.target.value
          );
        });

        formulaDiv.addEventListener('change', async () => {
          await logseq.Editor.restoreEditingCursor();
        });
      }, 500);
    }

    async render() {
      const output = await logseq.Editor.getBlockProperty(uuid, 'output');

      this.innerHTML = `<div style="display:flex; flex-direction:column;"><div id="container-${uniqueIdentifier}"><math-field id="formula-${uniqueIdentifier}" style="
      font-size: 22px; 
      border-radius: 8px;
      padding: 0 0 20px 20px;
      border: 2px solid rgba(0, 0, 0, .3); margin: 0px;
      box-shadow: 0 0 15px rgba(0, 0, 0, .2);">${
        output ? output : ''
      }</math-field></div>
      <div><button class="convertBtn" style="width: 100%; border: 1px solid black; border-radius: 8px;" data-on-click="convert">Convert to Latex (irreversible)</button></div></div>`;

      this.querySelector('.convertBtn').addEventListener('click', async (e) => {
        const getFormula = await logseq.Editor.getBlockProperty(uuid, 'output');
        await logseq.Editor.updateBlock(uuid, `$$${getFormula}$$`);
      });
    }

    get uuid() {
      return (
        this.getAttribute('data-uuid') ||
        this.closest('div[id^="block-content"]')?.getAttribute('blockid') ||
        ''
      );
    }
  }

  if (!top?.customElements.get(NAME)) {
    top?.customElements.define(NAME, MathLive, {
      extends: 'div',
    });

    const script = top?.document.createElement('script');
    script?.setAttribute(
      'src',
      'https://unpkg.com/mathlive/dist/mathlive.min.js'
    );
    top?.document.body.appendChild(script);
  }
};
