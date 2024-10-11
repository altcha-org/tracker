import { BaseExtension } from './extensions/base.ext';
import { ClickExtension } from './extensions/click.ext';
import { CookieExtension } from './extensions/cookie.ext';
import { HashExtension } from './extensions/hash.ext';
import { KeyboardExtension } from './extensions/keyboard.ext';
import { MouseExtension } from './extensions/mouse.ext';
import { PushstateExtension } from './extensions/pushstate.ext';
import { VisibilityExtension } from './extensions/visibility.ext';
import type { IBaseExtensionOptions, IEvent, ITrackerOptions } from './types';

type TExtentionName = keyof typeof Tracker.EXTENSIONS;

export class Tracker {
	static readonly EXTENSIONS = {
		click: ClickExtension,
		cookie: CookieExtension,
		hash: HashExtension,
		keyboard: KeyboardExtension,
		mouse: MouseExtension,
		pushstate: PushstateExtension,
		visibility: VisibilityExtension,
	} as const;

	static readonly DEFAULT_API_URL: string = 'https://eu.altcha.org/api/v1/event';

	static readonly DEFAULT_EXTENSIONS: TExtentionName[] = [
		'click',
		'keyboard',
		'mouse',
		'pushstate',
		'visibility',
	];

	static readonly DEAFAUL_GLOBAL_NAME: string = 'altchaTracker';

	readonly #_onPageHide = this.onPageHide.bind(this);

	readonly isMobile: boolean = /Mobi|Android|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent || '');

	events: IEvent[] = [];

	extensions = {} as Record<TExtentionName, BaseExtension<Event>>;

	globalName: string | null = null;

	lastPageLoadAt: number = performance.now();

	lastPageview: string | null = null;

	returningVisitor: boolean | null = null;

	trackedEvents: number = 0;

	trackedPageviews: number = 0;

	get apiUrl() {
		return this.options.apiUrl || Tracker.DEFAULT_API_URL;
	}

	get isDNTEnabled() {
		return (
			('doNotTrack' in navigator && navigator.doNotTrack === '1') ||
			('globalPrivacyControl' in navigator && navigator.globalPrivacyControl === true)
		);
	}

	constructor(readonly options: ITrackerOptions) {
		if (!options.projectId) {
			throw new Error('Parameter projectId required.');
		}
		this.#registerGlobalName();
		if (this.isDNTEnabled && this.options.respectDNT === true) {
			this.log('DoNotTrack enabled.');
		} else {
			this.loadExtensions();
			// attach both pagehide and beforeunload listeners to handle inconsitent behaviour across browsers
			// safari does not fire beforeunload after clicking on an external link
			// brave does not fire pagehide after clicking on an external link
			addEventListener('pagehide', this.#_onPageHide);
			addEventListener('beforeunload', this.#_onPageHide);
		}
	}

	destroy() {
		this.flushEvents();
		for (const ext in this.extensions) {
			this.extensions[ext as TExtentionName].destroy();
		}
		this.extensions = {} as Record<TExtentionName, BaseExtension<Event>>;
		removeEventListener('pagehide', this.#_onPageHide);
		removeEventListener('beforeunload', this.#_onPageHide);
		if (this.globalName) {
			// @ts-expect-error
			delete globalThis[this.globalName];
		}
	}

	flushEvents() {
		const events = this.events.splice(0);
		if (events.length) {
			this.sendBeacon(events);
		}
	}

	getBeaconPayload(events: IEvent[]) {
		return {
			events,
			projectId: this.options.projectId,
			time: Date.now(),
			uniqueId: this.options.uniqueId
		};
	}

	getExitReason(unload: boolean = false) {
		for (const ext in this.extensions) {
			const result = this.extensions[ext as TExtentionName].getExitReason(unload);
			if (result !== undefined) {
				this.log('exit reason:', { ext, result });
				return result;
			}
		}
		return undefined;
	}

	getExtension(name: TExtentionName) {
		return this.extensions[name];
	}

	getHostname() {
		return location.hostname;
	}

	getOrigin() {
		return location.origin;
	}

	getView() {
		return this.sanitizeUrl(location.href);
	}

	getPageviewOptions(unload: boolean = false) {
		const exitReason = this.getExitReason(unload);
		const referrer = this.getReferrer();
		const origin = this.getOrigin();
		return {
			appVersion: this.options.appVersion,
			exit: exitReason !== undefined,
			outbound: exitReason,
			duration: Math.max(0, Math.floor(performance.now() - this.lastPageLoadAt)),
			referrer: referrer && new URL(referrer, origin).origin === origin ? '' : referrer,
			returning: this.returningVisitor === null ? undefined : this.returningVisitor,
			view: this.getView()
		};
	}

	getReferrer() {
		return document.referrer;
	}

	hasExtension(name: TExtentionName) {
		return !!this.getExtension(name);
	}

	loadExtensions() {
		for (const ext in Tracker.EXTENSIONS) {
			let extOptions: IBaseExtensionOptions | boolean =
				this.options?.[ext as TExtentionName] !== undefined
					? this.options[ext as TExtentionName]!
					: ({} as IBaseExtensionOptions);
			if (typeof extOptions === 'boolean') {
				extOptions = {
					disable: !extOptions
				};
			} else {
				extOptions.disable =
					extOptions.disable === undefined
						? !Tracker.DEFAULT_EXTENSIONS.includes(ext as TExtentionName)
						: extOptions.disable;
			}
			if (extOptions.disable !== true) {
				this.extensions[ext as TExtentionName] = new Tracker.EXTENSIONS[ext as TExtentionName](
					this,
					extOptions
				);
			}
		}
	}

	log(...args: any[]) {
		if (this.options.debug) {
			console.log('[ALTCHA Tracker]', ...args);
		}
	}

	sanitizeUrl(url: string | URL) {
		url = new URL(url);
		if (this.options.allowSearchParams?.length && url.hostname === this.getHostname()) {
			// remove only non-whitelisted params (only for current hostname)
			for (const [param] of url.searchParams) {
				if (!this.options.allowSearchParams.includes(param)) {
					url.searchParams.delete(param);
				}
			}
		} else {
			// remove all search params
			url.search = '';
		}
		if (!this.hasExtension('hash')) {
			url.hash = '';
		}
		return url.toString();
	}

	sendBeacon(events: IEvent[]) {
		if ('sendBeacon' in navigator) {
			return navigator.sendBeacon(this.apiUrl, JSON.stringify(this.getBeaconPayload(events)));
		}
	}

	trackEvent(options: Partial<IEvent> = {}, unload: boolean = false) {
		const event = {
			timestamp: Date.now(),
			...options
		};
		this.events.push(event);
		this.trackedEvents += 1;
		this.log('trackEvent', event);
		if (unload) {
			this.flushEvents();
		}
		return true;
	}

	trackPageview(options: Partial<IEvent> = {}, unload: boolean = false) {
		const pageviewOptions = this.getPageviewOptions(unload);
		if (
			this.events.length &&
			pageviewOptions.duration < 100 &&
			this.events[this.events.length - 1].view === pageviewOptions.view
		) {
			this.log('duplicate pageview', pageviewOptions);
			return false;
		}
		this.log('trackPageview', pageviewOptions);
		this.trackEvent(
			{
				...pageviewOptions,
				...options
			},
			unload
		);
		this.trackedPageviews += 1;
		this.lastPageLoadAt = performance.now();
		this.lastPageview = pageviewOptions.view;
		if (pageviewOptions.exit) {
			// reset pageview counter to recognize the new enter event after back button
			this.trackedPageviews = 0;
		}
		return true;
	}

	onPageHide() {
		if (this.lastPageview !== this.getView()) {
			// track only if the path is different from the previously recorder one.
			// This is workaround for Safari's Back button from external link which fires pagehide on load
			this.trackPageview({}, true);
		}
	}

	#registerGlobalName() {
		this.globalName =
			this.options.globalName === undefined
				? Tracker.DEAFAUL_GLOBAL_NAME
				: this.options.globalName || null;
		if (this.globalName) {
			// @ts-expect-error
			if (globalThis[this.globalName]) {
				throw new Error(
					'Another instance of the Tracker is already present in globalThis. Set globalName:null to disable global reference.'
				);
			}
			// @ts-expect-error
			globalThis[this.globalName] = this;
		}
	}
}
