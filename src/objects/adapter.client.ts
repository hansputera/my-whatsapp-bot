import {Client} from './client';
import {Adapter} from '../types';

/**
 * @class AdapterClient
 */
export class AdapterClient extends Client {
  public adapters: Adapter[] = [];

  /**
     * Register adapter(s)
     *
     * @return {void}
     */
  register(...adapters: Adapter[]): void {
    for (const adapter of adapters) {
      if (!adapter.priority) {
        adapter.priority = 50;
      }
    }
    this.adapters = [...new Set(this.adapters.concat(
        adapters,
    ))];
  }

  /**
     * Remove adapter
     *
     * @return {void}
     */
  remove(...adapterNames: string[]): void {
    adapterNames.forEach((name) => {
      this.adapters = this.adapters
          .filter(
              (adapter) => adapter.name.toLowerCase() ===
                        adapter.name.toLowerCase());
    });
  }

  /**
     * Is adapter registered?
     *
     * @param {string} adapterName - Adapter name
     * @return {boolean}
     */
  has(adapterName: string): boolean {
    return !!this.adapters.find(
        (a) => a.name.toLowerCase() === adapterName.toLowerCase());
  }

  /**
     * Sort adapters by priority
     *
     * @return {Adapter[]}
     */
  countByPriority(): Adapter[] {
    return this.adapters.sort(
        (a, b) => b.priority as number - (a.priority as number),
    );
  }

  /**
     * Get adapter.
     * @param {string} name - Adapter event name
     * @return {Adapter | undefined}
     */
  get(name: Adapter['event']): Adapter | undefined {
    return this.adapters.find(
        (a) => a.event === name,
    );
  }

  /**
   * Get adapter names
   *
   * @return {string[]}
   */
  names(): Adapter['event'][] {
    return [...new Set(this.adapters
        .map((a) => a.event))];
  }
}
