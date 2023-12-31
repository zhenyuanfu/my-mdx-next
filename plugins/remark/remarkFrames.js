import { toMdxJsxFlowElement } from '../../lib/remark-utils.js';
export const remarkFrames = () => {
    return (tree) => {
        let preTree = { children: [] };
        // console.log('tree=', tree);
        tree.children = tree.children.map((node) => {
            // Start of horizontal block: -- block
            if (node.type === 'paragraph' &&
                node.children.length === 1 &&
                node.children[0].value === '-- block') {
                node.type = 'jsx';
                node.value = `<div className='grid md:grid-cols-2 md:gap-8'><div>`;
            }
            // Start a new column: -- column
            if (node.type === 'paragraph' &&
                node.children.length === 1 &&
                node.children[0].value === '-- column') {
                node.type = 'jsx';
                node.value = `</div><div>`;
            }
            // End of horizontal block: -- /block
            if (node.type === 'paragraph' &&
                node.children.length === 1 &&
                node.children[0].value === '-- /block') {
                node.type = 'jsx';
                node.value = `</div></div>`;
            }
            if (node.type === 'mdxJsxFlowElement' && (node.name === 'Example' || node.name === 'Frame')) {
                node.name = 'Frame';
            }
            if (node.type === 'jsx') {
                node = toMdxJsxFlowElement(node.value);
            }
            return node;
        });
        tree.children = [...preTree.children, ...tree.children];
    };
};
