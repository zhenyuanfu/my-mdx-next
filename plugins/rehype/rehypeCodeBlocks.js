import { visit } from 'unist-util-visit';
const exampleNames = ['RequestExample', 'ResponseExample'];
const flowElementType = 'mdxJsxFlowElement';
function isElement(node, key = 'type', element = 'element') {
    return node != undefined && node[key] === element;
}
function addCodeBlocks(tree) {
    const preTree = { children: [] };
    visit(tree, (node, i, parent) => {
        if (parent == null || i == null || !isElement(node) || !isElement(node, 'tagName', 'pre')) {
            return;
        }
        const code = node.children[0];
        if (!isElement(code, 'tagName', 'code'))
            return;
        let filename = undefined;
        const isFlowElement = isElement(parent, 'type', flowElementType);
        const parentName = isFlowElement ? parent.name : undefined;
        if (parentName && exampleNames.includes(parentName)) {
            const parentType = parentName.slice(0, -7);
            filename = i === 0 ? parentType : `${parentType} ${i + 1}`;
            if (!code.data?.meta) {
                code.data = {
                    ...code.data,
                    meta: filename,
                };
            }
        }
        if (code.data?.meta && typeof code.data.meta === 'string') {
            filename = code.data.meta;
        }
        const wrap = {
            type: flowElementType,
            name: 'CodeBlock',
            attributes: [{ type: 'mdxJsxAttribute', name: 'filename', value: filename ?? '' }],
            data: { _mdxExplicitJsx: true },
            children: [],
        };
        wrap.children = [node];
        parent.children[i] = wrap;
    });
    tree.children = [...preTree.children, ...tree.children];
}
export function rehypeCodeBlocks() {
    return addCodeBlocks;
}
