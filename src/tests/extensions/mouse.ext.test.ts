/**
 * @vitest-environment jsdom
 */

import { afterAll, describe, expect, it, vi } from 'vitest';
import { MouseExtension } from '../../extensions/mouse.ext';
import { Tracker } from '../../tracker';

describe('MouseExtenstion', () => {
	const tracker = new Tracker({
		globalName: null,
		projectId: '1'
	});

	it('should create a new instance and attach mouseleave listener', () => {
		const addEventListenerSpy = vi.spyOn(document.body, 'addEventListener');
		const result = new MouseExtension(tracker, {});
		expect(result).toBeInstanceOf(MouseExtension);
		expect(addEventListenerSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
	});

	describe('methods', () => {
		const ext = new MouseExtension(tracker, {});

		afterAll(() => {
			if (ext) {
				try {
					ext.destroy();
				} catch {}
			}
		});

		describe('.destroy()', () => {
			it('should remove mouseleave', () => {
				const removeEventListenerSpy = vi.spyOn(document.body, 'removeEventListener');
				ext.destroy();
				expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
			});
		});

		describe('.getExitReason()', () => {
			it('should return empty string if cursor is outside the viewport', () => {
				ext.onMouseLeave({
					clientX: 500,
					clientY: -1
				} as MouseEvent);
				expect(ext.getExitReason()).toBe('');
			});

			it('should return undefined if cursor is outside the viewport but in the top left corner (navigation buttons)', () => {
				ext.onMouseLeave({
					clientX: 100,
					clientY: -1
				} as MouseEvent);
				ext.onMouseEnter();
				expect(ext.getExitReason()).toBe(undefined);
			});

			it('should return undefined if cursor is inside the viewport', () => {
				ext.onMouseLeave({
					clientX: 500,
					clientY: -1
				} as MouseEvent);
				ext.onMouseEnter();
				expect(ext.getExitReason()).toBe(undefined);
			});
		});
	});
});
