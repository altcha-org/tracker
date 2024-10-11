/**
 * @vitest-environment jsdom
 */

import { afterAll, describe, expect, it, vi } from 'vitest';
import { PushstateExtension } from '../../extensions/pushstate.ext';
import { Tracker } from '../../tracker';

describe('PushstateExtension', () => {
	const tracker = new Tracker({
		globalName: null,
		projectId: '1'
	});

	it('should create a new instance and attache popstate listener', () => {
		const addEventListenerSpy = vi.spyOn(globalThis, 'addEventListener');
		const result = new PushstateExtension(tracker, {});
		expect(result).toBeInstanceOf(PushstateExtension);
		expect(addEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
	});

	it('should replace history.pushState function', () => {
		const originalPushState = history.pushState;
		const ext = new PushstateExtension(tracker, {});
		expect(history.pushState).not.toEqual(originalPushState);
		ext.destroy();
	});

	describe('methods', () => {
		const ext = new PushstateExtension(tracker, {});

		afterAll(() => {
			if (ext) {
				try {
					ext.destroy();
				} catch {}
			}
		});

		describe('.destroy()', () => {
			it('should remove popstate', () => {
				const removeEventListenerSpy = vi.spyOn(globalThis, 'removeEventListener');
				ext.destroy();
				expect(removeEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
			});
		});

		describe('.onPushState()', () => {
			it('should call tracker.trackPageview()', () => {
				const trackedPageviewSpy = vi.spyOn(tracker, 'trackPageview');
				ext.onPushState();
				expect(trackedPageviewSpy).toHaveBeenCalled();
			});
		});
	});
});
