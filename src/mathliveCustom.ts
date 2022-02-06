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

      this.innerHTML = `<div id="container-${uniqueIdentifier}"><math-field tabindex="1" id="formula-${uniqueIdentifier}" virtual-keyboard-mode=manual style="
      font-size: 22px; 
      border-radius: 8px;
      padding: 0 0 20px 20px;
      border: 2px solid rgba(0, 0, 0, .3); 
      box-shadow: 0 0 15px rgba(0, 0, 0, .2);">${
        output ? output : ''
      }</math-field></div>`;
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
