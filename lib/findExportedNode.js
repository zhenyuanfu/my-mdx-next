import { nodeIncludesExport, isExportNode } from '@mintlify/common';
import { visit } from 'unist-util-visit';
export const findExportedNodes = (tree, ...type) => {
    const exports = [];
    visit(tree, nodeIncludesExport, (node) => {
        const body = node.data.estree.body;
        for (const bodyChild of body) {
            if (isExportNode(bodyChild)) {
                if (bodyChild.type === 'ExportAllDeclaration')
                    continue;
                if (bodyChild.declaration?.type !== 'VariableDeclaration')
                    continue;
                const declaration = bodyChild.declaration.declarations[0];
                if (declaration == undefined)
                    continue;
                const init = declaration.init;
                if (init == null)
                    continue;
                if (!type.includes(init.type))
                    continue;
                if (declaration.id.type !== 'Identifier')
                    continue;
                exports.push(declaration.id.name);
            }
        }
    });
    return exports;
};
