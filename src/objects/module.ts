import {readdirSync, existsSync, readFileSync} from 'node:fs';
import * as path from 'node:path';
import {ModuleInfo, CommandInfo, EventInfo} from '../types';
import {createLogger} from './logger';
import {Client} from './client';
import {BaileysEventMap} from 'hanif-baileys-md';

/**
 * @class Modules
 */
export class Modules {
  public commands: Map<string, CommandInfo> = new Map();
  public mods: Map<string, ModuleInfo> = new Map();
  public listens: (keyof BaileysEventMap)[] = [];

  public logger = createLogger('modules');

  /**
     * @param {string} commandsPath
     * @param {string} eventsPath
     */
  constructor(public client: Client, private commandsPath: string,
        private eventsPath: string) {}

  /**
     * Free the maps
     * @return {void}
     */
  free(): void {
    this.commands.clear();
    this.mods.clear();
  }

  /**
   * @return {void}
   */
  loads(): void {
    if (!existsSync(this.commandsPath)) {
      throw new TypeError(
          'Commands Path location could not be found');
    }
    this.free();
    for (const modFolder of
      readdirSync(this.commandsPath)) {
      if (!existsSync(path.resolve(
          this.commandsPath, modFolder, '__config.js'))) {
        throw new Error(modFolder +
            ' couldn\'t found the module configuration!');
      }
      this.logger.info('Loads module ' + modFolder);
      const modConfig: ModuleInfo = (eval(
          readFileSync(path.resolve(
              this.commandsPath, modFolder, '__config.js'), 'utf8')));
      modConfig.commands = [];
      for (const cmdFile of readdirSync(path.resolve(
          this.commandsPath, modFolder)).filter((fl) => fl.endsWith('.js') &&
            !fl.startsWith('__'))) {
        this.logger.info('Load ' + cmdFile + ' in ' + modFolder);
        const defaultCmd: CommandInfo = require(
            path.resolve(
                this.commandsPath, modFolder, cmdFile)).default;
        if (!defaultCmd.cooldown) {
          defaultCmd.cooldown = 5000;
        }
        defaultCmd.module = modConfig.name;
        modConfig.commands.push(defaultCmd);
        this.commands.set(defaultCmd.name, defaultCmd);
        this.logger.info(cmdFile +
                ' loaded correctly with name: ' +
                    defaultCmd.name);
      }
      this.mods.set(modConfig.name, modConfig);
      this.logger.info(modFolder + ' loaded correctly with ' +
        modConfig.commands.length + ' commands');
    }
  }

  /**
   * Load events
   *
   * @return {void}
   */
  loadEvents(): void {
    if (!existsSync(this.eventsPath)) {
      throw new TypeError('Are you sure enter correctly events path?');
    }
    for (const eventFile of readdirSync(this.eventsPath).filter(
        (fl) => fl.endsWith('.js'))) {
      this.logger.info('Load event file: ' + eventFile);
      const eventFl: EventInfo = require(
          path.resolve(this.eventsPath, eventFile),
      ).default;

      this.client.baileys.ev.removeListener(eventFl.name,
          () => this.logger.warn(eventFl.name + ' listener removed'));

      this.client.baileys.ev.on(
          eventFl.name, (arg) => eventFl.target(this.client, arg),
      );

      if (!this.listens.includes(eventFl.name)) {
        this.listens.push(eventFl.name);
      }
      this.logger.info(eventFl.name + ' listener loaded');
    }
  }
}
