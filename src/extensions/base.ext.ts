import type { Tracker } from '../tracker';
import type { IBaseExtensionOptions } from '../types';

export class BaseExtension<TEvent extends Event> {
	protected lastEvent: TEvent | null = null;

	constructor(
		readonly tracker: Tracker,
		readonly options: IBaseExtensionOptions = { disable: false }
	) {}

	destroy() {}

	getExitReason(_unload: boolean = false): string | undefined {
		return undefined;
	}

	isLastEventRecent(threshold: number = 10000, ev = this.lastEvent) {
		return !!ev && performance.now() - ev.timeStamp < threshold;
	}
}
