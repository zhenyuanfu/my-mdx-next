export const insertSchema = ({ location, name, node, schema, deepestSchema, parentSchema, nodeToSchema, endpoint, requestContentType, }) => {
    if (parentSchema === undefined) {
        switch (location) {
            case 'body':
                const bodyObjectSchema = endpoint.request.body[requestContentType]?.schemaArray[0];
                if (bodyObjectSchema) {
                    bodyObjectSchema.properties[name] = [schema];
                }
                else {
                    endpoint.request.body[requestContentType] = {
                        schemaArray: [
                            {
                                type: 'object',
                                properties: {
                                    [name]: [schema],
                                },
                            },
                        ],
                        examples: {},
                    };
                }
                break;
            case 'response':
                const responseObjectSchema = endpoint.response['200']?.['application/json']
                    ?.schemaArray[0];
                if (responseObjectSchema) {
                    responseObjectSchema.properties[name] = [schema];
                }
                else {
                    endpoint.response['200'] = {
                        'application/json': {
                            schemaArray: [
                                {
                                    type: 'object',
                                    properties: {
                                        [name]: [schema],
                                    },
                                },
                            ],
                            examples: {},
                        },
                    };
                }
                break;
            case 'auth':
                if (!endpoint.request.security[0]) {
                    endpoint.request.security = [
                        {
                            title: 'Security',
                            parameters: {
                                cookie: {},
                                header: { [name]: { type: 'apiKey' } },
                                query: {},
                            },
                        },
                    ];
                }
                else {
                    endpoint.request.security[0].parameters.header[name] = { type: 'apiKey' };
                }
                break;
            case 'cookie':
            case 'header':
            case 'path':
            case 'query':
                endpoint.request.parameters[location][name] = { schema: [schema] };
                break;
        }
    }
    else {
        if (location === 'auth') {
            console.error('complex types are not allowed in the auth section');
            return false;
        }
        if (parentSchema.type !== 'object') {
            console.error(`cannot add property "${name}" to non-object`);
            return false;
        }
        parentSchema.properties[name] = [schema];
    }
    nodeToSchema.set(node, deepestSchema);
    return true;
};
