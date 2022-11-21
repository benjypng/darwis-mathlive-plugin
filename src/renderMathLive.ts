import "mathlive";

declare global {
  interface Window {
    HTMLDivElement: any;
  }
}

export default function renderMathLive(id: string) {
  const HTMLDivEl: typeof HTMLDivElement = top?.HTMLDivElement;

  class MathLive extends HTMLDivEl {
    constructor() {
      super();
      logseq.provideStyle(`
													#block-content-${this.uuid} .block-properties {
														display: none !important;
													}
													`);
    }

    static get observedAttributes() {
      return ["data-latex", "data-uuid"];
    }

    get uuid() {
      return (
        this.getAttribute("data-uuid") ||
        this.closest('div[id^="block-content"]')?.getAttribute("blockid") ||
        ""
      );
    }

    connectedCallback() {
      // Set event listener to prevent clickthrough on div
      this.addEventListener("mousedown", function (e: any) {
        e.stopPropagation();
        e.preventDefault();
      });

      this.render();

      window.setTimeout(async () => {
        const formulaDiv = top?.document.getElementById(`formula-${id}`);

        formulaDiv!.addEventListener("input", async (e) => {
          await logseq.Editor.upsertBlockProperty(
            this.uuid,
            "output",
            (e.target as HTMLInputElement).value
          );
        });

        formulaDiv!.addEventListener("change", async () => {
          await logseq.Editor.restoreEditingCursor();
        });
      }, 500);
    }

    async render() {
      const output = await logseq.Editor.getBlockProperty(this.uuid, "output");

      this.innerHTML = `<div style="display:flex; flex-direction:column;"><div id="container-${id}"><math-field id="formula-${id}" style="
      font-size: 22px;
      border-radius: 8px;
      padding: 0 0 20px 20px;
      border: 2px solid rgba(0, 0, 0, .3); margin: 0px;
      box-shadow: 0 0 15px rgba(0, 0, 0, .2);">${
        output ? output : ""
      }</math-field></div>
      <div><button class="convertBtn" style="width: 100%; border: 1px solid black; border-radius: 8px;" data-on-click="convert">Convert to Latex (irreversible)</button></div></div>`;

      this.querySelector(".convertBtn")!.addEventListener("click", async () => {
        const getFormula = await logseq.Editor.getBlockProperty(
          this.uuid,
          "output"
        );
        await logseq.Editor.updateBlock(this.uuid, `$$${getFormula}$$`);
      });
    }
  }

  if (!top?.customElements.get(`mathlive-${id}`)) {
    top?.customElements.define(`mathlive-${id}`, MathLive, {
      extends: "div",
    });
    const script = top?.document.createElement("script");
    script?.setAttribute(
      "src",
      "https://unpkg.com/mathlive/dist/mathlive.min.js"
    );
    top?.document.body.appendChild(script as HTMLScriptElement);
  }
}
