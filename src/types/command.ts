import {Context} from '../extends/context';
import type {BaileysEventMap} from '@slonbook/baileys-md';
import {Client} from '../objects';

export type CommandFunc = (ctx: Context) => Promise<void>;
export interface ModuleInfo {
    name: string;
    hide?: boolean;
    commands?: CommandInfo[];
}
export interface CommandInfo {
    name: string;
    desc: string;
    alias?: string[];
    cooldown?: number;
    devOnly?: boolean;
    groupOnly?: boolean;
    dmOnly?: boolean;
    target: CommandFunc;
    module?: string;
}

export interface CollectorOptions {
    max: number;
    time?: number;
    validation: (ctx: Context) => boolean;
}

export interface EventInfo {
    name: keyof BaileysEventMap;
    target:
        (client: Client, args: any)
            => Promise<void> | void;
}
