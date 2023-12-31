export const rehypeLayouts = () => {
    return (tree) => {
        tree.children.push({
            type: 'mdxjsEsm',
            value: `export default (props) => <MDXContentController {...props} tableOfContents={tableOfContents} userDefinedExamples={userDefinedExamples} endpoint={endpoint} pageMetadata={pageMetadata}>{props.children}</MDXContentController>`,
            data: {
                estree: {
                    type: 'Program',
                    sourceType: 'module',
                    body: [
                        {
                            type: 'ExportDefaultDeclaration',
                            declaration: {
                                type: 'ArrowFunctionExpression',
                                async: false,
                                expression: true,
                                generator: false,
                                id: null,
                                body: {
                                    type: 'JSXElement',
                                    children: [
                                        {
                                            type: 'JSXExpressionContainer',
                                            expression: {
                                                type: 'MemberExpression',
                                                computed: false,
                                                optional: false,
                                                object: {
                                                    name: 'props',
                                                    type: 'Identifier',
                                                },
                                                property: {
                                                    name: 'children',
                                                    type: 'Identifier',
                                                },
                                            },
                                        },
                                    ],
                                    closingElement: {
                                        type: 'JSXClosingElement',
                                        name: {
                                            type: 'JSXIdentifier',
                                            name: 'MDXContentController',
                                        },
                                    },
                                    openingElement: {
                                        type: 'JSXOpeningElement',
                                        selfClosing: false,
                                        name: {
                                            type: 'JSXIdentifier',
                                            name: 'MDXContentController',
                                        },
                                        attributes: [
                                            {
                                                type: 'JSXSpreadAttribute',
                                                argument: {
                                                    type: 'Identifier',
                                                    name: 'props',
                                                },
                                            },
                                            {
                                                type: 'JSXAttribute',
                                                name: {
                                                    type: 'JSXIdentifier',
                                                    name: 'tableOfContents',
                                                },
                                                value: {
                                                    type: 'JSXExpressionContainer',
                                                    expression: {
                                                        type: 'Identifier',
                                                        name: 'tableOfContents',
                                                    },
                                                },
                                            },
                                            {
                                                type: 'JSXAttribute',
                                                name: {
                                                    type: 'JSXIdentifier',
                                                    name: 'userDefinedExamples',
                                                },
                                                value: {
                                                    type: 'JSXExpressionContainer',
                                                    expression: {
                                                        type: 'Identifier',
                                                        name: 'userDefinedExamples',
                                                    },
                                                },
                                            },
                                            {
                                                type: 'JSXAttribute',
                                                name: {
                                                    type: 'JSXIdentifier',
                                                    name: 'endpoint',
                                                },
                                                value: {
                                                    type: 'JSXExpressionContainer',
                                                    expression: {
                                                        type: 'Identifier',
                                                        name: 'endpoint',
                                                    },
                                                },
                                            },
                                            {
                                                type: 'JSXAttribute',
                                                name: {
                                                    type: 'JSXIdentifier',
                                                    name: 'pageMetadata',
                                                },
                                                value: {
                                                    type: 'JSXExpressionContainer',
                                                    expression: {
                                                        type: 'Identifier',
                                                        name: 'pageMetadata',
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                                params: [
                                    {
                                        type: 'Identifier',
                                        name: 'props',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        });
    };
};
