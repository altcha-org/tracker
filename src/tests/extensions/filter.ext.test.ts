/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FilterExtension } from '../../extensions/filter.ext';
import { Tracker } from '../../tracker';

describe('FilterExtenstion', () => {
	const tracker = new Tracker({
		globalName: null,
		projectId: '1'
	});

	it('should create a new instance', () => {
		const result = new FilterExtension(tracker, {});
		expect(result).toBeInstanceOf(FilterExtension);
	});
 
	describe('methods', () => {
		const ext = new FilterExtension(tracker, {});

    describe('.isBot()', () => {
      it('should return false if not a bot', () => {
        vi.spyOn(tracker, 'getUserAgent').mockReturnValue('normal chrome agent');
        expect(ext.isBot()).toEqual(false);
      });

      it('should return true if UA includes "bot"', () => {
        vi.spyOn(tracker, 'getUserAgent').mockReturnValue('some bot agent');
        expect(ext.isBot()).toEqual(true);
      });

      it('should return true if UA includes "spider"', () => {
        vi.spyOn(tracker, 'getUserAgent').mockReturnValue('some spider agent');
        expect(ext.isBot()).toEqual(true);
      });
    });

    describe('.isPrivateHostname()', () => {
      it('should return false if not a private hostname', () => {
        vi.spyOn(tracker, 'getHostname').mockReturnValue('google.com');
        expect(ext.isPrivateHostname()).toEqual(false);
      });

      it('should return true for 127.0.0.1', () => {
        vi.spyOn(tracker, 'getHostname').mockReturnValue('127.0.0.1');
        expect(ext.isPrivateHostname()).toEqual(true);
      });

      it('should return true for localhost', () => {
        vi.spyOn(tracker, 'getHostname').mockReturnValue('localhost');
        expect(ext.isPrivateHostname()).toEqual(true);
      });

      it('should return true for abc.local', () => {
        vi.spyOn(tracker, 'getHostname').mockReturnValue('abc.local');
        expect(ext.isPrivateHostname()).toEqual(true);
      });
    });

    describe('.shouldTrackEvent()', () => {
      const event = {
        timestamp: Date.now(),
      };

      afterEach(() => {
        vi.restoreAllMocks();
      });

      beforeEach(() => {
        vi.spyOn(tracker, 'getHostname').mockReturnValue('google.com');
        vi.spyOn(tracker, 'getUserAgent').mockReturnValue('chrome');
      });

      it('should return true', () => {
        expect(ext.shouldTrackEvent(event)).toEqual(true);
      });

      it('should call .isBot()', () => {
        const isBotSpy = vi.spyOn(ext, 'isBot');
        expect(ext.shouldTrackEvent(event)).toEqual(true);
        expect(isBotSpy).toHaveBeenCalled();
      });
      
      it('should call .isPrivateHostname()', () => {
        const isPrivateHostnameSpy = vi.spyOn(ext, 'isPrivateHostname');
        expect(ext.shouldTrackEvent(event)).toEqual(true);
        expect(isPrivateHostnameSpy).toHaveBeenCalled();
      });

      it('should call custom checkFn function', () => {
        const checkFn = () => {};
        const extCheck = new FilterExtension(tracker, {
          checkFn,
        });
        const checkFnSpy = vi.spyOn(extCheck, 'checkFn');
        expect(extCheck.shouldTrackEvent(event)).toEqual(true);
        expect(checkFnSpy).toHaveBeenCalled();
      });

      it('should return false for a bot', () => {
        vi.spyOn(tracker, 'getUserAgent').mockReturnValue('bot');
        expect(ext.shouldTrackEvent(event)).toEqual(false);
      });

      it('should return false for a private hostname', () => {
        vi.spyOn(tracker, 'getHostname').mockReturnValue('localhost');
        expect(ext.shouldTrackEvent(event)).toEqual(false);
      });

      it('should return false if checkFn returns false', () => {
        const checkFn = () => false;
        const extCheck = new FilterExtension(tracker, {
          checkFn,
        });
        const checkFnSpy = vi.spyOn(extCheck, 'checkFn');
        expect(extCheck.shouldTrackEvent(event)).toEqual(false);
        expect(checkFnSpy).toHaveBeenCalled();
      });

      it('should return false if localStorage.altcha_ignore is set', () => {
        localStorage.setItem(FilterExtension.LOCAL_STORAGE_KEY, 'true');
        const extFlag = new FilterExtension(tracker, {});
        expect(extFlag.shouldTrackEvent(event)).toEqual(false);
        localStorage.removeItem(FilterExtension.LOCAL_STORAGE_KEY);
      });
    });
  });
});
