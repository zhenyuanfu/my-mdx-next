import { getSecurityOptionsForAuthMethod } from '@mintlify/common';
import isAbsoluteUrl from 'is-absolute-url';
import { isMdxJsxAttribute, isParamFieldLocation } from '../../../lib/mdx-utils';
export const parseApiString = (apiString, config) => {
    const components = apiString.trim().split(/\s+/);
    if (!components[0] || !components[1] || components.length > 2) {
        throw new Error('improperly formatted api string');
    }
    const [upperMethod, endpointStr] = components;
    const method = upperMethod.toLowerCase();
    if (!['get', 'put', 'post', 'delete', 'patch', 'options', 'head', 'trace'].includes(method)) {
        throw new Error('invalid http method');
    }
    const { origin, path } = parseEndpoint(endpointStr);
    const servers = origin ? [{ url: origin }] : parseServers(config);
    return {
        path,
        method: method,
        servers,
    };
};
const parseEndpoint = (endpoint) => {
    if (!isAbsoluteUrl(endpoint)) {
        return {
            origin: undefined,
            path: endpoint,
        };
    }
    const url = new URL(endpoint);
    return {
        origin: decodeURI(url.origin),
        path: decodeURI(url.pathname),
    };
};
const parseServers = (config) => {
    const baseUrl = config?.api?.baseUrl;
    if (!baseUrl) {
        return undefined;
    }
    if (typeof baseUrl === 'string') {
        return [{ url: baseUrl }];
    }
    const servers = baseUrl.filter(Boolean).map((url) => ({ url }));
    return servers.length > 0 ? servers : undefined;
};
export const parseAuthMethod = (authMethodString, config) => {
    const method = authMethodString ?? config?.api?.auth?.method;
    const name = config?.api?.auth?.name;
    return getSecurityOptionsForAuthMethod(method, name);
};
export const parseField = (node) => {
    let locationAndName;
    let schemaInfo;
    let required = undefined;
    for (const { name: attrName, value } of node.attributes.filter(isMdxJsxAttribute)) {
        if (node.name !== 'ResponseField' && isParamFieldLocation(attrName)) {
            // if ParamField or Param, parameter name comes from the `body`, `header`, etc attribute
            if (locationAndName) {
                console.error('multiple location/name pairs specified');
                return;
            }
            if (typeof value !== 'string') {
                console.error(`invalid parameter name: "${value}"`);
                return;
            }
            locationAndName = {
                location: attrName,
                name: value,
            };
        }
        else if (node.name === 'ResponseField' && attrName === 'name') {
            // if ResponseField, parameter name comes from the `name` attribute
            if (locationAndName) {
                console.error('multiple names specified');
                return;
            }
            if (typeof value !== 'string') {
                console.error(`invalid response field name: "${value}"`);
                return;
            }
            locationAndName = {
                location: 'response',
                name: value,
            };
        }
        else if (attrName === 'type') {
            if (typeof value !== 'string') {
                console.error(`invalid type string: "${value}"`);
                return;
            }
            schemaInfo = parseTypeString(value);
        }
        else if (attrName === 'required') {
            if (value === null || (typeof value === 'object' && value.value.trim() === 'true')) {
                required = true;
            }
        }
    }
    if (locationAndName === undefined) {
        console.error('no parameter name specified');
        return;
    }
    if (schemaInfo === undefined) {
        console.error(`no type specified for parameter "${locationAndName.name}"`);
        return;
    }
    schemaInfo.schema.description = parseDescription(node);
    schemaInfo.schema.required = required;
    return {
        ...locationAndName,
        ...schemaInfo,
    };
};
export const parseDescription = (node) => {
    const descriptionFragments = node.children.flatMap((child) => {
        if (child.type === 'text') {
            return [child.value];
        }
        else if (child.type === 'element' &&
            child.tagName === 'p' &&
            child.children[0]?.type === 'text') {
            return [child.children[0].value];
        }
        return [];
    });
    return descriptionFragments.length > 0 ? descriptionFragments.join('\n') : undefined;
};
const typeStringToSchemaType = {
    // string
    str: 'string',
    string: 'string',
    date: 'string',
    text: 'string',
    url: 'string',
    uuid: 'string',
    hash: 'string',
    bytes: 'string',
    // integer
    int: 'integer',
    integer: 'integer',
    // number
    num: 'number',
    number: 'number',
    float: 'number',
    decimal: 'number',
    long: 'number',
    double: 'number',
    // boolean
    bool: 'boolean',
    boolean: 'boolean',
    // object
    obj: 'object',
    object: 'object',
    record: 'object',
    dict: 'object',
    dictionary: 'object',
    map: 'object',
    // array
    arr: 'array',
    array: 'array',
    list: 'array',
    // file
    file: 'file',
    // any
    any: 'any',
    json: 'any',
    // null
    null: 'null',
};
const genericStringRegex = /^(\w+)<(.*)>$/;
export const parseTypeString = (typeString) => {
    const lowerTypeString = typeString.toLowerCase();
    const simpleSchemaType = typeStringToSchemaType[lowerTypeString];
    // catch all standard type strings
    if (simpleSchemaType) {
        return generateSchemaWithTypeString(simpleSchemaType);
    }
    // catch type strings that end with []
    if (lowerTypeString.endsWith('[]')) {
        // recursively determine the type of the rest of the string
        const subschemaInfo = parseTypeString(lowerTypeString.slice(0, lowerTypeString.length - 2));
        return {
            schema: {
                type: 'array',
                items: [subschemaInfo.schema],
            },
            deepestSchema: subschemaInfo.deepestSchema,
        };
    }
    // catch type strings like foo<bar>
    const regexMatch = genericStringRegex.exec(lowerTypeString);
    if (regexMatch !== null) {
        // unpack capture group 1 (foo) and 2 (bar)
        const [_, superType, subType] = regexMatch;
        if (superType && subType && typeStringToSchemaType[superType] === 'array') {
            // catches type strings like array<bar>
            // recursively determine the type of everything within the angle brackets
            const subschemaInfo = parseTypeString(subType);
            return {
                schema: {
                    type: 'array',
                    items: [subschemaInfo.schema],
                },
                deepestSchema: subschemaInfo.deepestSchema,
            };
        }
    }
    // for any unrecognized typestring, default to object
    return generateSchemaWithTypeString('object');
};
const generateSchemaWithTypeString = (type) => {
    switch (type) {
        case 'string':
        case 'number':
        case 'integer':
        case 'boolean':
        case 'file':
        case 'null':
        case 'any': {
            const schema = { type };
            return {
                schema,
                deepestSchema: schema,
            };
        }
        case 'object': {
            const schema = {
                type: 'object',
                properties: {},
            };
            return {
                schema,
                deepestSchema: schema,
            };
        }
        case 'array': {
            const itemsSchema = {
                type: 'object',
                properties: {},
            };
            const schema = {
                type: 'array',
                items: [itemsSchema],
            };
            return {
                schema,
                deepestSchema: itemsSchema,
            };
        }
    }
};
