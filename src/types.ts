export interface IBaseExtensionOptions {
  disable?: boolean;
}

export interface ICookieExtensionOptions extends IBaseExtensionOptions {
  cookieExpireDays?: number;
  cookieName?: string;
  cookiePath?: string;
}

export interface IVivibilityExtensionOptions extends IBaseExtensionOptions {
  hiddenTimeout?: number;
}

export interface IEvent {
  customEvent?: string;
  duration?: number;
  exit?: boolean;
  props?: Record<string, string>;
  returning?: boolean;
  timestamp: number;
  view?: string;
}

export interface ITrackerOptions {
  allowSearchParams?: string[];
  apiUrl?: string;
  appVersion?: string;
  click?: IBaseExtensionOptions | boolean;
  cookie?: ICookieExtensionOptions | boolean;
  debug?: boolean;
  globalName?: string | null | false;
  hash?: IBaseExtensionOptions | boolean;
  keyboard?: IBaseExtensionOptions | boolean;
  mouse?: IBaseExtensionOptions | boolean;
  projectId: string;
  pushstate?: IBaseExtensionOptions | boolean;
  respectDNT?: boolean;
  uniqueId?: string;
  visibility?: IVivibilityExtensionOptions | boolean;
}