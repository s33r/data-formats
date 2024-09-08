import { fromZodIssue } from '@ehwillows/results/lib/error-factories.js';
import { failure, success, type ResultContainer } from '@ehwillows/results/lib/ResultContainer.js';
import { z } from 'zod';

export type ProtocolBag = z.infer<typeof Protocol.schema>;

export default abstract class Protocol {
    static get schema() {
        return z.object({
            name           : z.string(),
            extension      : z.string().optional(),
            otherExtensions: z.array(z.string()).optional(),
        });
    }

    static mixin(
        data: unknown,
        mixin: object = {},
    ): unknown {
        if (typeof data === 'object' && !Array.isArray(data)) {
            return {
                ...data,
                ...mixin,
            };
        } else {
            return data;
        }
    }

    static async serialize(
        data: unknown,
        protocol: Protocol,
        validator: z.Schema = z.unknown(),
        mixin: object = {},
    ): Promise<ResultContainer<string>> {
        const mixedData = this.mixin(data, mixin);

        const validationResult = validator.safeParse(mixedData);

        if (validationResult.success) {
            return protocol.serialize(mixedData);
        } else {
            return failure(validationResult.error.issues.map(e => fromZodIssue(e)));
        }
    }

    static async deserialize<T = unknown>(
        content: string,
        protocol: Protocol,
        validator: z.Schema = z.unknown(),
        mixin: object = {},
    ): Promise<ResultContainer<T>> {
        const deserializedResult = await protocol.deserialize(content);

        if (deserializedResult.success) {
            const mixedData = this.mixin(deserializedResult.data, mixin);

            const validationResult = validator.safeParse(mixedData);

            if (validationResult.success) {
                return success(validationResult.data);
            } else {
                return failure(validationResult.error.issues.map(e => fromZodIssue(e)));
            }
        } else {
            return deserializedResult;
        }
    }

    static async translate(
        content: string,
        inputProtocol: Protocol,
        outputProtocol: Protocol,
        validator: z.Schema = z.unknown(),
        mixin: object = {},
    ): Promise<ResultContainer<string>> {
        const deserializedResult = await inputProtocol.deserialize(content);

        if (deserializedResult.success) {
            const mixedData = this.mixin(deserializedResult.data, mixin);
            const validationResult = validator.safeParse(mixedData);

            if (validationResult.success) {
                return outputProtocol.serialize(validationResult.data);
            } else {
                return failure(validationResult.error.issues.map(e => fromZodIssue(e)));
            }
        } else {
            return deserializedResult;
        }
    }

    readonly #name           : string;
    readonly #extension      : string;
    readonly #extensions     : ReadonlyArray<string>;
    readonly #otherExtensions: ReadonlyArray<string>;

    constructor(data: ProtocolBag) {
        this.#name = data.name.trim().toLowerCase();
        this.#otherExtensions = Object.freeze(Array.from(data.otherExtensions ?? []));

        if (data.extension) {
            this.#extension = data.extension;
            this.#extensions =  Object.freeze(Array.from([this.extension, ...this.otherExtensions]));
        } else {
            this.#extension = '';
            this.#extensions = Object.freeze(Array.from(this.otherExtensions));
        }
    }

    get name() { return this.#name; }
    get extension() { return this.#extension; }
    get extensions() { return this.#extensions; }
    get otherExtensions() { return this.#otherExtensions; }

    abstract serialize(data: unknown): Promise<ResultContainer<string>>;
    abstract deserialize(content: string): Promise<ResultContainer<unknown>>;
}
