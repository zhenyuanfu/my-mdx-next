import { map } from 'unist-util-map';
import { isMdxJsxFlowElement, findExportedNodes } from '../../../lib';
import { createCommentNode } from './createCommentNode';
const rehypeMdxRemoveUnknownJsx = (options) => (tree) => {
    const exportedComponentNames = findExportedNodes(tree, 'ArrowFunctionExpression');
    return map(tree, (node) => {
        if (isMdxJsxFlowElement(node)) {
            if (node.name &&
                !options.allowedComponents?.includes(node.name) &&
                !exportedComponentNames.includes(node.name)) {
                return createCommentNode(node.name);
            }
        }
        return node;
    });
};
export default rehypeMdxRemoveUnknownJsx;
