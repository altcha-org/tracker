/**
 * Base interface for extension options, allowing for disabling the extension.
 */
export interface IBaseExtensionOptions {
  /** 
   * Flag to disable the extension (default: false). 
   */
  disable?: boolean;
}

/**
 * Options specific to the Cookie Extension.
 */
export interface ICookieExtensionOptions extends IBaseExtensionOptions {
  /** 
   * Number of days before the cookie expires (default: 30 days). 
   */
  cookieExpireDays?: number;
  /** 
   * The name of the cookie (default: '_altcha_visited'). 
   */
  cookieName?: string;
  /** 
   * The path where the cookie is available (default: '/'). 
   */
  cookiePath?: string;
}

/**
 * Options specific to the Visibility Extension.
 */
export interface IVivibilityExtensionOptions extends IBaseExtensionOptions {
  /** 
   * Timeout (in milliseconds) after which the hidden state is reported as an exit event (default: 4000ms). 
   */
  hiddenTimeout?: number;
}

/**
 * Event data structure for custom event tracking.
 */
export interface IEvent {
  /** 
   * The name of the custom event being tracked.
   */
  customEvent?: string;
  /** 
   * Duration of the event in milliseconds.
   */
  duration?: number;
  /** 
   * Flag indicating if this is an exit event (user exiting the app).
   */
  exit?: boolean;
  /** 
   * Custom properties as a key-value map to add additional context.
   */
  props?: Record<string, string>;
  /** 
   * Flag indicating if the user is a returning visitor.
   */
  returning?: boolean;
  /** 
   * The timestamp when the event is reported, in milliseconds. The origin time of the event is `timestamp - duration`.
   */
  timestamp: number;
  /** 
   * Name of the view or the URL of the current page.
   */
  view?: string;
}

/**
 * Configuration options for initializing the tracker.
 */
export interface ITrackerOptions {
  /** 
   * List of URL query parameters that should be tracked. By default, all query parameters are removed.
   */
  allowSearchParams?: string[];
  /** 
   * Custom API URL to override the default analytics endpoint.
   */
  apiUrl?: string;
  /** 
   * The current version of the app (e.g., 'v1.0.0').
   */
  appVersion?: string;
  /** 
   * Click tracking extension configuration (or set to boolean to enable/disable).
   */
  click?: IBaseExtensionOptions | boolean;
  /** 
   * Cookie tracking extension configuration (or set to boolean to enable/disable).
   */
  cookie?: ICookieExtensionOptions | boolean;
  /** 
   * Enable or disable debug mode (default: false).
   */
  debug?: boolean;
  /** 
   * Global variable name for the tracker instance in the browser (set to false or null to disable global name).
   */
  globalName?: string | null | false;
  /** 
   * Hash tracking extension configuration (or set to boolean to enable/disable).
   */
  hash?: IBaseExtensionOptions | boolean;
  /** 
   * Keyboard event tracking configuration (or set to boolean to enable/disable).
   */
  keyboard?: IBaseExtensionOptions | boolean;
  /** 
   * Mouse event tracking configuration (or set to boolean to enable/disable).
   */
  mouse?: IBaseExtensionOptions | boolean;
  /** 
   * Unique project identifier for the analytics tracker.
   */
  projectId: string;
  /** 
   * Pushstate event tracking configuration for SPAs (or set to boolean to enable/disable).
   */
  pushstate?: IBaseExtensionOptions | boolean;
  /** 
   * Respect the user's 'Do Not Track' browser setting (default: false).
   */
  respectDnt?: boolean;
  /** 
   * Custom unique identifier for the session or user.
   */
  uniqueId?: string;
  /** 
   * Visibility tracking configuration (or set to boolean to enable/disable).
   */
  visibility?: IVivibilityExtensionOptions | boolean;
}
