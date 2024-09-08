
import { failure, success, type ResultContainer } from '@ehwillows/results/lib/ResultContainer.js';
import { z } from 'zod';
import Protocol from './Protocol.js';
import { readFile, writeFile } from 'fs/promises';
import { fromNativeError } from '@ehwillows/results/lib/error-factories.js';


export const serialize = Protocol.serialize;
export const deserialize = Protocol.deserialize;
export const translate = Protocol.translate;

export const saveFile = async (
    data: unknown,
    outputLocation: string,
    protocol: Protocol,
    validator: z.Schema = z.unknown(),
    mixin: object = {},
): Promise<ResultContainer> => {
    const contentResult = await serialize(data, protocol, validator, mixin);

    if (contentResult.success) {
        try {
            await writeFile(outputLocation, contentResult.data, 'utf-8');

            return success(null);
        } catch (error) {
            return failure(fromNativeError(error));
        }
    } else {
        return contentResult;
    }
};

export const loadFile = async<T = unknown>(
    inputLocation: string,
    protocol: Protocol,
    validator: z.Schema = z.unknown(),
    mixin: object = {},
): Promise<ResultContainer<T>> => {
    let content: string;

    try {
        content = await readFile(inputLocation, 'utf-8');
    } catch (error) {
        return failure(fromNativeError(error));
    }

    return deserialize(content, protocol, validator, mixin);
};

export const translateFile = async (
    inputLocation: string,
    inputProtocol: Protocol,
    outputLocation: string,
    outputProtocol: Protocol,
    validator: z.Schema = z.unknown(),
    mixin: object = {},
): Promise<ResultContainer> => {
    let inputContent: string;

    try {
        inputContent = await readFile(inputLocation, 'utf-8');
    } catch (error) {
        return failure(fromNativeError(error));
    }

    const outputContent = await translate(inputContent, inputProtocol, outputProtocol, validator, mixin);

    if (outputContent.success) {
        try {
            await writeFile(outputLocation, outputContent.data, 'utf-8');

            return success(null);
        } catch (error) {
            return failure(fromNativeError(error));
        }
    } else {
        return outputContent;
    }
};
