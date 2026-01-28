import { visit } from 'unist-util-visit'
import type { Root, Code } from 'mdast'

interface ExtendedData {
  meta?: string
  hProperties?: Record<string, string>
}

/**
 * Remark plugin that preserves code block meta strings
 * so they can be accessed by rehype plugins.
 *
 * Converts: ~~~python runnable
 * Into a code node with hProperties containing the meta
 */
export function remarkCodeMeta() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code) => {
      if (node.meta) {
        // Use type assertion for our extended data structure
        const data = (node.data ?? {}) as ExtendedData

        // Store meta for rehype
        data.meta = node.meta

        // Also store in hProperties so it survives the mdast->hast transform
        if (!data.hProperties) {
          data.hProperties = {}
        }
        data.hProperties['data-meta'] = node.meta

        // Assign back to node
        node.data = data
      }
    })
  }
}

export default remarkCodeMeta
