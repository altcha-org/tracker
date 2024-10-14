var X = Object.defineProperty;
var O = (s) => {
  throw TypeError(s);
};
var B = (s, e, t) => e in s ? X(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var o = (s, e, t) => B(s, typeof e != "symbol" ? e + "" : e, t), R = (s, e, t) => e.has(s) || O("Cannot " + t);
var n = (s, e, t) => (R(s, e, "read from private field"), t ? t.call(s) : e.get(s)), a = (s, e, t) => e.has(s) ? O("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(s) : e.set(s, t), l = (s, e, t, i) => (R(s, e, "write to private field"), i ? i.call(s, t) : e.set(s, t), t), _ = (s, e, t) => (R(s, e, "access private method"), t);
class u {
  constructor(e, t = { disable: !1 }) {
    o(this, "lastEvent", null);
    this.tracker = e, this.options = t;
  }
  destroy() {
  }
  getExitReason(e = !1) {
  }
  isLastEventRecent(e = 1e4, t = this.lastEvent) {
    return !!t && performance.now() - t.timeStamp < e;
  }
  shouldTrackEvent(e) {
    return !0;
  }
}
var f;
class V extends u {
  constructor(t, i) {
    super(t);
    a(this, f, this.onClick.bind(this));
    addEventListener("click", n(this, f), {
      capture: !0
    });
  }
  destroy() {
    removeEventListener("click", n(this, f));
  }
  getExitReason() {
    if (this.lastEvent && this.isLastEventRecent()) {
      const t = this.lastEvent.target, i = (t == null ? void 0 : t.getAttribute("data-link")) || (t == null ? void 0 : t.getAttribute("href"));
      if (i) {
        const r = new URL(i, location.origin);
        if (r.hostname && r.hostname !== location.hostname)
          return this.tracker.sanitizeUrl(r);
      }
    }
  }
  onClick(t) {
    const i = t.target;
    i && i.tagName === "A" && (this.lastEvent = t);
  }
}
f = new WeakMap();
var g, p, m;
class G extends u {
  constructor(t, i) {
    super(t);
    a(this, g);
    a(this, p);
    a(this, m);
    l(this, g, i.cookieName || "_altcha_visited"), l(this, p, i.cookieExpireDays || 30), l(this, m, i.cookiePath || "/"), this.getCookie(n(this, g)) === "1" && (this.tracker.returningVisitor = !0), this.setCookie(
      n(this, g),
      "1",
      new Date(Date.now() + 864e5 * n(this, p))
    );
  }
  destroy() {
  }
  getCookie(t) {
    const i = document.cookie.split(/;\s?/);
    for (const r of i)
      if (r.startsWith(t + "="))
        return r.slice(t.length + 1);
    return null;
  }
  setCookie(t, i, r) {
    document.cookie = t + "=" + i + "; expires=" + r.toUTCString() + `; SameSite=Strict; path=${n(this, m) || "/"}`;
  }
}
g = new WeakMap(), p = new WeakMap(), m = new WeakMap();
var b, k;
const c = class c extends u {
  constructor(t, i) {
    super(t);
    a(this, b);
    a(this, k, !1);
    this.options = i, l(this, k, localStorage.getItem(c.LOCAL_STORAGE_KEY) === "true"), l(this, b, (i.hostnames || c.DEFAULT_HOSTNAMES).map((r) => r.includes("*") ? new RegExp(r.replace(/\*/g, "[^.]+")) : r));
  }
  checkFn(t) {
    if (this.options.checkFn)
      return this.options.checkFn(t);
  }
  destroy() {
  }
  isBot() {
    return c.CRAWLER_REG_EXP.test(this.tracker.getUserAgent());
  }
  isPrivateHostname() {
    const t = this.tracker.getHostname();
    return n(this, b).some((i) => i instanceof RegExp && i.test(t) ? !0 : t === i);
  }
  /**
   * Checks, whether the event should be tracked or excluded.
   *
   * @returns {boolean}
   */
  shouldTrackEvent(t) {
    if (n(this, k))
      return this.tracker.log(`ignoring event: ${c.LOCAL_STORAGE_KEY}`), !1;
    const i = this.checkFn(t);
    return i !== void 0 ? i : this.isPrivateHostname() ? (this.tracker.log("ignoring event: private hostname"), !1) : this.options.allowBots !== !0 && this.isBot() ? (this.tracker.log("ignoring event: bot"), !1) : !0;
  }
};
b = new WeakMap(), k = new WeakMap(), o(c, "CRAWLER_REG_EXP", /(?:bot|spider|crawler|facebookexternalhit|simplepie|yahooseeker|embedly|quora link preview|outbrain|vkshare|monit|Pingability|Monitoring|WinHttpRequest|Apache-HttpClient|getprismatic.com|python-requests|Twurly|yandex|browserproxy|Qwantify|Yahoo! Slurp|pinterest|Tumblr|WhatsApp|Google-Structured-Data-Testing-Tool|Google-InspectionTool|GPTBot|Applebot)/i), o(c, "DEFAULT_HOSTNAMES", ["127.0.0.1", "localhost", "*.local"]), o(c, "LOCAL_STORAGE_KEY", "altcha_ignore");
let C = c;
var y;
class K extends u {
  constructor(t, i) {
    super(t);
    a(this, y, this.onHashChange.bind(this));
    addEventListener("hashchange", n(this, y));
  }
  destroy() {
    removeEventListener("hashchange", n(this, y));
  }
  onHashChange() {
    this.tracker.trackPageview();
  }
}
y = new WeakMap();
var x;
class F extends u {
  constructor(t, i) {
    super(t);
    a(this, x, this.onKeyDown.bind(this));
    addEventListener("keydown", n(this, x));
  }
  destroy() {
    removeEventListener("keydown", n(this, x));
  }
  isLastKeyboardEventCtrl() {
    return !!this.lastEvent && (this.lastEvent.ctrlKey || this.lastEvent.metaKey);
  }
  getExitReason(t = !1) {
    if (t && this.isLastEventRecent(100) && this.isLastKeyboardEventCtrl())
      return "";
  }
  onKeyDown(t) {
    this.lastEvent = t;
  }
}
x = new WeakMap();
var L, w;
class Y extends u {
  constructor(t, i) {
    super(t);
    a(this, L, this.onMouseEnter.bind(this));
    a(this, w, this.onMouseLeave.bind(this));
    o(this, "isMouseOut", !1);
    o(this, "offsetX", -1);
    o(this, "offsetY", -1);
    document.body.addEventListener("mouseleave", n(this, w)), document.body.addEventListener("mouseenter", n(this, L));
  }
  destroy() {
    document.body.removeEventListener("mouseleave", n(this, w)), document.body.removeEventListener("mouseenter", n(this, L));
  }
  getExitReason() {
    if (this.isMouseOut) {
      const t = this.tracker.getExtension("pushstate");
      return t && t.lastPopStateEvent && t.isLastEventRecent(100, t.lastPopStateEvent) || this.offsetX >= 0 && this.offsetX >= 0 && this.offsetX < 150 ? void 0 : "";
    }
  }
  onMouseEnter() {
    this.isMouseOut = !1, this.offsetX = -1, this.offsetY = -1;
  }
  onMouseLeave(t) {
    this.isMouseOut = !0, this.offsetX = t.clientX, this.offsetY = t.clientY;
  }
}
L = new WeakMap(), w = new WeakMap();
var v, P, A;
class q extends u {
  constructor(t, i) {
    super(t);
    a(this, v, null);
    a(this, P, this.onPopState.bind(this));
    a(this, A, this.onPushState.bind(this));
    o(this, "lastPopStateEvent", null);
    const r = l(this, v, history.pushState);
    history.pushState = (M, H, I) => {
      n(this, A).call(this), r == null || r.apply(history, [M, H, I]);
    }, addEventListener("popstate", n(this, P));
  }
  destroy() {
    n(this, v) && (history.pushState = n(this, v)), removeEventListener("popstate", n(this, P));
  }
  onPopState(t) {
    this.lastPopStateEvent = t, this.tracker.trackPageview();
  }
  onPushState() {
    this.tracker.trackPageview();
  }
}
v = new WeakMap(), P = new WeakMap(), A = new WeakMap();
var S, T, E;
class W extends u {
  constructor(t, i) {
    super(t);
    a(this, S, this.onVisibilityChange.bind(this));
    a(this, T);
    a(this, E, null);
    o(this, "visibilityState", document.visibilityState);
    l(this, T, i.hiddenTimeout || 4e3), addEventListener("visibilitychange", n(this, S));
  }
  destroy() {
    removeEventListener("visibilitychange", n(this, S));
  }
  getExitReason(t = !1) {
    if (t && this.visibilityState === "hidden" && this.lastEvent && performance.now() - this.lastEvent.timeStamp >= 1e3)
      return "";
  }
  onTimeout() {
    document.visibilityState === "hidden" && this.tracker.trackPageview({}, !0);
  }
  onVisibilityChange(t) {
    this.lastEvent = t, this.visibilityState = document.visibilityState, this.tracker.isMobile && (n(this, E) && clearTimeout(n(this, E)), document.visibilityState === "hidden" && l(this, E, setTimeout(() => {
      this.onTimeout();
    }, n(this, T))));
  }
}
S = new WeakMap(), T = new WeakMap(), E = new WeakMap();
var d, N, D;
const h = class h {
  /**
   * Constructor to initialize the Tracker instance.
   *
   * @param options - Configuration options for the tracker, including project ID, API URL, and extension settings.
   */
  constructor(e) {
    a(this, N);
    // Bound method to handle the 'pagehide' event
    a(this, d, this.onPageHide.bind(this));
    // Boolean flag indicating if the user is on a mobile device
    o(this, "isMobile", /Mobi|Android|iPhone|iPad|iPod|Opera Mini/i.test(
      this.getUserAgent()
    ));
    // Array to store tracked events
    o(this, "events", []);
    // Object to store initialized extensions
    o(this, "extensions", {});
    // The global name registered for the tracker instance, or null if none is registered
    o(this, "globalName", null);
    // Timestamp of the last page load
    o(this, "lastPageLoadAt", performance.now());
    // Last recorded pageview URL
    o(this, "lastPageview", null);
    // Boolean flag indicating if the visitor is returning
    o(this, "returningVisitor", null);
    // Number of events tracked
    o(this, "trackedEvents", 0);
    // Number of pageviews tracked
    o(this, "trackedPageviews", 0);
    if (this.options = e, !e.projectId)
      throw new Error("Parameter projectId required.");
    _(this, N, D).call(this), this.isDNTEnabled && this.options.respectDnt === !0 ? this.log("DoNotTrack enabled.") : (this.loadExtensions(), addEventListener("pagehide", n(this, d)), addEventListener("beforeunload", n(this, d)));
  }
  /**
   * Getter for the API URL. Returns the user-provided API URL or the default one.
   */
  get apiUrl() {
    return this.options.apiUrl || h.DEFAULT_API_URL;
  }
  /**
   * Getter to determine if "Do Not Track" (DNT) is enabled in the user's browser.
   */
  get isDNTEnabled() {
    return "doNotTrack" in navigator && navigator.doNotTrack === "1" || "globalPrivacyControl" in navigator && navigator.globalPrivacyControl === !0;
  }
  /**
   * Destroys the tracker instance, removing all listeners and extensions.
   */
  destroy() {
    this.flushEvents();
    for (const e in this.extensions)
      this.extensions[e].destroy();
    this.extensions = {}, removeEventListener("pagehide", n(this, d)), removeEventListener("beforeunload", n(this, d)), this.globalName && delete globalThis[this.globalName];
  }
  /**
   * Flushes all collected events by sending them to the API.
   */
  flushEvents() {
    const e = this.events.splice(0);
    e.length && this.sendBeacon(e);
  }
  /**
   * Builds the payload for sending events to the API.
   *
   * @param events - List of events to be sent.
   * @returns The payload object containing events, project ID, timestamp, and unique ID.
   */
  getBeaconPayload(e) {
    return {
      events: e,
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
  getExitReason(e = !1) {
    for (const t in this.extensions) {
      const i = this.extensions[t].getExitReason(e);
      if (i !== void 0)
        return this.log("exit reason:", { ext: t, result: i }), i;
    }
  }
  /**
   * Retrieves an extension by name.
   *
   * @param name - The name of the extension to retrieve.
   * @returns The extension instance.
   */
  getExtension(e) {
    return this.extensions[e];
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
   * Returns the current "user-agent".
   */
  getUserAgent() {
    return navigator.userAgent || "";
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
  getPageviewOptions(e = !1) {
    const t = this.getExitReason(e), i = this.getReferrer(), r = this.getOrigin();
    return {
      appVersion: this.options.appVersion,
      exit: t !== void 0,
      outbound: t,
      duration: Math.max(0, Math.floor(performance.now() - this.lastPageLoadAt)),
      referrer: i && new URL(i, r).origin === r ? "" : i,
      returning: this.returningVisitor === null ? void 0 : this.returningVisitor,
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
  hasExtension(e) {
    return !!this.getExtension(e);
  }
  /**
   * Loads all active extensions based on the tracker options and default settings.
   */
  loadExtensions() {
    var e;
    for (const t in h.EXTENSIONS) {
      let i = ((e = this.options) == null ? void 0 : e[t]) !== void 0 ? this.options[t] : {};
      typeof i == "boolean" ? i = {
        disable: !i
      } : i.disable = i.disable === void 0 ? !h.DEFAULT_EXTENSIONS.includes(t) : i.disable, i.disable !== !0 && (this.extensions[t] = new h.EXTENSIONS[t](
        this,
        i
      ));
    }
  }
  /**
   * Logs a message to the console if debug mode is enabled.
   *
   * @param args - The message or data to log.
   */
  log(...e) {
    this.options.debug && console.log("[ALTCHA Tracker]", ...e);
  }
  /**
   * Removes query parameters and fragments from the URL based on the tracker settings.
   *
   * @param href - The full URL to be sanitized.
   * @returns The sanitized URL.
   */
  sanitizeUrl(e) {
    var t;
    if (e = new URL(e), (t = this.options.allowSearchParams) != null && t.length && e.hostname === this.getHostname())
      for (const [i] of e.searchParams)
        this.options.allowSearchParams.includes(i) || e.searchParams.delete(i);
    else
      e.search = "";
    return this.hasExtension("hash") || (e.hash = ""), e.toString();
  }
  /**
   * Sends the collected events to the server using the Beacon API.
   *
   * @param events - The list of events to send.
   */
  sendBeacon(e) {
    if ("sendBeacon" in navigator)
      return navigator.sendBeacon(this.apiUrl, JSON.stringify(this.getBeaconPayload(e)));
  }
  /**
   * Checks, whether the event should be tracked.
   * 
   * @returns {boolean} Returns true if the event should be tracked.
   */
  shouldTrackEvent(e) {
    for (const t in this.extensions)
      if (this.extensions[t].shouldTrackEvent(e) !== !0)
        return this.log("should not track event:", { ext: t, event: e }), !1;
    return !0;
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
  trackEvent(e = {}, t = !1) {
    const i = {
      timestamp: Date.now(),
      ...e
    };
    return this.shouldTrackEvent(i) ? (this.events.push(i), this.trackedEvents += 1, this.log("trackEvent", i), t && this.flushEvents(), !0) : !1;
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
  trackPageview(e = {}, t = !1) {
    const i = this.getPageviewOptions(t);
    return this.events.length && i.duration < 100 && this.events[this.events.length - 1].view === i.view ? (this.log("duplicate pageview", i), !1) : (this.log("trackPageview", i), this.trackEvent(
      {
        ...i,
        ...e
      },
      t
    ), this.trackedPageviews += 1, this.lastPageLoadAt = performance.now(), this.lastPageview = i.view, i.exit && (this.trackedPageviews = 0), !0);
  }
  /**
   * Handles the pagehide event, typically used to send any unsent events before the user leaves the page.
   */
  onPageHide() {
    this.lastPageview !== this.getView() && this.trackPageview({}, !0);
  }
};
d = new WeakMap(), N = new WeakSet(), /**
 * Registers the global name for the tracker instance.
 *
 * @returns True if the global name was registered, false otherwise.
 */
D = function() {
  if (this.globalName = this.options.globalName === void 0 ? h.DEAFAUL_GLOBAL_NAME : this.options.globalName || null, this.globalName) {
    if (globalThis[this.globalName])
      throw new Error(
        "Another instance of the Tracker is already present in globalThis. Set globalName:null to disable global reference."
      );
    globalThis[this.globalName] = this;
  }
}, // Static property containing all available extensions
o(h, "EXTENSIONS", {
  click: V,
  cookie: G,
  filter: C,
  hash: K,
  keyboard: F,
  mouse: Y,
  pushstate: q,
  visibility: W
}), // Default API endpoint for sending events
o(h, "DEFAULT_API_URL", "https://eu.altcha.org/api/v1/event"), // Default set of enabled extensions when initializing the tracker
o(h, "DEFAULT_EXTENSIONS", [
  "click",
  "filter",
  "keyboard",
  "mouse",
  "pushstate",
  "visibility"
]), // Default global name for the tracker instance
o(h, "DEAFAUL_GLOBAL_NAME", "altchaTracker");
let U = h;
export {
  U as Tracker
};
