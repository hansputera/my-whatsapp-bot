import {Context} from '../extends/context';

export type CommandFunc = (ctx: Context) => Promise<void>;
export interface ModuleInfo {
    name: string;
    hide?: boolean;
    commands?: ModuleInfo[];
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
