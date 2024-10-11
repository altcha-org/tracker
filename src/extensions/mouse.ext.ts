import { BaseExtension } from './base.ext';
import { PushstateExtension } from './pushstate.ext';
import type { IBaseExtensionOptions } from '../types';
import type { Tracker } from '../tracker';

export class MouseExtension extends BaseExtension<MouseEvent> {
	readonly #_onMouseEnter = this.onMouseEnter.bind(this);

	readonly #_onMouseLeave = this.onMouseLeave.bind(this);

	isMouseOut: boolean = false;

	offsetX: number = -1;

	offsetY: number = -1;

	constructor(tracker: Tracker, _options: IBaseExtensionOptions) {
		super(tracker);
		document.body.addEventListener('mouseleave', this.#_onMouseLeave);
		document.body.addEventListener('mouseenter', this.#_onMouseEnter);
	}

	destroy(): void {
		document.body.removeEventListener('mouseleave', this.#_onMouseLeave);
		document.body.removeEventListener('mouseenter', this.#_onMouseEnter);
	}

	getExitReason() {
		if (this.isMouseOut) {
			const pushStateExt = this.tracker.getExtension('pushstate') as PushstateExtension | undefined;
			if (
				pushStateExt &&
				pushStateExt.lastPopStateEvent &&
				pushStateExt.isLastEventRecent(100, pushStateExt.lastPopStateEvent)
			) {
				// popstate event has been called, most likely a back button navigation
				return undefined;
			}
			if (this.offsetX >= 0 && this.offsetX >= 0 && this.offsetX < 150) {
				// top left corner of the screen, most likely navigation buttons such as a back button
				return undefined;
			}
			return '';
		}
		return undefined;
	}

	onMouseEnter() {
		this.isMouseOut = false;
		this.offsetX = -1;
		this.offsetY = -1;
	}

	onMouseLeave(ev: MouseEvent) {
		this.isMouseOut = true;
		this.offsetX = ev.clientX;
		this.offsetY = ev.clientY;
	}
}
