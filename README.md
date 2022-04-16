<h1>
code-edit <a href="https://npmjs.org/package/code-edit"><img src="https://img.shields.io/badge/npm-v2.0.1-F00.svg?colorA=000"/></a> <a href="src"><img src="https://img.shields.io/badge/loc-176-FFF.svg?colorA=000"/></a> <a href="https://cdn.jsdelivr.net/npm/code-edit@2.0.1/dist/code-edit.min.js"><img src="https://img.shields.io/badge/brotli-7.8K-333.svg?colorA=000"/></a> <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-F0B.svg?colorA=000"/></a>
</h1>

<p></p>

Lightweight code editor Web Component with syntax highlighting

<h4>
<table><tr><td title="Triple click to select and copy paste">
<code>npm i code-edit </code>
</td><td title="Triple click to select and copy paste">
<code>pnpm add code-edit </code>
</td><td title="Triple click to select and copy paste">
<code>yarn add code-edit</code>
</td></tr></table>
</h4>

## Examples

<details id="example$web" title="web" open><summary><span><a href="#example$web">#</a></span>  <code><strong>web</strong></code></summary>  <ul>    <details id="source$web" title="web source code" ><summary><span><a href="#source$web">#</a></span>  <code><strong>view source</strong></code></summary>  <a href="example/web.ts">example/web.ts</a>  <p>

```ts
import 'code-syntax/themes/default.css'
import 'plenty-themes/laser.css'

import { CodeEditElement, languages } from 'code-edit'

languages.js = import('code-syntax/languages/js')
customElements.define('code-edit', CodeEditElement)

const style = document.createElement('style')
style.textContent = /*css*/ `
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
body {
  background: #333;
}
pre {
  color: var(--color);
  background: var(--background);
}
code-edit {
  margin: 15px;
  padding: 15px;
  resize: both;
}
`
document.head.appendChild(style)

document.body.innerHTML = /*html*/ `
<code-edit id="demo" autoresize autofocus language="js" theme="laser">export interface HTMLCodeEditElement {
  value?: string
  language?: string
  syntax?: SyntaxDefinition | Promise&lt;{ default: SyntaxDefinition }&gt;
  theme?: string
  tabsize?: number
  tabstyle?: 'tabs' | 'spaces'
  comments?: string
}</code-edit>
`
```

</p>
</details></ul></details>

## API

<p>  <details id="CodeEditElement$1" title="Class" open><summary><span><a href="#CodeEditElement$1">#</a></span>  <code><strong>CodeEditElement</strong></code>     &ndash; CodeEdit custom element</summary>  <a href="src/code-edit.tsx#L74">src/code-edit.tsx#L74</a>  <ul>  <p>

```js
import { CodeEditElement } from 'code-edit'
customElements.define('code-edit', CodeEditElement)
```

```html
<code-edit autofocus autoresize language="js" theme="deep"> ... </code-edit>
```

</p>
      <p>  <details id="constructor$7" title="Constructor" ><summary><span><a href="#constructor$7">#</a></span>  <code><strong>constructor</strong></code><em>()</em>    </summary>    <ul>    <p>  <details id="new CodeEditElement$8" title="ConstructorSignature" ><summary><span><a href="#new CodeEditElement$8">#</a></span>  <code><strong>new CodeEditElement</strong></code><em>()</em>    </summary>    <ul><p><a href="#CodeEditElement$1">CodeEditElement</a></p>        </ul></details></p>    </ul></details><details id="autoFocus$14" title="Property" ><summary><span><a href="#autoFocus$14">#</a></span>  <code><strong>autoFocus</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>false</code></span>   &ndash; Autofocus to the element when page loads</summary>  <a href="src/code-edit.tsx#L83">src/code-edit.tsx#L83</a>  <ul><p>boolean</p>        </ul></details><details id="autoResize$15" title="Property" ><summary><span><a href="#autoResize$15">#</a></span>  <code><strong>autoResize</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>false</code></span>   &ndash; Whether to autoresize to the height of the contents</summary>  <a href="src/code-edit.tsx#L85">src/code-edit.tsx#L85</a>  <ul><p>boolean</p>        </ul></details><details id="comments$20" title="Property" ><summary><span><a href="#comments$20">#</a></span>  <code><strong>comments</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>'// /* */'</code></span>   &ndash; Comment</summary>  <a href="src/code-edit.tsx#L95">src/code-edit.tsx#L95</a>  <ul><p>string</p>        </ul></details><details id="language$16" title="Property" ><summary><span><a href="#language$16">#</a></span>  <code><strong>language</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>''</code></span>   &ndash; Language for syntax highlighting</summary>  <a href="src/code-edit.tsx#L87">src/code-edit.tsx#L87</a>  <ul><p>string</p>        </ul></details><details id="syntax$24" title="Property" ><summary><span><a href="#syntax$24">#</a></span>  <code><strong>syntax</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>{}</code></span>   &ndash; Passing a syntax definition regexp manually</summary>  <a href="src/code-edit.tsx#L108">src/code-edit.tsx#L108</a>  <ul><p><span>SyntaxOrImport</span></p>        </ul></details><details id="tabSize$18" title="Property" ><summary><span><a href="#tabSize$18">#</a></span>  <code><strong>tabSize</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>2</code></span>   &ndash; Tab size</summary>  <a href="src/code-edit.tsx#L91">src/code-edit.tsx#L91</a>  <ul><p>number</p>        </ul></details><details id="tabStyle$19" title="Property" ><summary><span><a href="#tabStyle$19">#</a></span>  <code><strong>tabStyle</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>'spaces'</code></span>   &ndash; Tab style</summary>  <a href="src/code-edit.tsx#L93">src/code-edit.tsx#L93</a>  <ul><p><code>"spaces"</code> | <code>"tabs"</code></p>        </ul></details><details id="theme$17" title="Property" ><summary><span><a href="#theme$17">#</a></span>  <code><strong>theme</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>''</code></span>   &ndash; Theme to use</summary>  <a href="src/code-edit.tsx#L89">src/code-edit.tsx#L89</a>  <ul><p>string</p>        </ul></details><details id="value$13" title="Property" ><summary><span><a href="#value$13">#</a></span>  <code><strong>value</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>''</code></span>   &ndash; The editor's value</summary>  <a href="src/code-edit.tsx#L81">src/code-edit.tsx#L81</a>  <ul><p>string</p>        </ul></details><details id="scrollLeft$9" title="Accessor" ><summary><span><a href="#scrollLeft$9">#</a></span>  <code><strong>scrollLeft</strong></code>    </summary>  <a href="src/code-edit.tsx#L217">src/code-edit.tsx#L217</a>  <ul>        </ul></details><details id="scrollTop$11" title="Accessor" ><summary><span><a href="#scrollTop$11">#</a></span>  <code><strong>scrollTop</strong></code>    </summary>  <a href="src/code-edit.tsx#L220">src/code-edit.tsx#L220</a>  <ul>        </ul></details></p></ul></details></p>

## Credits

- [code-syntax](https://npmjs.org/package/code-syntax) by [stagas](https://github.com/stagas) &ndash; Code syntax highlight Web Component
- [debounce-micro](https://npmjs.org/package/debounce-micro) by [stagas](https://github.com/stagas) &ndash; wrap a function in a debounce microtask
- [mixter](https://npmjs.org/package/mixter) by [stagas](https://github.com/stagas) &ndash; A Web Components framework.
- [super-impose](https://npmjs.org/package/super-impose) by [stagas](https://github.com/stagas) &ndash; Web Component that super imposes one child over another to the same scroll position
- [textarea-code](https://npmjs.org/package/textarea-code) by [stagas](https://github.com/stagas) &ndash; Web Component that extends a textarea element with code editor behavior.

## Contributing

[Fork](https://github.com/stagas/code-edit/fork) or [edit](https://github.dev/stagas/code-edit) and submit a PR.

All contributions are welcome!

## License

<a href="LICENSE">MIT</a> &copy; 2022 [stagas](https://github.com/stagas)
