import { BaseExtension } from './base.ext';
import type { IEvent, IFilterExtensionOptions } from '../types';
import type { Tracker } from '../tracker';

export class FilterExtension extends BaseExtension<Event> {
	static CRAWLER_REG_EXP =
		/(?:bot|spider|crawler|facebookexternalhit|simplepie|yahooseeker|embedly|quora link preview|outbrain|vkshare|monit|Pingability|Monitoring|WinHttpRequest|Apache-HttpClient|getprismatic.com|python-requests|Twurly|yandex|browserproxy|Qwantify|Yahoo! Slurp|pinterest|Tumblr|WhatsApp|Google-Structured-Data-Testing-Tool|Google-InspectionTool|GPTBot|Applebot)/i;

	static DEFAULT_HOSTNAMES = ['127.0.0.1', 'localhost', '*.local'];

	static LOCAL_STORAGE_KEY = 'altcha_ignore';

	readonly #hostnames: (string | RegExp)[];

	readonly #ignore: boolean = false;

	constructor(
		tracker: Tracker,
		readonly options: IFilterExtensionOptions
	) {
		super(tracker);
		this.#ignore = localStorage.getItem(FilterExtension.LOCAL_STORAGE_KEY) === 'true';
		this.#hostnames = (options.hostnames || FilterExtension.DEFAULT_HOSTNAMES).map((hostname) => {
			if (hostname.includes('*')) {
				// convert wildcards to RegExp
				return new RegExp(hostname.replace(/\*/g, '[^.]+'));
			}
			return hostname;
		});
	}

	checkFn(event: IEvent) {
		if (this.options.checkFn) {
			return this.options.checkFn(event);
		}
	}

	destroy() {}

	isBot() {
		return FilterExtension.CRAWLER_REG_EXP.test(this.tracker.getUserAgent());
	}

	isPrivateHostname() {
		const currentHostname = this.tracker.getHostname();
		return this.#hostnames.some((hostname) => {
			if (hostname instanceof RegExp && hostname.test(currentHostname)) {
				return true;
			}
			return currentHostname === hostname;
		});
	}

	/**
	 * Checks, whether the event should be tracked or excluded.
	 *
	 * @returns {boolean}
	 */
	shouldTrackEvent(event: IEvent): boolean {
		if (this.#ignore) {
			this.tracker.log(`ignoring event: ${FilterExtension.LOCAL_STORAGE_KEY}`);
			return false;
		}
		const result = this.checkFn(event);
		if (result !== undefined) {
			return result;
		}
		if (this.isPrivateHostname()) {
			this.tracker.log(`ignoring event: private hostname`);
			return false;
		}
		if (this.options.allowBots !== true && this.isBot()) {
			this.tracker.log(`ignoring event: bot`);
			return false;
		}
		return true;
	}
}
