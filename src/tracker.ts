/**
 * Tracker class for managing event tracking and pageview data collection.
 * It provides support for tracking various user interactions such as clicks, keyboard actions,
 * mouse movements, page visibility, pushstate changes, and more through a set of extensions.
 */
import { BaseExtension } from './extensions/base.ext';
import { ClickExtension } from './extensions/click.ext';
import { CookieExtension } from './extensions/cookie.ext';
import { HashExtension } from './extensions/hash.ext';
import { KeyboardExtension } from './extensions/keyboard.ext';
import { MouseExtension } from './extensions/mouse.ext';
import { PushstateExtension } from './extensions/pushstate.ext';
import { VisibilityExtension } from './extensions/visibility.ext';
import type { IBaseExtensionOptions, IEvent, ITrackerOptions } from './types';

// Type definition for the name of any extension supported by the tracker
type TExtentionName = keyof typeof Tracker.EXTENSIONS;

export class Tracker {
	// Static property containing all available extensions
	static readonly EXTENSIONS = {
		click: ClickExtension,
		cookie: CookieExtension,
		hash: HashExtension,
		keyboard: KeyboardExtension,
		mouse: MouseExtension,
		pushstate: PushstateExtension,
		visibility: VisibilityExtension
	} as const;

	// Default API endpoint for sending events
	static readonly DEFAULT_API_URL: string = 'https://eu.altcha.org/api/v1/event';

	// Default set of enabled extensions when initializing the tracker
	static readonly DEFAULT_EXTENSIONS: TExtentionName[] = [
		'click',
		'keyboard',
		'mouse',
		'pushstate',
		'visibility'
	];

	// Default global name for the tracker instance
	static readonly DEAFAUL_GLOBAL_NAME: string = 'altchaTracker';

	// Bound method to handle the 'pagehide' event
	readonly #_onPageHide = this.onPageHide.bind(this);

	// Boolean flag indicating if the user is on a mobile device
	readonly isMobile: boolean = /Mobi|Android|iPhone|iPad|iPod|Opera Mini/i.test(
		navigator.userAgent || ''
	);

	// Array to store tracked events
	events: IEvent[] = [];

	// Object to store initialized extensions
	extensions = {} as Record<TExtentionName, BaseExtension<Event>>;

	// The global name registered for the tracker instance, or null if none is registered
	globalName: string | null = null;

	// Timestamp of the last page load
	lastPageLoadAt: number = performance.now();

	// Last recorded pageview URL
	lastPageview: string | null = null;

	// Boolean flag indicating if the visitor is returning
	returningVisitor: boolean | null = null;

	// Number of events tracked
	trackedEvents: number = 0;

	// Number of pageviews tracked
	trackedPageviews: number = 0;

	/**
	 * Getter for the API URL. Returns the user-provided API URL or the default one.
	 */
	get apiUrl() {
		return this.options.apiUrl || Tracker.DEFAULT_API_URL;
	}

	/**
	 * Getter to determine if "Do Not Track" (DNT) is enabled in the user's browser.
	 */
	get isDNTEnabled() {
		return (
			('doNotTrack' in navigator && navigator.doNotTrack === '1') ||
			('globalPrivacyControl' in navigator && navigator.globalPrivacyControl === true)
		);
	}

	/**
	 * Constructor to initialize the Tracker instance.
	 *
	 * @param options - Configuration options for the tracker, including project ID, API URL, and extension settings.
	 */
	constructor(readonly options: ITrackerOptions) {
		if (!options.projectId) {
			throw new Error('Parameter projectId required.');
		}
		this.#registerGlobalName();
		if (this.isDNTEnabled && this.options.respectDnt === true) {
			this.log('DoNotTrack enabled.');
		} else {
			this.loadExtensions();
			// Attach both pagehide and beforeunload listeners to handle inconsistencies across browsers.
			addEventListener('pagehide', this.#_onPageHide);
			addEventListener('beforeunload', this.#_onPageHide);
		}
	}

	/**
	 * Destroys the tracker instance, removing all listeners and extensions.
	 */
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

	/**
	 * Flushes all collected events by sending them to the API.
	 */
	flushEvents() {
		const events = this.events.splice(0);
		if (events.length) {
			this.sendBeacon(events);
		}
	}

	/**
	 * Builds the payload for sending events to the API.
	 *
	 * @param events - List of events to be sent.
	 * @returns The payload object containing events, project ID, timestamp, and unique ID.
	 */
	getBeaconPayload(events: IEvent[]) {
		return {
			events,
			projectId: this.options.projectId,
			time: Date.now(),
			uniqueId: this.options.uniqueId
		};
	}

	/**
	 * Determines the reason for the user's exit from the page.
	 *
	 * @param unload - Boolean indicating if the reason is triggered by a page unload.
	 * @returns The exit reason, if any, provided by the extensions.
	 */
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

	/**
	 * Retrieves an extension by name.
	 *
	 * @param name - The name of the extension to retrieve.
	 * @returns The extension instance.
	 */
	getExtension(name: TExtentionName) {
		return this.extensions[name];
	}

	/**
	 * Returns the current page's hostname.
	 */
	getHostname() {
		return location.hostname;
	}

	/**
	 * Returns the current page's origin.
	 */
	getOrigin() {
		return location.origin;
	}

	/**
	 * Returns the sanitized URL of the current page, excluding unwanted query parameters.
	 */
	getView() {
		return this.sanitizeUrl(location.href);
	}

	/**
	 * Constructs the options for a pageview event.
	 *
	 * @param unload - Boolean indicating if the pageview is triggered by a page unload.
	 * @returns An object containing pageview event details such as duration, referrer, and exit reason.
	 */
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

	/**
	 * Retrieves the document's referrer URL.
	 */
	getReferrer() {
		return document.referrer;
	}

	/**
	 * Checks if a particular extension is loaded.
	 *
	 * @param name - The name of the extension.
	 * @returns True if the extension is loaded, false otherwise.
	 */
	hasExtension(name: TExtentionName) {
		return !!this.getExtension(name);
	}

	/**
	 * Loads all active extensions based on the tracker options and default settings.
	 */
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

	/**
	 * Logs a message to the console if debug mode is enabled.
	 *
	 * @param args - The message or data to log.
	 */
	log(...args: any[]) {
		if (this.options.debug) {
			console.log('[ALTCHA Tracker]', ...args);
		}
	}

	/**
	 * Removes query parameters and fragments from the URL based on the tracker settings.
	 *
	 * @param href - The full URL to be sanitized.
	 * @returns The sanitized URL.
	 */
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

	/**
	 * Sends the collected events to the server using the Beacon API.
	 *
	 * @param events - The list of events to send.
	 */
	sendBeacon(events: IEvent[]) {
		if ('sendBeacon' in navigator) {
			return navigator.sendBeacon(this.apiUrl, JSON.stringify(this.getBeaconPayload(events)));
		}
	}

	/**
	 * Tracks a custom event with optional parameters.
	 *
	 * @param {Partial<IEvent>} options - Optional event details to customize the tracked event. Any properties in the IEvent interface can be passed here. Defaults to an empty object.
	 * @param {boolean} [unload=false] - If set to true, the event is tracked during the page unload (exit). This ensures that the event is reported before the user leaves the page.
	 *
	 * @returns {boolean} - Returns true when the event has been successfully tracked.
	 *
	 * @remarks
	 * The method merges the provided options with the current timestamp to form the event. It pushes the event to the internal event queue and logs the event. If the `unload` flag is true, the events are flushed right away to ensure they are captured before the user navigates away or closes the page.
	 */
	trackEvent(options: Partial<IEvent> = {}, unload: boolean = false): boolean {
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

	/**
	 * Tracks a pageview event and handles duplicate pageviews and page load timing.
	 *
	 * @param {Partial<IEvent>} options - Additional pageview details. Any properties in the IEvent interface can be passed here. Defaults to an empty object.
	 * @param {boolean} [unload=false] - If true, the pageview event is tracked during the page unload (exit), ensuring it is reported before the user leaves the page.
	 *
	 * @returns {boolean} - Returns true if the pageview was successfully tracked. Returns false if the pageview is detected as a duplicate.
	 *
	 * @remarks
	 * The method generates pageview-specific options (like view duration) and checks if the pageview is a duplicate (i.e., a pageview of the same page within a very short time frame). If the pageview is not a duplicate, it logs and tracks the event. The `unload` flag ensures that the pageview is reported before the user exits the page or navigates away, by flushing the events queue if necessary. Additionally, the method tracks pageview counts, adjusts state based on whether the user exited the page, and updates the timestamp of the last pageview.
	 */
	trackPageview(options: Partial<IEvent> = {}, unload: boolean = false): boolean {
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

	/**
	 * Handles the pagehide event, typically used to send any unsent events before the user leaves the page.
	 */
	onPageHide() {
		if (this.lastPageview !== this.getView()) {
			// Track only if the path is different from the previously recorder one.
			// This is a workaround for Safari's Back button from external link which fires pagehide on load
			this.trackPageview({}, true);
		}
	}

	/**
	 * Registers the global name for the tracker instance.
	 *
	 * @returns True if the global name was registered, false otherwise.
	 */
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
