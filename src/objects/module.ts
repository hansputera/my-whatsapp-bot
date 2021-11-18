import {readdirSync, existsSync, readFileSync} from 'node:fs';
import * as path from 'node:path';
import {ModuleInfo, CommandInfo} from '../types';
import {createLogger} from './logger';

/**
 * @class Modules
 */
export class Modules {
  public commands: Map<string, CommandInfo> = new Map();
  public mods: Map<string, ModuleInfo> = new Map();
  public logger = createLogger('modules');

  /**
     * @param {string} commandsPath
     */
  constructor(private commandsPath: string) {}

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
          this.commandsPath, modFolder)).filter((fl) => fl.endsWith('.js'))) {
        this.logger.info('Load ' + cmdFile + ' in ' + modFolder);
        const defaultCmd: CommandInfo = require(
            path.resolve(
                this.commandsPath, modFolder, cmdFile)).default;
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
}
