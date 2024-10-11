/**
 * @vitest-environment jsdom
 */

import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ClickExtension } from '../../extensions/click.ext';
import { Tracker } from '../../tracker';

describe('ClickExtension', () => {
	const tracker = new Tracker({
		globalName: null,
		projectId: '1'
	});

	it('should create a new instance and attache click listener', () => {
		const addEventListenerSpy = vi.spyOn(globalThis, 'addEventListener');
		const result = new ClickExtension(tracker, {});
		expect(result).toBeInstanceOf(ClickExtension);
		expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), {
			capture: true
		});
	});

	describe('methods', () => {
		const ext = new ClickExtension(tracker, {});

		afterAll(() => {
			if (ext) {
				try {
					ext.destroy();
				} catch {}
			}
		});

		describe('.destroy()', () => {
			it('should remove click', () => {
				const removeEventListenerSpy = vi.spyOn(globalThis, 'removeEventListener');
				ext.destroy();
				expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
			});
		});

		describe('.getExitReason()', () => {
			let a: HTMLAnchorElement;

			beforeEach(() => {
				a = document.createElement('a');
			});

			it('should return outbound url if clicked on a A element with external URL', () => {
				a.setAttribute('href', 'https://google.com/');
				ext.onClick({
					target: a,
					timeStamp: performance.now()
				} as any);
				expect(ext.getExitReason()).toEqual('https://google.com/');
			});

			it('should return undefined if clicked on a A element with internal URL', () => {
				a.setAttribute('href', '/test');
				ext.onClick({
					target: a,
					timeStamp: performance.now()
				} as any);
				expect(ext.getExitReason()).toBeUndefined();
			});
		});
	});
});
