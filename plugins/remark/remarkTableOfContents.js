import { slugifyWithCounter } from '@sindresorhus/slugify';
import { addExport, createMdxJsxAttribute } from '../../lib/remark-utils.js';
const getTOCTitle = (node, i = 1, a = []) => {
    if ((node.type === 'text' &&
        (a[i - 1]?.type !== 'mdxJsxFlowElement' || !a[i - 1]?.value.startsWith('<small'))) ||
        node.type === 'inlineCode') {
        return node.value;
    }
    if (node.children) {
        let title = '';
        node.children.forEach((node, i, a) => {
            title += getTOCTitle(node, i, a);
        });
        return title;
    }
    return '';
};
export const remarkTableOfContents = () => {
    // slugifyWithCounter adds a counter (eg. slug, slug-2, slug-3) to the end of the slug if the header
    // already exists. No counter is added for the first occurence.
    const slugify = slugifyWithCounter();
    return (tree) => {
        const contents = [];
        let hasTopLayer = false;
        for (let nodeIndex = 0; nodeIndex < tree.children.length; nodeIndex++) {
            let node = tree.children[nodeIndex];
            if ((node.type === 'heading' && [1, 2, 3, 4].includes(node.depth)) ||
                (node.type === 'mdxJsxFlowElement' && ['h1', 'h2', 'h3', 'h4'].includes(node.name))) {
                let level = node.depth ? node.depth : node.name.split('')[1];
                let title = getTOCTitle(node);
                const slug = slugify(title, { decamelize: false });
                let mdxJsxAttributes = [
                    createMdxJsxAttribute('level', level),
                    createMdxJsxAttribute('id', slug),
                ];
                node.attributes = mdxJsxAttributes;
                node.type = 'mdxJsxFlowElement';
                node.name = 'Heading';
                const depth = node.depth;
                if (level <= 2) {
                    hasTopLayer = true;
                    contents.push({ title, slug, depth, children: [] });
                }
                else {
                    // Account if there is no first layer
                    let arrToPushInto = contents;
                    if (hasTopLayer) {
                        arrToPushInto = contents[contents.length - 1].children;
                    }
                    arrToPushInto.push({ title, slug, depth, children: [] });
                }
            }
        }
        addExport(tree, 'tableOfContents', contents);
    };
};
