/** @jsxImportSource mixter/jsx */
import { attrs, events, mixter, onTextChange, props, shadow, state } from 'mixter'
import { element, jsx, refs } from 'mixter/jsx'

import { CodeSyntaxElement, languages, SyntaxOrImport } from 'code-syntax'
import { SuperImposeElement } from 'super-impose'
import { TextAreaCodeElement } from 'textarea-code'

export { languages }
export type { SyntaxOrImport }

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      theme?: string
    }
  }
}

const style = /*css*/ `
:host {
  --caret: #fff;
  --selection: #742;
  --padding: 0;
  position: relative;
  display: block;
  overflow: hidden;
  background: var(--background, transparent);
}
slot {
  display: none;
}
pre,
textarea {
  display: flex;
  white-space: pre;
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  font-size: inherit;
  line-height: inherit;
  background: transparent;
  color: transparent;
  caret-color: var(--caret);
  outline: none;
  resize: none;
  border: none;
  z-index: 1;
}
pre {
  position: absolute;
  width: auto;
  height: auto;
  z-index: -1;
}
textarea::selection {
  color: var(--color);
  background-color: var(--selection) !important;
}`

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
export class CodeEditElement extends mixter(
  HTMLElement,
  shadow(),
  events<{ scroll: Event }>(),
  attrs(
    class {
      /** The editor's value */
      value = ''
      /** Autofocus to the element when page loads */
      autoFocus = false
      /** Whether to autoresize to the height of the contents */
      autoResize = false
      /** Language for syntax highlighting */
      language = ''
      /** Theme to use */
      theme = ''
      /** Tab size */
      tabSize = 2
      /** Tab style */
      tabStyle: 'spaces' | 'tabs' = 'spaces'
      /** Comment */
      comments = '// /* */'
    }
  ),
  props(
    class {
      /** @private */
      CodeSyntax = element(CodeSyntaxElement)
      /** @private */
      SuperImpose = element(SuperImposeElement)
      /** @private */
      TextAreaCode = element(TextAreaCodeElement, { extends: 'textarea' })

      /** Passing a syntax definition regexp manually */
      syntax: SyntaxOrImport = {}

      /** @private */
      textarea?: TextAreaCodeElement
      /** @private */
      layout?: SuperImposeElement
      /** @private */
      height?: HTMLPreElement

      /** @private */
      onInput?: () => void
      /** @private */
      onScroll?: () => void
    }
  ),
  state<CodeEditElement>(({ $, effect, reduce }) => {
    const { part, render } = jsx($)
    const { ref } = refs($)

    $.onInput = reduce(({ textarea }) => (() => {
      $.value = textarea.value
    }), () => {})

    $.onScroll = reduce(({ host }) => (() => {
      host.dispatchEvent(new Event('scroll', { bubbles: true }))
    }), () => {})

    effect(({ autoResize, layout, height, value: _ }) => {
      if (autoResize) {
        // push to the end of the job when height has actually changed
        queueMicrotask(() => {
          layout.style.height = (height.getBoundingClientRect().height ?? 'auto') + 'px'
        })
      }
    })

    effect(({ autoFocus, textarea }) => {
      if (autoFocus) {
        // deal with browser autofocus warning on initial load
        setTimeout(() => {
          textarea.focus()
          // move the caret to the beginning
          setTimeout(() => textarea.setSelectionRange(0, 0))
        })
      }
    })

    effect(({ root }) =>
      onTextChange(root as ShadowRoot, text => {
        $.value = text
      })
    )

    const Content = part((
      {
        SuperImpose,
        TextAreaCode,
        CodeSyntax,
        onScroll,
        onInput,
        comments,
        tabSize,
        tabStyle,
        theme,
        language,
        syntax,
        value,
      },
    ) => (
      <>
        <pre ref={ref.height}>{value}{' '}</pre>
        <SuperImpose
          part="layout"
          ref={ref.layout}
          onscroll={onScroll}
        >
          <TextAreaCode
            part="textarea"
            slot="leader"
            ref={ref.textarea}
            comments={comments}
            oninput={onInput}
            tabSize={tabSize}
            tabStyle={tabStyle}
            theme={theme}
            value={value}
          />
          <CodeSyntax
            part="syntax"
            slot="follower"
            language={language}
            syntax={syntax}
            theme={theme}
          >
            {value}
          </CodeSyntax>
        </SuperImpose>
      </>
    ))

    render(() => (
      <>
        <style>{style}</style>
        <slot></slot>
        <Content />
      </>
    ))
  })
) {
  get scrollLeft() {
    return this.textarea?.scrollLeft ?? 0
  }
  get scrollTop() {
    return this.textarea?.scrollTop ?? 0
  }
}
