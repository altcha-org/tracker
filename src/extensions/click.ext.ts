import { BaseExtension } from './base.ext';
import type { IBaseExtensionOptions } from '../types';
import type { Tracker } from '../tracker';

export class ClickExtension extends BaseExtension<MouseEvent> {
	readonly #_onClick = this.onClick.bind(this);

	constructor(tracker: Tracker, _options: IBaseExtensionOptions) {
		super(tracker);
		addEventListener('click', this.#_onClick, {
			capture: true,
		});
	}

	destroy(): void {
		removeEventListener('click', this.#_onClick);
	}

	getExitReason() {
		if (this.lastEvent && this.isLastEventRecent()) {
			const target = this.lastEvent.target as HTMLElement | null;
			const href = target?.getAttribute('data-link') || target?.getAttribute('href');
			if (href) {
				const url = new URL(href, location.origin);
				if (url.hostname && url.hostname !== location.hostname) {
					return this.tracker.sanitizeUrl(url);
				}
			}
		}
		return undefined;
	}

	onClick(ev: MouseEvent) {
		const target = ev.target as HTMLElement | null;
		if (target && target.tagName === 'A') {
			this.lastEvent = ev;
		}
	}
}
