import { BaseExtension } from './base.ext';
import type { ICookieExtensionOptions } from '../types';
import type { Tracker } from '../tracker';

export class CookieExtension extends BaseExtension<Event> {
	readonly #cookieName: string;

	readonly #cookieExpireDays: number;

	readonly #cookiePath: string;

	constructor(tracker: Tracker, options: ICookieExtensionOptions) {
		super(tracker);
		this.#cookieName = options.cookieName || '_altcha_visited';
		this.#cookieExpireDays = options.cookieExpireDays || 30;
		this.#cookiePath = options.cookiePath || '/';
		const cookie = this.getCookie(this.#cookieName);
		if (cookie === '1') {
			this.tracker.returningVisitor = true;
		}
		this.setCookie(
			this.#cookieName,
			'1',
			new Date(Date.now() + 86_400_000 * this.#cookieExpireDays)
		);
	}

	destroy() {}

	getCookie(name: string) {
		const cookies = document.cookie.split(/;\s?/);
		for (const cookie of cookies) {
			if (cookie.startsWith(name + '=')) {
				return cookie.slice(name.length + 1);
			}
		}
		return null;
	}

	setCookie(name: string, value: string, expires: Date) {
		document.cookie =
			name +
			'=' +
			value +
			'; expires=' +
			expires.toUTCString() +
			`; SameSite=Strict; path=${this.#cookiePath || '/'}`;
	}
}
