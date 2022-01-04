import 'mathlive';
// import 'mathlive/dist/mathlive-static.css';
// import 'mathlive/dist/mathlive-fonts.css';

declare global {
  interface Window {
    HTMLDivElement: any;
  }
}

const HTMLDivEl: typeof HTMLDivElement = top?.HTMLDivElement;

const NAME = 'math-live';

class MathLive extends HTMLDivEl {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ['data-latex', 'data-uuid'];
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `<math-field id="formula" virtual-keyboard-mode=manual>
        x=\frac{-b\pm \sqrt{b^2-4ac}}{2a}
    </math-field>`;
  }

  get uuid() {
    return (
      this.getAttribute('data-uuid') ||
      this.closest('div[id^="block-content"]')?.getAttribute('blockid') ||
      ''
    );
  }
}

export const registerMathLive = () => {
  if (!top?.customElements.get(NAME)) {
    top?.customElements.define(NAME, MathLive, {
      extends: 'div',
    });

    const script = top?.document.createElement('script');
    script?.setAttribute(
      'src',
      'https://unpkg.com/mathlive/dist/mathlive.min.js'
    );
    //@ts-expect-error
    top?.document.body.appendChild(script);
  }
};
