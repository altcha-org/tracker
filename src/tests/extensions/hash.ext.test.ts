/**
 * @vitest-environment jsdom
 */

import { afterAll, describe, expect, it, vi } from 'vitest';
import { HashExtension } from '../../extensions/hash.ext';
import { Tracker } from '../../tracker';

describe('HashExtension', () => {
	const tracker = new Tracker({
		globalName: null,
		projectId: '1'
	});

	it('should create a new instance and attache hashchange listener', () => {
		const addEventListenerSpy = vi.spyOn(globalThis, 'addEventListener');
		const result = new HashExtension(tracker, {});
		expect(result).toBeInstanceOf(HashExtension);
		expect(addEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
	});

	describe('methods', () => {
		const ext = new HashExtension(tracker, {});

		afterAll(() => {
			if (ext) {
				try {
					ext.destroy();
				} catch {}
			}
		});

		describe('.destroy()', () => {
			it('should remove hashchange', () => {
				const removeEventListenerSpy = vi.spyOn(globalThis, 'removeEventListener');
				ext.destroy();
				expect(removeEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
			});
		});

		describe('.onHashChange()', () => {
			it('should call tracker.trackPageview()', () => {
				const trackedPageviewSpy = vi.spyOn(tracker, 'trackPageview');
				ext.onHashChange();
				expect(trackedPageviewSpy).toHaveBeenCalled();
			});
		});
	});
});
