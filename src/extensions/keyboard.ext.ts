import { BaseExtension } from './base.ext';
import type { IBaseExtensionOptions } from '../types';
import type { Tracker } from '../tracker';

export class KeyboardExtension extends BaseExtension<KeyboardEvent> {
	readonly #_onKeyDown = this.onKeyDown.bind(this);

	constructor(tracker: Tracker, _options: IBaseExtensionOptions) {
		super(tracker);
		addEventListener('keydown', this.#_onKeyDown);
	}

	destroy() {
		removeEventListener('keydown', this.#_onKeyDown);
	}

	isLastKeyboardEventCtrl() {
		return (
			!!this.lastEvent &&
			(this.lastEvent.ctrlKey || this.lastEvent.metaKey)
		);
	}

	getExitReason(unload: boolean = false) {
		if (unload && this.isLastEventRecent(100) && this.isLastKeyboardEventCtrl()) {
			// return empty string to indicate "exit" reason
			return '';
		}
		return undefined;
	}

	onKeyDown(ev: KeyboardEvent) {
		this.lastEvent = ev;
	}
}
