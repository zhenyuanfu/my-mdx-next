// TODO - this is a hack to inject requirejs into the docs to generate Nixtla's graphs.
// Create a more sustainable solution for this.
export const remarkMdxInjectRequire = (subdomain) => {
    return (tree) => {
        if (subdomain === 'nixtla-docs' || subdomain === 'nixtla') {
            tree.children.push({
                type: 'mdxJsxFlowElement',
                name: 'script',
                children: [],
                data: {
                    _mdxExplicitJsx: true,
                },
                attributes: [
                    {
                        type: 'mdxJsxAttribute',
                        name: 'src',
                        value: 'https://requirejs.org/docs/release/2.3.6/minified/require.js',
                    },
                ],
            });
        }
    };
};
