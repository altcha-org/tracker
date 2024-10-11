/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tracker } from '../tracker';
import type { IEvent, ITrackerOptions } from '../types';

describe('Tracker', () => {

  describe('constructor', () => {
    it('should throw error if projectId is not provided', () => {
      expect(() => new Tracker({
        globalName: null,
      } as ITrackerOptions)).toThrow();
    });

    it('should throw error if projectId is an empty string', () => {
      expect(() => new Tracker({
        globalName: null,
        projectId: '',
      })).toThrow();
    });

    it('should create a new instance and attach pagehide and beforeunload listeners', () => {
      const addEventListenerSpy = vi.spyOn(globalThis, "addEventListener");
      expect(new Tracker({
        globalName: null,
        projectId: '1'
      })).toBeInstanceOf(Tracker);
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "pagehide",
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
    });

    it('should register a global reference to the instance', () => {
      const t = new Tracker({
        projectId: '1',
      });
      // @ts-expect-error
      expect(globalThis[Tracker.DEAFAUL_GLOBAL_NAME]).toEqual(t);
      t.destroy();
    });

    it('should throw if another global reference is already registered', () => {
      const t = new Tracker({
        projectId: '1',
      });
      expect(() => new Tracker({
        projectId: '1',
      } as ITrackerOptions)).toThrow();
      t.destroy();
    });

    it('should register a global reference to the instance with a configured name', () => {
      const t = new Tracker({
        globalName: 'test',
        projectId: '1',
      });
      // @ts-expect-error
      expect(globalThis.test).toEqual(t);
      t.destroy();
    });

    it('should load default extensions', () => {
      const loadExtensionsSpy = vi.spyOn(Tracker.prototype, "loadExtensions");
      const tracker = new Tracker({
        globalName: null,
        projectId: '1'
      });
      expect(loadExtensionsSpy).toHaveBeenCalledOnce();
      expect(Tracker.DEFAULT_EXTENSIONS.length).toBeGreaterThan(0);
      expect(Object.keys(tracker.extensions)).toEqual(Tracker.DEFAULT_EXTENSIONS);
    });

    it('should disable all extensions', () => {
      const tracker = new Tracker({
        globalName: null,
        click: false,
        keyboard: false,
        mouse: false,
        pushstate: false,
        visibility: false,
        projectId: '1'
      });
      expect(Object.keys(tracker.extensions).length).toEqual(0);
    });

    it('should enable only pushstate extension', () => {
      const tracker = new Tracker({
        globalName: null,
        click: false,
        keyboard: false,
        mouse: false,
        pushstate: true,
        visibility: false,
        projectId: '1'
      });
      expect(Object.keys(tracker.extensions)).toEqual(['pushstate']);
    });
  });

  describe('properties', () => {
    let tracker: Tracker;

    afterEach(() => {
      if (tracker) {
        tracker.destroy();
      }
    });

    beforeEach(() => {
      tracker = new Tracker({
        globalName: null,
        projectId: '1',
      });
      vi.restoreAllMocks();
    });

    describe('.apiUrl', () => {
      it('should return default API URL', () => {
        expect(tracker.apiUrl).toEqual(Tracker.DEFAULT_API_URL);
      });
      
      it('should return custom API URL when configured', () => {
        const apiUrl = 'http://example.com/event';
        const t = new Tracker({
          apiUrl,
          globalName: null,
          projectId: '1',
        });
        expect(t.apiUrl).toEqual(apiUrl);
        t.destroy();
      });
    });

    describe('.isDNTEnabled', () => {
      it('should return true if navigator.doNotTrack is 1', () => {
        // @ts-ignore
        navigator.doNotTrack = '1';
        expect(tracker.isDNTEnabled).toEqual(true);
        // @ts-ignore
        navigator.doNotTrack = '0';
      });

      it('should return true if navigator.globalPrivacyControl is true', () => {
        // @ts-ignore
        navigator.globalPrivacyControl = true;
        expect(tracker.isDNTEnabled).toEqual(true);
        // @ts-ignore
        navigator.globalPrivacyControl = false;
      });
    });
  });

  describe('methods', () => {
    let tracker: Tracker;

    afterEach(() => {
      if (tracker) {
        tracker.destroy();
      }
    });

    beforeEach(() => {
      tracker = new Tracker({
        globalName: null,
        projectId: '1',
      });
      vi.restoreAllMocks();
    });

    describe('.destroy()', () => {
      it('should destroy the instance and remove pagehide listener', () => {
        const removeEventListenerSpy = vi.spyOn(
          globalThis,
          "removeEventListener"
        );
        tracker.destroy();
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
          "pagehide",
          expect.any(Function)
        );
      });
    });

    describe('.getBeaconPayload()', () => {
      it('should return an object with events, time and projectId', () => {
        const events: IEvent[] = [{
          timestamp: Date.now(),
        }];
        expect(tracker.getBeaconPayload(events)).toEqual({
          events,
          projectId: tracker.options.projectId,
          time: expect.any(Number),
        });
      });
    });

    describe('.getHostname()', () => {
      it('should return current location hostnane (localhost by default in JSDOM)', () => {
        expect(tracker.getHostname()).toEqual('localhost');
      });
    });

    describe('.getPageviewOptions()', () => {
      it('should return options for pageview event', () => {
        expect(tracker.getPageviewOptions()).toEqual({
          appVersion: undefined,
          duration: expect.any(Number),
          exit: false,
          outbound: undefined,
          referrer: expect.any(String),
          returning: undefined,
          view: expect.any(String),
        });
      });

      it('should return exit reason from .getExitReason()', () => {
        const getExitReasonSpy = vi.spyOn(tracker, 'getExitReason');
        expect(tracker.getPageviewOptions().exit).toEqual(false);
        expect(getExitReasonSpy).toHaveBeenCalled();
      });

      it('should return duration', () => {
        tracker.lastPageLoadAt = performance.now() - 1100;
        expect(tracker.getPageviewOptions().duration).toBeGreaterThan(1000);
      });

      it('should return referrer from .getReferrer()', () => {
        const getReferrerSpy = vi.spyOn(tracker, 'getReferrer');
        expect(tracker.getPageviewOptions().referrer).toEqual(tracker.getReferrer());
        expect(getReferrerSpy).toHaveBeenCalled();
      });

      it('should return view for .getView()', () => {
        const getViewSpy = vi.spyOn(tracker, 'getView');
        expect(tracker.getPageviewOptions().view).toEqual(tracker.getView());
        expect(getViewSpy).toHaveBeenCalled();
      });
    });

    describe('.getReferrer()', () => {
      it('should return the document referrer (empty string by default)', () => {
        expect(tracker.getReferrer()).toEqual('');
      });
    });

    describe('.getView()', () => {
      it('should return current location href', () => {
        expect(tracker.getView()).toEqual(location.href);
      });

      it('should return call .sanitizeUrl()', () => {
        const sanitizeUrlSpy = vi.spyOn(tracker, 'sanitizeUrl');
        expect(tracker.getView()).toEqual(location.href);
        expect(sanitizeUrlSpy).toHaveBeenCalled();
      });
    });

    describe('.hasExtension()', () => {
      it('should return true if extension is loaded', () => {
        expect(tracker.hasExtension('pushstate')).toEqual(true);
      });
      it('should return true if extension is not loaded', () => {
        expect(tracker.hasExtension('nonexistent' as any)).toEqual(false);
      });
    });

    describe('.log()', () => {
      it('should not log anything if debug is disabled', () => {
        const logSpy = vi.spyOn(console, 'log');
        tracker.log('test');
        expect(logSpy).not.toHaveBeenCalled();
      });

      it('should log if debug is enabled', () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => void 0);
        tracker.options.debug = true;
        tracker.log('test');
        expect(logSpy).toHaveBeenCalledOnce();
      });
    });

    describe('.sanitizeUrl()', () => {
      it('should remove search params and hash', () => {
        const url = 'https://localhost:1234/test'
        expect(tracker.sanitizeUrl(url + '?test=123#removethis')).toEqual(url);
      });

      it('should remove only non-whitelisted search params', () => {
        const url = 'https://localhost:1234/test'
        const t = new Tracker({
          allowSearchParams: ['test1', 'test2'],
          globalName: null,
          projectId: '1'
        });
        expect(t.sanitizeUrl(url + '?abc=test&test1=1&test2=2&test3=3')).toEqual(url + '?test1=1&test2=2');
        t.destroy();
      });
    });

    describe('.trackEvent()', () => {
      it('should record an event', () => {
        expect(tracker.trackedEvents).toEqual(0);
        tracker.trackEvent({
          customEvent: 'test',
          props: {
            customerPlan: 'free',
          },
        });
        expect(tracker.trackedEvents).toEqual(1);
        expect(tracker.events.length).toEqual(1);
        expect(tracker.events[0].timestamp).toBeGreaterThan(0);
      });
    });

    describe('.trackPageview()', () => {
      it('should record a pageview event', () => {
        expect(tracker.trackedEvents).toEqual(0);
        tracker.trackPageview();
        expect(tracker.trackedEvents).toEqual(1);
        expect(tracker.events.length).toEqual(1);
        expect(tracker.events[0].timestamp).toBeGreaterThan(0);
      });
    });

    describe('.flushEvents()', () => {
      it('should reset the internal events array', () => {
        tracker.trackEvent({
          customEvent: 'test',
        });
        expect(tracker.events.length).toEqual(1);
        tracker.flushEvents();
        expect(tracker.events.length).toEqual(0);
      });

      it('should call sendBeacon() with recoded events', () => {
        const sendBeaconSpy = vi.spyOn(tracker, 'sendBeacon');
        tracker.trackEvent({
          customEvent: 'test',
        });
        const events = [...tracker.events];
        tracker.flushEvents();
        expect(sendBeaconSpy).toHaveBeenCalledWith(events);
      });
    });

    describe('.sendBeacon()', () => {
      it('should call navigator.sendBeacon() with JSON data', () => {
        let sendBeaconArgs: any[] = [];
        navigator.sendBeacon = (...args: any[]) => {
          sendBeaconArgs = args;
          return true;
        };
        const sendBeaconSpy = vi.spyOn(navigator, 'sendBeacon');
        tracker.trackEvent({
          customEvent: 'test',
        });
        const events = [...tracker.events];
        tracker.flushEvents();
        expect(sendBeaconSpy).toHaveBeenCalledWith(tracker.apiUrl, expect.any(String));
        expect(JSON.parse(sendBeaconArgs[1])).toEqual({
          events,
          projectId: tracker.options.projectId,
          time: expect.any(Number),
        })
      });
    });

    describe('.onPageHide()', () => {
      it('should track pageview and flush events', () => {
        const trackPageviewSpy = vi.spyOn(tracker, 'trackPageview');
        const flushEventsSpy = vi.spyOn(tracker, 'flushEvents');
        tracker.onPageHide();
        expect(trackPageviewSpy).toHaveBeenCalledWith({}, true);
        expect(flushEventsSpy).toHaveBeenCalled();
      });
    });
  });
});