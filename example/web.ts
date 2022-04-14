import 'code-syntax/themes/default.css'
import 'plenty-themes/laser.css'

import { CodeEditElement, languages } from '../src'

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
