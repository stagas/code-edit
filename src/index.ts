import { CodeSyntaxElement, SyntaxDefinition, languages } from 'code-syntax'
import { debounce } from 'debounce-micro'
import { SuperImposeElement } from 'super-impose'
import { TextAreaCodeElement } from 'textarea-code'

export { languages }

declare global {
  interface ShadowRootInit {
    customElements?: CustomElementRegistry
  }
}

let customElements = window.customElements
customElements.define('textarea-code', TextAreaCodeElement, { extends: 'textarea' })
try {
  customElements = new CustomElementRegistry()
} catch {
  //
}
customElements.define('super-impose', SuperImposeElement)
customElements.define('code-syntax', CodeSyntaxElement)

/* NOTE: space is important inside <code-syntax> </code-syntax>
 * as it creates the text node we're using later to replace value.
 * This allows the 'characterData' mutation to trigger instead
 * of the 'slotchanged' event which is more costly.
 */
const template = document.createElement('template')
template.innerHTML = /*html*/ `<style>
:host {
  --caret: #fff;
  --selection: #742;
  position: relative;
  display: inline-flex;
  overflow: hidden;
}
:host([autoresize]) [part=parent] {
  resize: horizontal;
}
[part=parent] {
  background: var(--background, transparent);
}
pre,
textarea {
  white-space: pre;
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  font-size: inherit;
  line-height: inherit;
  resize: none;
  background: transparent;
  color: transparent;
  caret-color: var(--caret);
  border: none;
}
pre {
  position: absolute;
  width: auto;
  height: auto;
  z-index: -1;
}
textarea::selection {
  color: transparent;
  background: var(--selection) !important;
}
slot {
  display: none;
}
</style>\
<pre></pre><slot></slot><super-impose part="parent">\
<textarea part="textarea" autocomplete="off" autocorrect="off" spellcheck="false" is="textarea-code"></textarea>\
<code-syntax slot="follower" part="syntax"> </code-syntax>\
</super-impose>`

/**
 * CodeEdit HTML/JSX Interface
 */
export interface HTMLCodeEditElement {
  /** The editor's value */
  value?: string
  /** Language for syntax highlighting */
  language?: string
  /** Passing a syntax definition regexp manually */
  syntax?: SyntaxDefinition | Promise<{ default: SyntaxDefinition }>
  /** Theme to use */
  theme?: string
  /** Tab size */
  tabsize?: number
  /** Tab style */
  tabstyle?: 'tabs' | 'spaces'
  /** Comments are defined as a tuple-like string: '// /* *\/' first item is single comment and second third are multiline comments */
  comments?: string
  /** Autofocus to the element when page loads */
  autofocus?: boolean
  /** Whether to autoresize to the height of the contents */
  autoresize?: boolean
}

/**
 * CodeEdit custom element
 *
 * ```js
 * import { CodeEditElement } from 'code-edit'
 * customElements.define('code-edit', CodeEditElement)
 * ```
 *
 * ```html
 * <code-edit autofocus autoresize language="js" theme="deep"> ... </code-edit>
 * ```
 */
export class CodeEditElement extends HTMLElement {
  static get observedAttributes() {
    return ['language', 'theme', 'tabsize', 'tabstyle', 'comments', 'autofocus', 'autoresize']
  }

  nodes: Node[] = []

  pins = {} as {
    pre: HTMLPreElement
    parent: SuperImposeElement
    textarea: TextAreaCodeElement
    syntax: CodeSyntaxElement
    syntaxTextNode: Text
  }

  update: () => void

  constructor() {
    super()

    const root = this.attachShadow({ mode: 'open', customElements })
    root.appendChild(document.importNode(template.content, true))

    // the pre element is used to push height when using `autoresize`
    this.pins.pre = root.querySelector('pre')!

    this.pins.parent = root.querySelector('[part=parent]')!

    this.pins.syntax = root.querySelector('[part=syntax]')!
    this.pins.syntaxTextNode = this.pins.syntax.childNodes[0] as Text
    this.update = debounce(() => {
      this.pins.syntaxTextNode.nodeValue = this.pins.textarea.value
      this.autoResize()
    })

    this.pins.textarea = root.querySelector('[part=textarea]')!
    this.pins.textarea.addEventListener('input', this.update)
    this.pins.textarea.addEventListener('scroll', () => {
      this.dispatchEvent(new CustomEvent('scroll'))
    })

    const observer = new MutationObserver(this.updateValue)
    const slot = root.querySelector('slot')!
    slot.addEventListener('slotchange', () => {
      this.nodes = slot.assignedNodes()
      this.nodes.forEach(node => observer.observe(node, { characterData: true }))
      this.updateValue()
    })

    this.update()
  }

  get scrollLeft() {
    return this.pins.textarea.scrollLeft
  }

  get scrollTop() {
    return this.pins.textarea.scrollTop
  }

  get value() {
    return this.pins.textarea.value
  }

  set value(v) {
    this.pins.textarea.value = v
    this.update()
  }

  set syntax(def: SyntaxDefinition | Promise<{ default: SyntaxDefinition }>) {
    this.pins.syntax.syntax = def
  }

  focus() {
    this.pins.textarea.focus()
  }

  updateValue() {
    this.value = this.nodes
      .map(node => {
        const text = node.textContent!
        return text.trim().length ? text : ''
      })
      .join('')
  }

  autoResize() {
    if (this.hasAttribute('autoresize')) {
      this.pins.pre.textContent = this.value + ' '
      const rect = this.pins.pre.getBoundingClientRect()
      this.pins.parent.style.height = rect.height + 'px'
    }
  }

  autoFocus() {
    if (this.hasAttribute('autofocus')) {
      // deal with browser autofocus warning on initial load
      setTimeout(() => {
        this.pins.textarea.focus()
        // move the caret to the beginning
        setTimeout(() => {
          this.pins.textarea.setSelectionRange(0, 0)
        })
      })
    }
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
    if (name === 'theme') {
      // allow css variables to propagate to the shadow rooted code-syntax + textarea
      this.setAttribute('code-syntax-theme', newValue!)

      // allow textarea to receive css variables
      this.pins.textarea.setAttribute(name, newValue!)
    }

    if (['tabsize', 'tabstyle', 'comments'].includes(name)) this.pins.textarea.setAttribute(name, newValue!)
    else if (['language', 'theme'].includes(name)) {
      this.pins.parent.setAttribute(name, newValue!)
      this.pins.syntax.setAttribute(name, newValue!)
    } else if (name === 'autofocus') this.autoFocus()
    else if (name === 'autoresize') this.autoResize()
  }
}

export default CodeEditElement
