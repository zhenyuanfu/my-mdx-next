import { toHtml } from 'hast-util-to-html';
import { visit } from 'unist-util-visit';
import { addExport, isMdxJsxFlowElement } from '../../lib';
const langFilename = (className) => {
    switch (className) {
        case 'language-shell':
            return 'Bash';
        case 'language-json':
            return 'JSON';
        case 'language-js':
            return 'JavaScript';
        default:
            const language = className.substring(9);
            return language.charAt(0).toUpperCase() + language.slice(1);
    }
};
export const rehypeMdxExtractExamples = () => {
    return (tree) => {
        let request;
        let response;
        visit(tree, isMdxJsxFlowElement, (node, i, parent) => {
            if (node.name === 'RequestExample') {
                request = request ?? {
                    type: node.name,
                    children: parseChildren(node),
                };
                if (parent && i !== null)
                    parent.children.splice(i, 1);
            }
            else if (node.name === 'ResponseExample') {
                response = response ?? {
                    type: node.name,
                    children: parseChildren(node),
                };
                if (parent && i !== null)
                    parent.children.splice(i, 1);
            }
        });
        addExport(tree, 'userDefinedExamples', { request, response });
        return tree;
    };
};
const parseChildren = (node) => {
    return node.children.filter(isMdxJsxFlowElement).flatMap((child) => {
        const preComponent = child.children[0];
        if (preComponent?.type !== 'element')
            return [];
        const html = toHtml(preComponent);
        let filename = Array.isArray(preComponent.properties?.className) &&
            typeof preComponent.properties?.className[0] === 'string'
            ? langFilename(preComponent.properties.className[0])
            : '';
        if ('attributes' in child && typeof child.attributes[0]?.value === 'string') {
            filename = child.attributes[0].value;
        }
        return [
            {
                filename,
                html,
            },
        ];
    });
};
