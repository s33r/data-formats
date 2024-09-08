import type Protocol from './Protocol.js';

export default class ProtocolFactory {
    readonly #protocols = new Map<string, Protocol>();


    getProtocol(name: string) {
        const result = this.#protocols.get(name.trim().toLowerCase());

        if (result) {
            return result;
        } else {
            throw new Error(`The protocol ${ name } does not exist within this ProtocolFactory.`);
        }
    }

    addProtocol(protocol: Protocol) {
        if (this.#protocols.has(protocol.name)) {
            throw new Error(`The protocol ${ protocol.name } already exists within this ProtocolFactory.`);
        } else {
            this.#protocols.set(protocol.name, protocol);
        }

        return this;
    }

    removeProtocol(protocol: string | Protocol) {
        const name = (typeof protocol === 'string' ? protocol : protocol.name).trim().toLowerCase();

        this.#protocols.delete(name);

        return this;
    }

    swapProtocol(protocol: Protocol) {
        this.#protocols.set(protocol.name, protocol);

        return this;
    }
}
