import "mathlive";
import { MathfieldElement } from "mathlive";
import { debounce } from "rambdax";

declare global {
  interface Window {
    HTMLDivElement: any;
  }
}

export const renderMathLive = (id: string) => {
  const HTMLDivEl: typeof HTMLDivElement = top?.HTMLDivElement;

  class MathLive extends HTMLDivEl {
    constructor() {
      super();
      // hide block property used to store mathlive value
      logseq.provideStyle(`
        #block-content-${id} .block-properties {
          display: none !important;
        }
      `);
    }

    connectedCallback() {
      // Set event listener to prevent clickthrough on div
      this.addEventListener("mousedown", function (e: any) {
        e.stopPropagation();
        e.preventDefault();
      });
      // Set event listener to prevent keythrough on div
      this.addEventListener("keydown", function (e: any) {
        e.stopPropagation();
        e.preventDefault();
      });

      this.render();

      window.setTimeout(async () => {
        const formulaDiv = top?.document.getElementById(
          `formula-${id}`,
        ) as MathfieldElement;
        if (!formulaDiv) return;

        formulaDiv.addEventListener(
          "input",
          debounce(async (e) => {
            await logseq.Editor.upsertBlockProperty(
              id,
              "output",
              (e.target as HTMLInputElement).value,
            );
          }, 500),
        );
        formulaDiv.addEventListener("change", async () => {
          await logseq.Editor.restoreEditingCursor();
        });

        formulaDiv.inlineShortcuts = {
          ...formulaDiv!.inlineShortcuts,
          sqrt: "\\sqrt{x}",
        };
      }, 500);
    }

    async render() {
      // var to store the values created by mathlive
      const output = await logseq.Editor.getBlockProperty(id, "output");

      this.innerHTML = `
          <div>
            <div id="container-${id}">
              <math-field id="formula-${id}">${output ?? ""}</math-field>
            </div>
            <div>
              <button class="convertBtn" data-on-click="convert">
                Convert to Latex (irreversible)
              </button>
            </div>
          </div>
			`;

      this.querySelector(".convertBtn")!.addEventListener("click", async () => {
        const getFormula = await logseq.Editor.getBlockProperty(id, "output");
        await logseq.Editor.updateBlock(id, `$$${getFormula}$$`);
      });
    }
  }

  if (!top?.customElements.get(`mathlive-${id}`)) {
    top?.customElements.define(`mathlive-${id}`, MathLive, {
      extends: "div",
    });
    const script = top?.document.createElement("script");
    script?.setAttribute("src", `${logseq.baseInfo.lsr}dist/mathlive.min.js`);
    top?.document.body.appendChild(script as HTMLScriptElement);
  }
};
