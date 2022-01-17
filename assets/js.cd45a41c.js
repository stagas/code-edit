const o=RegExp,e=(n,...t)=>o(`(${t.map(i=>`(${i.source})`).join(n)})`),r=n=>o(`(${n.split(" ").map(t=>t.replace(/[\^$\\()[\]?*+\-.|]/g,"\\$&").trim()).filter(t=>t.length).join("|")})`),a=(n,t)=>o(`(${t.source})${n}`),s={comment:[e("|",/(\/\*)[^]*?(\*\/)/,/(\s?(\/\/)[\S\s]*?(?=[\n\r]))/,/(\/\*)[^]*/),{_:[/@\w*\s?[\w:/.-]+/,{comment:/(?<=@returns)\s\w+/,declare:/@\w+/}],comment:/.+?/}],keyword:e("",/\b/,r(`
      break do instanceof typeof case else new try catch finally
      return continue for of switch while with debugger default
      if throw delete in as from export import async await void
      extends implements private public package protected static
      declare yield
    `),/\b(?![:()])/),declare:e("",/\b(?![:])/,r(`
      class function constructor prototype
      const get set var let interface type
      enum string boolean number any unknown never
      Object String Number RegExp Buffer Math
      Set Map
    `),/\b(?![:])/),function:e("|",/[$#\w]+(?=(\s\=)?\s*[<(`])/,/(?<=(class|interface)\s+)\w+(?=(<\w>)?\s*((extends|implements)\s*[\w<>]+\s*(implements\s*\w+\s*)?)?\s*\{)/,/(?<=extends\s+)\w+/,/(?<=implements\s+)\w+/),arrow:/=>/,builtin:r("true false null undefined NaN Infinity"),imports:[/(?<=import|export).*[\w{}*]+(?=\sfrom\s)/,{keyword:/\sas\s/,builtin:/\*/}],special:r("this super"),regexp:[/\/((?:\\\/)|[^/\n\s])+?\/[gimsuy]*/,{builtin:/\\.*?\]|\\[^]/,operator:/[\^+*?]/,string:/.+?/}],string:e("|",/('(?:(?:\\\n|\\'|[^'\n]))*'?)/,/("(?:(?:\\\n|\\"|[^"\n]))+"?)/),arguments:null,property:/\w+(?=:)/,punctuation:"[ ] ( ) { } ; ,",number:e("",e("",/(?=\.\d|\d)/,/(?:\d+)?/,/(?:\.?\d*)/),/(?:[eE]([+-]?\d+))?/),operator:a("{1}",r(`
      : + - ~ !
      ** ?? ?. >> << >>> < > <= >= == != === !==
      && || *= /= %= += -= <<= >>= >>>= &= ^= |= **=
      = ? ... * / % & ^ | ++ --
    `))};s.arguments=[e("|",/\w+\s+(?==>)/,e("",/(?<=(function\s+\w+|async)\s*\([^\s]*)/,/(?<=\([^)]*)/,/[^)]*/,/(?=.*(=>|{))/),e("",/(?<!(if|for|while|switch).*)/,/(?<=\()[^)]*(?=\).+{)/),e("",/(?<!(if|for|while|switch).*)/,/(?<=\([^)]*)/,/[^)]*/,/(?=.*(=>|{))/)),{_:[/(?:[:=|<]\s?)\w+/,{...s,arguments:null}],...s,arguments:/[$\w]+/}];s.template=[/(`(?:(?:\\`|[^`]))*`?)/,{template:[/\$\{[^]*?\}/,{...s,operator:e("|",s.operator,/\$\{|}/)}],string:/.+?/}];var l=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",default:s});export{s as R,l as a,e as j,r as s};
