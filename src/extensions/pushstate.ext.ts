import { BaseExtension } from './base.ext';
import type { IBaseExtensionOptions } from '../types';
import type { Tracker } from '../tracker';

export class PushstateExtension extends BaseExtension<Event> {
	#originalPushState: typeof history.pushState | null = null;

	readonly #_onPopState = this.onPopState.bind(this);

	readonly #_onPushState = this.onPushState.bind(this);

	lastPopStateEvent: PopStateEvent | null = null;

	constructor(tracker: Tracker, _options: IBaseExtensionOptions) {
		super(tracker);
		const originalPushState = (this.#originalPushState = history.pushState);
		history.pushState = (data, title, url) => {
			this.#_onPushState();
			originalPushState?.apply(history, [data, title, url]);
		};
		addEventListener('popstate', this.#_onPopState);
	}

	destroy() {
		if (this.#originalPushState) {
			history.pushState = this.#originalPushState;
		}
		removeEventListener('popstate', this.#_onPopState);
	}
	
	onPopState(ev: PopStateEvent) {
		this.lastPopStateEvent = ev;
		this.tracker.trackPageview();
	}

	onPushState() {
		this.tracker.trackPageview();
	}
}
