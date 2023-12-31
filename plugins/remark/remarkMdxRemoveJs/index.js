import { estreeIsProgram } from '@mintlify/common';
import { remove } from 'unist-util-remove';
import { findExportedNodes } from '../../../lib';
export const remarkMdxRemoveJs = () => (tree) => {
    const exportedVariables = findExportedNodes(tree, 'Literal', 'JSXElement');
    remove(tree, (node) => {
        if (!nodeIsMdxFlowExpression(node) || !estreeIsProgram(node))
            return false;
        if (node.data.estree.body[0] == undefined || node.data.estree.body.length > 1)
            return false;
        if (node.data.estree.body[0].type !== 'ExpressionStatement')
            return false;
        if (node.data.estree.body[0].expression.type !== 'Identifier')
            return false;
        if (exportedVariables.includes(node.data.estree.body[0].expression.name))
            return false;
        return true;
    });
};
const nodeIsMdxFlowExpression = (node) => node.type === 'mdxFlowExpression';
