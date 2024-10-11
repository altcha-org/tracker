import { Tracker } from './tracker';
import type { ITrackerOptions } from './types';

const currentScript = document.currentScript;
const region = currentScript?.getAttribute('src')?.match(/([^\.]+)\.altcha\.org/)?.[1];
const attrs = currentScript?.getAttributeNames() || [];
const options = attrs.reduce((acc, attr) => {
	if (attr.startsWith('data-')) {
		const name = attr.slice(5).replace(/\-([a-z])/g, (_, w: string) => {
			return w.toUpperCase();
		});
		let value: string | boolean | null | undefined = currentScript?.getAttribute(attr);
		if (value) {
			if (value === 'true') {
				value = true;
			} else if (value === 'false') {
				value = false;
			}
			acc[name] = value;
		}
	}
	return acc;
}, {} as Record<string, string | boolean>);

export const tracker = new Tracker({
	apiUrl: region ? `https://${region}.altcha.org/api/v1/event` : undefined,
	...options
} as ITrackerOptions);
