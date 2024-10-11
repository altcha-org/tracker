/**
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi } from 'vitest'
import { CookieExtension } from '../../extensions/cookie.ext';
import { Tracker } from '../../tracker';

describe('CookieExtenstion', () => {
  const tracker = new Tracker({
    globalName: null,
    projectId: '1',
  });

  it('should create a new instance and set new cookie', () => {
    const getCookie = vi.spyOn(CookieExtension.prototype, 'getCookie');
    const setCookie = vi.spyOn(CookieExtension.prototype, 'setCookie');
    const result = new CookieExtension(tracker, {});
    expect(result).toBeInstanceOf(CookieExtension);
    expect(getCookie).toHaveBeenCalledOnce();
    expect(setCookie).toHaveBeenCalledOnce();
  })
});
