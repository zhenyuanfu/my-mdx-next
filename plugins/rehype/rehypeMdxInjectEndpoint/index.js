import { generateExampleFromSchema } from '@mintlify/validation';
import { visitParents } from 'unist-util-visit-parents';
import { isMdxJsxFlowElement } from '../../../lib/mdx-utils.js';
import { addExport } from '../../../lib/remark-utils.js';
import { findParentSchema } from './findParentSchema.js';
import { insertSchema } from './insertSchema.js';
import { parseApiString, parseAuthMethod, parseField } from './parsers.js';
export const rehypeMdxInjectEndpoint = (metadata, config) => {
    return (tree) => {
        if (!(metadata &&
            typeof metadata === 'object' &&
            'api' in metadata &&
            typeof metadata.api === 'string')) {
            addExport(tree, 'endpoint', undefined);
            return;
        }
        let parseResult = undefined;
        try {
            parseResult = parseApiString(metadata.api, config);
        }
        catch {
            console.error(`error parsing api string: "${metadata.api}"`);
            addExport(tree, 'endpoint', undefined);
            return;
        }
        const { servers, path, method } = parseResult;
        const authMethodString = 'authMethod' in metadata && typeof metadata.authMethod === 'string'
            ? metadata.authMethod
            : undefined;
        const security = parseAuthMethod(authMethodString, config);
        const endpoint = {
            path,
            servers,
            method,
            request: {
                security,
                parameters: {
                    query: {},
                    header: {},
                    cookie: {},
                    path: {},
                },
                body: {},
            },
            response: {},
            deprecated: false,
        };
        const requestContentType = 'contentType' in metadata && typeof metadata.contentType === 'string'
            ? metadata.contentType
            : 'application/json';
        const nodeToSchema = new Map();
        visitParents(tree, isMdxJsxFlowElement, (node, parents) => {
            if (node.name === 'Param' || node.name === 'ParamField' || node.name === 'ResponseField') {
                const parentSchema = findParentSchema(node.name, parents, nodeToSchema);
                // we only want ParamFields/ResponseFields that are nested in others of the same type, or at the top level
                if (parentSchema === undefined && parents.length > 1) {
                    console.error(`${node.name} tags must occur at the top level or inside another ${node.name} tag`);
                    return 'skip';
                }
                const parsedParamField = parseField(node);
                if (parsedParamField === undefined) {
                    console.error('param field conversion failed');
                    return 'skip';
                }
                const insertSuccessful = insertSchema({
                    name: parsedParamField.name,
                    location: parsedParamField.location,
                    schema: parsedParamField.schema,
                    deepestSchema: parsedParamField.deepestSchema,
                    endpoint,
                    node,
                    parentSchema,
                    nodeToSchema,
                    requestContentType,
                });
                if (!insertSuccessful) {
                    return 'skip';
                }
            }
        });
        const content = endpoint.request.body[requestContentType];
        if (content) {
            content.examples['example'] = { value: generateExampleFromSchema(content.schemaArray[0]) };
        }
        const response = endpoint.response['200']?.['application/json'];
        if (response) {
            response.examples['example'] = { value: generateExampleFromSchema(response.schemaArray[0]) };
        }
        addExport(tree, 'endpoint', endpoint);
        return tree;
    };
};
