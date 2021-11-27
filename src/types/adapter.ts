import {BaileysEventMap} from '@slonbook/baileys-md';

export interface AdapterEvent {
    /** Adapter name */
    name: string;
    /** Adapter event */
    event: keyof BaileysEventMap;
    /**
     * Adapter executor
     */
    executor:
        (arg: BaileysEventMap[AdapterEvent['event']]) => Promise<void> | void;
}

export type Adapter = AdapterEvent & {
    priority?: number;
};
