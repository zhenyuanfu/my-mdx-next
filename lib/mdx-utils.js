export const isMdxJsxFlowElement = (node) => {
    return node.type === 'mdxJsxFlowElement';
};
export const isMdxJsxAttribute = (attribute) => attribute.type === 'mdxJsxAttribute';
export const paramFieldLocations = ['body', 'query', 'auth', 'cookie', 'path', 'header'];
export const isParamFieldLocation = (str) => {
    return paramFieldLocations.includes(str);
};
