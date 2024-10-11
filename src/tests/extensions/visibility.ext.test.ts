/**
 * @vitest-environment jsdom
 */

import { afterAll, describe, expect, it, vi } from 'vitest';
import { VisibilityExtension } from '../../extensions/visibility.ext';
import { Tracker } from '../../tracker';

describe('VisibilityExtension', () => {
	const tracker = new Tracker({
		globalName: null,
		projectId: '1'
	});

	it('should create a new instance and attache visibilitychange listener', () => {
		const addEventListenerSpy = vi.spyOn(globalThis, 'addEventListener');
		const result = new VisibilityExtension(tracker, {});
		expect(result).toBeInstanceOf(VisibilityExtension);
		expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
	});

	describe('methods', () => {
		const ext = new VisibilityExtension(tracker, {});

		afterAll(() => {
			if (ext) {
				try {
					ext.destroy();
				} catch {}
			}
		});

		describe('.destroy()', () => {
			it('should remove visibilitychange', () => {
				const removeEventListenerSpy = vi.spyOn(globalThis, 'removeEventListener');
				ext.destroy();
				expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
			});
		});
	});
});
