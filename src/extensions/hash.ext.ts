import { BaseExtension } from './base.ext';
import type { IBaseExtensionOptions } from '../types';
import type { Tracker } from '../tracker';

export class HashExtension extends BaseExtension<Event> {
	readonly #_onHashChange = this.onHashChange.bind(this);

	constructor(tracker: Tracker, _options: IBaseExtensionOptions) {
		super(tracker);
		addEventListener('hashchange', this.#_onHashChange);
	}

	destroy() {
		removeEventListener('hashchange', this.#_onHashChange);
	}

	onHashChange() {
		this.tracker.trackPageview();
	}
}
