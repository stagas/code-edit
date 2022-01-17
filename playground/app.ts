import 'scoped-registries'
import 'plenty-themes/laser.css'
import 'code-syntax/themes/default.css'

import { CodeEditElement, languages } from '../src'

languages.js = import('code-syntax/languages/js')

customElements.define('code-edit', CodeEditElement)

declare global {
  interface HTMLCollectionOf<T> {
    [Symbol.iterator](): Iterator<T>
  }
}

const editors = [...document.getElementsByTagName('code-edit')] as CodeEditElement[]

editors.forEach(el => {
  el.value = `\
attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
  if (['tabsize', 'tabstyle', 'comments'].includes(name)) {
    this.textarea.setAttribute(name, newValue!)
  } else if (['language', 'theme'].includes(name)) {
    this.syntax.setAttribute('language', newValue!)
  }
}
`
})

setTimeout(() => {
  editors[0].value = 'something else'
}, 500)
