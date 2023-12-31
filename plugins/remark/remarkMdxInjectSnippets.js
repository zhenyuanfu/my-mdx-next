import { removePosition } from 'unist-util-remove-position';
import { visit, SKIP } from 'unist-util-visit';
export const remarkMdxInjectSnippets = (snippetTreeMap) => {
    return (tree, file) => {
        visit(tree, (node, index, parent) => {
            if (parent && index !== null && node.type === 'mdxJsxFlowElement') {
                const mdxJsxFlowElement = node;
                if (mdxJsxFlowElement.name === 'Snippet') {
                    const fileAttr = mdxJsxFlowElement.attributes.find((attr) => attr.type === 'mdxJsxAttribute' && attr.name === 'file');
                    const name = fileAttr?.value;
                    if (typeof name === 'string') {
                        const snippet = snippetTreeMap[name];
                        if (snippet) {
                            const fragment = removePosition(structuredClone(snippet));
                            parent.children.splice(index, 1, ...fragment.children);
                            return [SKIP, index];
                        }
                        else {
                            file.message('Cannot expand missing snippet `' + name + '`', node, 'remark-mdx-inject-snippets');
                        }
                    }
                }
            }
        });
    };
};
