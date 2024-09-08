/* eslint-disable @typescript-eslint/class-methods-use-this */
import { success, type ResultContainer } from '@ehwillows/results/lib/ResultContainer.js';
import Protocol from '../Protocol.js';

export default class DefaultProtocol extends Protocol {
    constructor() {
        super({ name: 'default' });
    }

    async serialize(data: unknown): Promise<ResultContainer<string>> {
        return success(`${ data }`);
    }

    async deserialize(content: string): Promise<ResultContainer<string>> {
        return success(`${ content }`);
    }
}
