type LogItem = {
  element: HTMLElement;
  radio?: HTMLInputElement;
};

type HistoryItem = {
  radio: HTMLInputElement;
  element: HTMLElement;
  input: string;
  output: any;
};

class EmbedConsole {
  id: string;
  highlightCallback: (logItem: HTMLElement) => void;
  customExecute: (console: EmbedConsole, command: string) => string = undefined;
  elements: {
    parent: HTMLElement;
    container: HTMLDivElement;
    log: HTMLUListElement;
    input: HTMLDivElement;
  };
  history: {
    position: number;
    items: HistoryItem[];
    add: (radio: HTMLInputElement, element: HTMLElement, input: string, output: any) => void;
    traverseUp: (e: HTMLElement) => void;
    traverseDown: (e: HTMLElement) => void;
    reset: (e: HTMLDivElement) => void;
  };

  constructor(containerId: string, opts?: any) {
    this.id = (Math.random() + 1).toString(36).substring(16);
    this.highlightCallback = opts?.highlight || this.defaultHighlightCallback;
    this.elements = this.buildLayout(containerId);
    this.setupInputHandlers();
    this.history = {
      position: 0,
      items: [],
      add: (radio, element, input, output) => {
        this.history.items.push({ radio, element, input, output });
        this.history.position = this.history.items.length;
      },
      traverseUp: (e) => {
        const item = this.history.items[this.history.position - 1];
        if (!item) return;
        item.radio.click();
        item.element.scrollIntoView();
      },
      traverseDown: (e) => {
        const item = this.history.items[this.history.position + 1];
        if (!item && e instanceof HTMLDivElement) return this.history.reset(e);
        item.radio.click();
        item.element.scrollIntoView();
      },
      reset: (e) => {
        for (const item of this.history.items) item.radio.checked = false;
        this.history.position = this.history.items.length;
        e.innerText = '';
      }
    };
  }

  static customInit(containerId: string, execFn: (c: EmbedConsole, a: string) => string, opts?: any): EmbedConsole {
    const ret = new EmbedConsole(containerId, opts);
    ret.customExecute = execFn;
    return ret;
  }

  defaultHighlightCallback(logItem: HTMLElement): void {
    //const hljs = (window as any).hljs;
    //if (!hljs) return;
    //const codes = logItem.getElementsByTagName('code');
    //for (let i = 0; i < codes.length; i++) {
    //  hljs.highlightBlock(codes[i]);
    //}
  }

  buildLayout(containerId: string): {
    parent: HTMLElement;
    container: HTMLDivElement;
    log: HTMLUListElement;
    input: HTMLDivElement;
  } {
    const parent = document.getElementById(containerId) as HTMLElement;

    if (!parent) throw 'Please provide a valid container.';

    const container = document.createElement('div');
    const log = container.appendChild(document.createElement('ul')) as HTMLUListElement;
    const input = container.appendChild(document.createElement('div')) as HTMLDivElement;

    container.className = 'console-sandbox';
    log.className = 'console-log';
    input.className = 'console-input';

    input.setAttribute('contenteditable', 'true');

    parent.appendChild(container);

    return { parent, container, log, input };
  }

  setupInputHandlers(): void {
    this.elements.input.onkeydown = (e: KeyboardEvent) => {
      const value = this.elements.input.innerText;
      if (e.key === 'Enter') {
        if (e.shiftKey) return;
        e.preventDefault();
        if (/\S/.test(value)) this.execute(value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.history.traverseUp(this.elements.input);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.history.traverseDown(this.elements.input);
      }
    };
  }

  populate(arr: string[]): void {
    for (const command of arr) this.execute(command);
  }

  updateInput(position: number): void {
    const item = this.history.items[position];
    this.elements.input.innerHTML = item ? item.input : '';
    this.history.position = item ? position : this.history.items.length;
    this.placeCaretAtEnd(this.elements.input);
  }

  add(opts: { input: string, output: any, klass?: string, javascript?: boolean }): void {
    const logItem = this.buildLogItem(opts.input, opts.output, opts.klass, opts.javascript);

    this.highlightCallback(logItem.element);

    if (logItem.radio) {
      this.elements.log.appendChild(logItem.radio);
      this.history.add(logItem.radio, logItem.element, opts.input, opts.output);
    }

    this.elements.log.appendChild(logItem.element);
    this.elements.log.scrollTop = this.elements.log.scrollHeight;
  }

  execute(command: string): void {
    let output;
    try {
      if (this.customExecute) {
        output = this.customExecute(this, command);
      } else {
        output = eval.call({}, command);
      }
    } catch (e) {
      output = e;
    }
    
    // blah! customExecute does the adding
    if (!this.customExecute) {
      this.add({ input: command, output: output });
    }

    this.history.reset(this.elements.input);
  }

  placeCaretAtEnd(el: HTMLElement): void {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false); // Collapse the range to the end point of the range
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  buildLogItem(input: string, output: any, klass?: string, stringify?: boolean): LogItem {
    let outputClass = 'nohighlight';
    const radio: HTMLInputElement | undefined = input ? this.buildRadioButton() : undefined;
    const element = document.createElement('li') as HTMLLIElement;

    klass = klass || '';

    if (output instanceof Error) klass += ' log-error';

    if (!(output instanceof Error) && stringify !== false) {
      outputClass = 'javascript';
      output = JSON.stringify(output, null, 2);

      if (output) output = output.replace(/"(.*)":/gi, '$1:');
      console.log(output);
    }

    let innerHTML = `<code class="${outputClass}">${output}</code>`;
    if (input) innerHTML = `<label for="${radio?.id}"><code class="javascript">${input}</code>${innerHTML}</label>`

    element.className = klass;
    element.innerHTML = innerHTML;

    return { element, radio };
  }

  buildRadioButton(): HTMLInputElement {
    const radio = document.createElement('input') as HTMLInputElement;
    radio.id = this.id + "-radio-" + this.history.items.length;
    radio.value = this.history.items.length.toString();
    radio.setAttribute('type', 'radio');
    radio.setAttribute('name', 'log');
    radio.onchange = () => {
      if (radio.checked) this.updateInput(parseInt(radio.value));
    }
    return radio;
  }
}

export default EmbedConsole
