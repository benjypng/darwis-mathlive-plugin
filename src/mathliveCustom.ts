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

      window.setTimeout(() => {
        top?.document.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          e.preventDefault();
        });

        top?.document
          .getElementById('formula')
          .addEventListener('input', (ev) => {
            //@ts-expect-error
            console.log(ev.target.value);

            //@ts-expect-error
            logseq.Editor.upsertBlockProperty(uuid, 'output', ev.target.value);
          });
      }, 500);
    }

    async render() {
      const output = await logseq.Editor.getBlockProperty(uuid, 'output');

      this.innerHTML = `<math-field id="formula" virtual-keyboard-mode=manual style="
      font-size: 22px; 
      border-radius: 8px;
      padding: 0 0 20px 20px;
      border: 2px solid rgba(0, 0, 0, .3); 
      box-shadow: 0 0 15px rgba(0, 0, 0, .2);">${
        output ? output : ''
      }</math-field>`;
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
