import { BaseExtension } from './base.ext';
import type { IVivibilityExtensionOptions } from '../types';
import type { Tracker } from '../tracker';

export class VisibilityExtension extends BaseExtension<Event> {
	readonly #_onVisibilityChange = this.onVisibilityChange.bind(this);

  readonly #hiddenTimeout: number;

  #timeout: ReturnType<typeof setTimeout> | null = null;

	visibilityState: DocumentVisibilityState = document.visibilityState;

	constructor(tracker: Tracker, options: IVivibilityExtensionOptions) {
		super(tracker);
    this.#hiddenTimeout = options.hiddenTimeout || 4000;
		addEventListener('visibilitychange', this.#_onVisibilityChange);
	}

	destroy() {
		removeEventListener('visibilitychange', this.#_onVisibilityChange);
	}

	getExitReason(unload: boolean = false) {
		const minThreshold = 1000;
		if (
			unload &&
			this.visibilityState === 'hidden' &&
			this.lastEvent &&
			performance.now() - this.lastEvent.timeStamp >= minThreshold
		) {
			// if hidden for a while, unload event indicates closing the tab
			// note: visibilitychange can also fire during navigation => ignore very recent events
			return '';
		}
		return undefined;
	}

  onTimeout() {
    if (document.visibilityState === 'hidden') {
      // track pageview as exit when hidden on timeout
      this.tracker.trackPageview({}, true);
    }
  }

	onVisibilityChange(ev: Event) {
		this.lastEvent = ev;
		this.visibilityState = document.visibilityState;
    if (this.tracker.isMobile) {
      // set timeout only on mobile devices
      if (this.#timeout) {
        clearTimeout(this.#timeout);
      } 
      if (document.visibilityState === 'hidden') {
        this.#timeout = setTimeout(() => {
          this.onTimeout();
        }, this.#hiddenTimeout);
      }
    }
	}
}
