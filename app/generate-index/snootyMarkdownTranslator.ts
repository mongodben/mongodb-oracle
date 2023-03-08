import { TranslatorConfigObject} from "node-html-markdown";

const surround = (source: string, surroundStr: string) => `${surroundStr}${source}${surroundStr}`;

export const snootyMarkdownTranslator: TranslatorConfigObject = {
  /* Code (block / inline) */
  'code': ({ node, parent, options: { codeFence, codeBlockStyle }, visitor }) => {
    const isCodeBlock = [ 'PRE', 'WRAPPED-PRE' ].includes(parent?.tagName!) && parent!.childNodes.length < 2;

    /* Handle code (non-block) */
    if (!isCodeBlock) {
      return {
        spaceIfRepeatingChar: true,
        noEscape: true,
        postprocess: ({ content }) => {
          // Find longest occurring sequence of running backticks and add one more (so content is escaped)
          const delimiter = '`' + (content.match(/`+/g)?.sort((a, b) => b.length - a.length)?.[0] || '');
          const padding = delimiter.length > 1 ? ' ' : '';

          return surround(surround(content, padding), delimiter)
        }
      }
    } 
    /* Handle code block */
    if (codeBlockStyle === 'fenced') {
      const language = node.getAttribute('class')?.match(/\b(java|go|javascript|csharp|swift|dart|kotlin|js|python|bash|sh|shell)\b/)?.[1] || '';
      return {
        noEscape: true,
        prefix: codeFence + language + '\n',
        postfix: '\n' + codeFence,
        childTranslators: visitor.instance.codeBlockTranslators
      }
    } else {
      return {
        noEscape: true,
        postprocess: ({ content }) => content.replace(/^/gm, '    '),
        childTranslators: visitor.instance.codeBlockTranslators
      }
    }
  },
}
