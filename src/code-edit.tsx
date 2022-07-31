/** @jsxImportSource sigl */
import $ from 'sigl'

// import { escape } from 'html-escaper'
import { getElementOffset } from 'get-element-offset'
import { getRelativeMouse } from 'relative-mouse'

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

export type Marker = {
  key: string
  index: number
  size: number
  source: string
  class: string
  el?: HTMLSpanElement
  rect?: DOMRect
  oncreate?: (el: HTMLSpanElement) => void
  onenter?: (el: HTMLSpanElement) => void
  onleave?: (el: HTMLSpanElement) => void
  onwheel?: $.EventHandler<any, WheelEvent>
}

export type Lens = {
  line: number
  message: string
}

const style = ({ fontSize = 9.5 }: { fontSize: number }) => /*css*/ `
:host {
  contain: size layout style paint;
  --caret: #fff;
  --selection: #742;
  --padding: 0;
  --font-size: ${fontSize}pt;
  position: relative;
  font-size: var(--font-size);
  display: block;
  overflow: hidden;
  background: var(--background, transparent);
}
slot {
  display: none;
}
pre,
textarea {
  contain: layout style paint;
  z-index: 3;
  display: flex;
  white-space: pre;
  padding: 0;
  padding-right: 10px;
  margin: 0;
  width: 100%;
  height: 100%;
  resize: none;
  outline: none;
  caret-color: transparent;
  background: transparent;
  color: transparent;
  border: none;
}
pre {
  left: 0;
  top: 0;
  position: absolute;
  width: auto;
  height: auto;
  z-index: -1;
}
pre,
textarea,
code {
  shape-rendering: optimizeSpeed;
  text-rendering: optimizeSpeed;
  font-size: inherit;
  font-family: inherit;
  line-height: inherit;
}
textarea::selection {
  color: var(--color);
  background-color: var(--selection) !important;
}
.shadow {
  text-rendering: optimizeSpeed;
  contain: layout style paint;
  position: absolute;
  color: #000;
  /* font-weight: bold; */
  z-index: 1;
}
[part=syntax] {
  text-rendering: optimizeSpeed;
  position: absolute;
  background: transparent;
  z-index: 2;
}
[part=lenses],
[part=markers] {
  contain: size layout style;
  text-rendering: optimizeSpeed;
  position: absolute;
  left: 0;
  top: 0;
  z-index: -1;
}
[part=markers] .marker {
  display: inline;
  color: transparent;
}
[part=lenses] .lens {
  display: inline-block;
  color: var(--brightBlack);
  font-style: italic;
  transform: scale(0.8);
}
[part=layout] {
  overflow: hidden !important;
}
@keyframes blink {
  from,
  to {
    opacity: 0.0;
  }
  50% {
    opacity: 1.0;
  }
}
/* .caret {
  z-index: 1;
  pointer-events: none;
} */
[part=caret] {
  height: 1em;
  position: absolute;
  width: calc(var(--font-size) * 0.08);
  background: var(--caret);
  margin-left: 0.5px;
  opacity: 0.3;
}
:host([hasfocus]) [part=caret] {
  opacity: 1;
}
:host([hasfocus][caretblink=blink]) [part=caret] {
  animation: blink 1.2s step-end infinite;
}
/* :host([caretshift=forward]) [part=caret] {
  margin-left: 0;
} */
:host([caretshift=backward]) [part=caret] {
  margin-left: -5px;
}
`

export interface CodeEditElement extends $.Element<CodeEditElement> {}

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
@$.element()
export class CodeEditElement extends HTMLElement {
  /** The editor's value */
  @$.attr.out() value = ''
  /** Font size */
  @$.attr.out() fontSize = 9.5
  /** Autofocus to the element when page loads */
  @$.attr() autoFocus = false
  /** Whether to autoresize to the height of the contents */
  @$.attr() autoResize = false
  /** Language for syntax highlighting */
  @$.attr() language = ''
  /** Theme to use */
  @$.attr() theme = ''
  /** Tab size */
  @$.attr() tabSize = 2
  /** Tab style */
  @$.attr() tabStyle: 'spaces' | 'tabs' = 'spaces'
  /** Comment */
  @$.attr() comments = '// /* */'
  /** Shadow */
  @$.attr() textShadow = false

  @$.attr() hasFocus = false

  CodeSyntax = $.element(CodeSyntaxElement)
  SuperImpose = $.element(SuperImposeElement)
  TextAreaCode = $.element(TextAreaCodeElement)

  TextShadow?: (props: { x: number; y: number }) => JSX.Element

  /** Passing a syntax definition regexp manually */
  syntax: SyntaxOrImport = {}

  textarea?: TextAreaCodeElement
  layout?: SuperImposeElement
  height?: HTMLPreElement

  /** Custom markers */
  markers: Marker[] = []
  markersCss?: (selector: string) => string = () => ''
  hoveringMarker?: Marker | null

  /** Lens */
  lenses: Lens[] = []

  root = $(this).shadow()

  get scrollLeft() {
    return this.layout?.scrollLeft ?? 0
  }
  get scrollTop() {
    return this.layout?.scrollTop ?? 0
  }

  onInput = $(this).reduce(({ $, textarea }) => (() => {
    const { scrollLeft, scrollTop } = this
    $.value = textarea.value
    Object.assign(textarea, { scrollLeft, scrollTop })
  }), () => {})

  onScroll = $(this).reduce(({ host }) => (() => {
    $.dispatch.composed(host, 'scroll')
  }), () => {})

  onWheel: $.EventHandler<SuperImposeElement, WheelEvent> = $(this).reduce(({ $ }) =>
    $.event.not.passive(e => {
      if (e.ctrlKey || e.metaKey) {
        e.stopImmediatePropagation()
        e.preventDefault()
        $.fontSize = Math.max(1, $.fontSize + Math.sign(e.deltaY) * 0.5)
      }
    })
  )

  caretIndex = 0
  @$.attr() caretShift: 'forward' | 'backward' | 'none' = 'none'
  @$.attr() caretBlink: 'blink' | 'none' = 'none'
  caretBlinkTimeout: any = -1

  updateCaret = $(this).reduce(({ $, textarea }) => (() => {
    const range = textarea.buffer?.getRange()
    if (range) {
      if (range.hasSelection) {
        $.caretShift = range.selectionDirection
      } else {
        $.caretShift = 'none'
      }
      $.caretBlink = 'none'
      $.caretIndex = range.caretIndex ?? 0
      clearTimeout($.caretBlinkTimeout)
      $.caretBlinkTimeout = setTimeout(() => {
        $.caretBlink = 'blink'
      }, 500)
    }
  }))

  mounted($: CodeEditElement['$']) {
    $.effect(({ host, textarea }) => {
      host.tabIndex = 0
      return $.chain(
        $.on(textarea).pointerdown.capture.stop(() => {
          $.hasFocus = true
        }),
        $.on(host).focus(e => {
          $.hasFocus = true
          if (!e.composedPath().includes(textarea)) {
            textarea.focus({ preventScroll: true })
          }
        }),
        $.on(textarea).blur(() => {
          $.hasFocus = false

          // NOTE: without this, an invisible range can stay inside
          // the textarea that causes problems on refocus
          // e.g you can accidentally drag a selection range and move
          // the text while trying to focus (happens often).
          // The expectation when clicking outside a code editor (blurring)
          // that ranges are also removed, but that isn't the default
          // behavior in the browser. So we remove the ranges forcibly here.

          // setTimeout(() => {
          // we did actually blur and not refocus
          // if ($.getActiveElement(host) !== textarea) {
          window.getSelection()?.removeAllRanges()
          // }
          // }, 100)
        })
      )
    })

    $.effect(({ host, textarea, updateCaret }) =>
      $.chain(
        $.on(document).selectionchange.task(() => {
          if ($.getActiveElement(host) === textarea) {
            updateCaret()
          }
        }),
        $.on(textarea).input(updateCaret)
      )
    )

    $.effect(({ root }) =>
      $.onTextChange(root, text => {
        $.value = text
      })
    )

    $.effect(({ textarea }) => {
      setTimeout(() => {
        textarea.setSelectionRange(0, 0, 'forward')
        // arbitrary delay to move caret to the beginning initially.
        // increase to fix issues with caret being at the end initially.
      }, 100)
    })

    $.effect(({ autoResize, layout, height, value: _ }) => {
      if (autoResize) {
        // push to the end of the job when height has actually changed
        queueMicrotask(() => {
          layout.style.height = (height.offsetHeight ?? 'auto') + 'px'
        })
      }
    })

    $.effect(({ autoFocus, textarea }) => {
      if (autoFocus) {
        // deal with browser autofocus warning on initial load
        setTimeout(() => {
          textarea.focus()
          // move the caret to the beginning
          setTimeout(() => textarea.setSelectionRange(0, 0, 'forward'))
        })
      }
    })

    $.effect(({ host }) =>
      $.on(host).pointerleave(() => {
        $.hoveringMarker = null
      })
    )

    $.effect(({ host, hoveringMarker }) => {
      const el = hoveringMarker.el!
      hoveringMarker.onenter?.(el)
      el.classList.add('hover')
      const offWheel = $.on(host).wheel.not.passive(ev => {
        hoveringMarker.onwheel?.(ev)
      })
      return () => {
        hoveringMarker.onleave?.(el)
        el.classList.remove('hover')
        return offWheel()
      }
    })

    $.effect(({ textarea, markers, fontSize: _ }) =>
      $.on(textarea).pointermove(e => {
        const pos = getRelativeMouse(textarea, { x: e.offsetX, y: e.offsetY })
        const offset = getElementOffset(textarea)
        const x = pos.x + offset.x + textarea.scrollLeft
        const y = pos.y + offset.y + textarea.scrollTop
        for (const marker of markers) {
          const rect = marker.rect!
          if (
            x > rect.left && x < rect.right
            && y > rect.top && y < rect.bottom
          ) {
            $.hoveringMarker = marker
            return
          }
        }
        $.hoveringMarker = null
      })
    )

    const Markers = $.part(({ markers, markersCss, fontSize: _ }) => (
      <div part="markers">
        <style>{markersCss('[part=markers]')}</style>
        {markers.map(x => {
          const start = x.index
          const end = x.index + x.size
          return (
            <pre key={x.key}>
              <code>
                {x.source.slice(0, start)}
                <span
                  class={['marker', x.class].join(' ')}
                  ref={{
                    get current() {
                      return x.el!
                    },
                    set current(el: HTMLSpanElement) {
                      x.el = el

                      if (
                        !x.rect
                        || (x.rect.left !== el.offsetLeft)
                        || (x.rect.top !== el.offsetTop)
                      ) {
                        x.rect = new DOMRect(
                          el.offsetLeft,
                          el.offsetTop,
                          el.offsetWidth,
                          el.offsetHeight
                        )
                      }

                      x.oncreate?.(el)
                    },
                  }}
                >
                  {x.source.slice(start, end)}
                </span>
                {x.source.slice(end)}
              </code>
            </pre>
          )
        })}
      </div>
    ))

    const Lenses = $.part(({ lenses }) => {
      const lines = $.value.split('\n')
      return (
        <div part="lenses">
          <pre>
            <code>
              {lines.map((text, line) => (
                <>
                  {text}
                  {lenses.filter(x => x.line - 1 == line).map(x => <span class="lens">{x.message}</span>)}
                  {'\n'}
                </>
              ))}
            </code>
          </pre>
        </div>
      )
    })

    $.TextShadow = $.reduce(({ value }) => (({ x, y }) => (
      <pre class="shadow" style={`left: ${x}px; top: ${y}px;`}>
        <code>{value}</code>
      </pre>
    )))

    const Caret = $.part(({ value, caretIndex }) => (
      <pre class="caret">
        <code>
          {value.slice(0, caretIndex)}
          <span part="caret"></span>
          {value.slice(caretIndex)}
          {' '}
        </code>
      </pre>
    ))

    const Shadow = $.part(({ TextShadow }) => (
      [-0.5, 0, 0.5].flatMap(x => (
        [-0.5, 0, 0.5].map(y => <TextShadow x={x} y={y} />)
      ))
    ))

    const Content = $.part((
      {
        SuperImpose,
        TextAreaCode,
        CodeSyntax,
        onWheel,
        onScroll,
        onInput,
        comments,
        tabSize,
        tabStyle,
        theme,
        language,
        textShadow,
        syntax,
        value,
      },
    ) => (
      <>
        <pre ref={$.ref.height}>{value}{' '}</pre>
        <SuperImpose
          part="layout"
          ref={$.ref.layout}
          onwheel={onWheel}
          onscroll={onScroll}
        >
          <TextAreaCode
            part="textarea"
            slot="leader"
            ref={$.ref.textarea}
            comments={comments}
            oninput={onInput}
            tabSize={tabSize}
            tabStyle={tabStyle}
            theme={theme}
            value={value}
          />
          <div slot="follower">
            <CodeSyntax
              part="syntax"
              slot="follower"
              language={language}
              syntax={syntax}
              theme={theme}
            >
              {value}
            </CodeSyntax>
            {textShadow && <Shadow />}
            <Lenses />
            <Markers />
            <Caret />
          </div>
        </SuperImpose>
      </>
    ))

    $.render(({ fontSize }) => (
      <>
        <style>{style({ fontSize })}</style>
        <slot></slot>
        <Content />
      </>
    ))
  }
}
