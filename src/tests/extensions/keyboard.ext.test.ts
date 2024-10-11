/**
 * @vitest-environment jsdom
 */

import { afterAll, describe, expect, it, vi } from "vitest";
import { KeyboardExtension } from "../../extensions/keyboard.ext";
import { Tracker } from "../../tracker";

describe("KeyboardExtenstion", () => {
  const tracker = new Tracker({
    globalName: null,
    projectId: "1",
  });

  it("should create a new instance and attach keydown listener", () => {
    const addEventListenerSpy = vi.spyOn(globalThis, "addEventListener");
    const result = new KeyboardExtension(tracker, {});
    expect(result).toBeInstanceOf(KeyboardExtension);
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
  });

  describe("methods", () => {
    const ext = new KeyboardExtension(tracker, {});

    afterAll(() => {
      if (ext) {
        try {
          ext.destroy();
        } catch {}
      }
    });

    describe(".destroy()", () => {
      it("should remove keydown", () => {
        const removeEventListenerSpy = vi.spyOn(
          globalThis,
          "removeEventListener"
        );
        ext.destroy();
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
          "keydown",
          expect.any(Function)
        );
      });
    });

    describe(".isLastKeyboardEventCtrl()", () => {
      it("should return true if CTRL", () => {
        ext.onKeyDown({
          ctrlKey: true,
          timeStamp: performance.now(),
        } as KeyboardEvent);
        expect(ext.isLastKeyboardEventCtrl()).toBe(true);
      });

      it("should return true if META", () => {
        ext.onKeyDown({
          metaKey: true,
          timeStamp: performance.now(),
        } as KeyboardEvent);
        expect(ext.isLastKeyboardEventCtrl()).toBe(true);
      });
    });

    describe(".getExitReason()", () => {
      it("should return undefined if CTRL key was pressed but without unload", () => {
        ext.onKeyDown({
          ctrlKey: true,
          timeStamp: performance.now(),
        } as KeyboardEvent);
        expect(ext.getExitReason(false)).toBe(undefined);
      });

      it("should return undefined if CTRL key was pressed but a second ago", async () => {
        ext.onKeyDown({
          ctrlKey: true,
          timeStamp: performance.now(),
        } as KeyboardEvent);
        await new Promise((r) => setTimeout(r, 1000));
        expect(ext.getExitReason(true)).toBe(undefined);
      });

      it("should return empty string if CTRL key was pressed before unload", () => {
        ext.onKeyDown({
          ctrlKey: true,
          timeStamp: performance.now(),
        } as KeyboardEvent);
        expect(ext.getExitReason(true)).toBe("");
      });

      it("should return empty string if META key was pressed before unload", () => {
        ext.onKeyDown({
          metaKey: true,
          timeStamp: performance.now(),
        } as KeyboardEvent);
        expect(ext.getExitReason(true)).toBe("");
      });
    });
  });
});
