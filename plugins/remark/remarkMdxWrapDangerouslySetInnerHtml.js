import { visit } from 'unist-util-visit';
export const remarkMdxWrapDangerouslySetInnerHtml = () => {
    return (tree) => {
        visit(tree, (node, i, parent) => {
            if (node.type === 'mdxJsxFlowElement') {
                const mdxJsxFlowElement = node;
                const attributesExist = mdxJsxFlowElement.attributes.length >= 1;
                if (mdxJsxFlowElement.name === 'div' && attributesExist) {
                    const dangerouslySetInnerHTML = mdxJsxFlowElement.attributes.find((attr) => attr.type === 'mdxJsxAttribute' && attr.name === 'dangerouslySetInnerHTML');
                    if (dangerouslySetInnerHTML &&
                        dangerouslySetInnerHTML.value &&
                        typeof dangerouslySetInnerHTML.value === 'object' &&
                        dangerouslySetInnerHTML.value.value.includes('quartoRawHtml')) {
                        const wrap = {
                            type: 'mdxJsxFlowElement',
                            name: 'DynamicCustomComponent',
                            attributes: [],
                            data: { _mdxExplicitJsx: true },
                            children: [node],
                        };
                        if (parent && i)
                            parent.children[i] = wrap;
                    }
                }
            }
        });
    };
};
