import { DestroyRef } from '@angular/core';
import { createMobileQuerySignal, startDialogResize } from './dialog-interaction.util';

function createResizeEvent(currentTarget: HTMLElement, clientX = 0, clientY = 0): MouseEvent {
  return {
    currentTarget,
    clientX,
    clientY,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  } as unknown as MouseEvent;
}

function buildDialogDom(): { pane: HTMLElement; wrapper: HTMLElement; handle: HTMLElement } {
  const pane = document.createElement('div');
  pane.className = 'cdk-overlay-pane';
  const wrapper = document.createElement('div');
  wrapper.className = 'dialog__wrapper';
  Object.defineProperty(wrapper, 'offsetWidth', { value: 600, configurable: true });
  Object.defineProperty(wrapper, 'offsetHeight', { value: 400, configurable: true });
  const handle = document.createElement('div');
  wrapper.appendChild(handle);
  pane.appendChild(wrapper);
  document.body.appendChild(pane);
  return { pane, wrapper, handle };
}

describe('dialog-interaction.util', () => {
  describe('createMobileQuerySignal', () => {
    let matchMediaMock: jest.Mock;

    beforeEach(() => {
      matchMediaMock = jest.fn();
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: matchMediaMock,
      });
    });

    it('initializes from the current match state and registers a change listener', () => {
      const addEventListener = jest.fn();
      matchMediaMock.mockReturnValue({
        matches: true,
        addEventListener,
        removeEventListener: jest.fn(),
      });

      const destroyRef = { onDestroy: jest.fn() } as unknown as DestroyRef;
      const isMobile = createMobileQuerySignal('(max-width: 640px)', destroyRef);

      expect(isMobile()).toBe(true);
      expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('updates the signal when the media query change event fires', () => {
      let changeHandler: (e: MediaQueryListEvent) => void = () => undefined;
      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => {
          changeHandler = handler;
        },
        removeEventListener: jest.fn(),
      });

      const destroyRef = { onDestroy: jest.fn() } as unknown as DestroyRef;
      const isMobile = createMobileQuerySignal('(max-width: 640px)', destroyRef);

      expect(isMobile()).toBe(false);
      changeHandler({ matches: true } as MediaQueryListEvent);
      expect(isMobile()).toBe(true);
    });

    it('removes the change listener when destroyRef fires', () => {
      const removeEventListener = jest.fn();
      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener,
      });

      let cleanup: () => void = () => undefined;
      const destroyRef = { onDestroy: (fn: () => void) => { cleanup = fn; } } as unknown as DestroyRef;
      createMobileQuerySignal('(max-width: 640px)', destroyRef);

      cleanup();
      expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('startDialogResize', () => {
    const config = { minWidth: 480, minHeight: 320, viewportMargin: 24 };
    let originalRaf: typeof window.requestAnimationFrame;

    beforeEach(() => {
      originalRaf = window.requestAnimationFrame;
      window.requestAnimationFrame = (cb: FrameRequestCallback): number => {
        cb(0);
        return 0;
      };
    });

    afterEach(() => {
      window.requestAnimationFrame = originalRaf;
      document.body.innerHTML = '';
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });

    it('prevents default but does nothing else when no .dialog__wrapper ancestor exists', () => {
      const handle = document.createElement('div');
      document.body.appendChild(handle);
      const event = createResizeEvent(handle);

      expect(() => startDialogResize(event, 'both', config)).not.toThrow();
      expect(event.preventDefault).toHaveBeenCalled();
      expect(document.body.style.cursor).toBe('');
    });

    it('picks the resize cursor per axis and marks the wrapper as resizing', () => {
      const { wrapper, handle } = buildDialogDom();
      startDialogResize(createResizeEvent(handle), 'width', config);
      expect(document.body.style.cursor).toBe('ew-resize');
      expect(wrapper.classList.contains('dialog__wrapper--resizing')).toBe(true);
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    it('resizes both dimensions on drag and syncs the CDK overlay pane', () => {
      const { pane, wrapper, handle } = buildDialogDom();

      startDialogResize(createResizeEvent(handle, 100, 100), 'both', config);
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 130 }));

      expect(wrapper.style.width).toBe('650px');
      expect(wrapper.style.height).toBe('430px');
      expect(pane.style.width).toBe('650px');
      expect(pane.style.height).toBe('430px');
    });

    it('pins the unconstrained dimension to its start value for a single-axis drag', () => {
      const { wrapper, handle } = buildDialogDom();

      startDialogResize(createResizeEvent(handle, 100, 100), 'width', config);
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 300 }));

      expect(wrapper.style.width).toBe('650px');
      expect(wrapper.style.height).toBe('400px');
    });

    it('clamps below the configured minimum size', () => {
      const { wrapper, handle } = buildDialogDom();

      startDialogResize(createResizeEvent(handle, 100, 100), 'both', config);
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: -1000, clientY: -1000 }));

      expect(wrapper.style.width).toBe(`${config.minWidth}px`);
      expect(wrapper.style.height).toBe(`${config.minHeight}px`);
    });

    it('resets cursor, selection and the resizing class on mouseup', () => {
      const { wrapper, handle } = buildDialogDom();

      startDialogResize(createResizeEvent(handle, 100, 100), 'both', config);
      document.dispatchEvent(new MouseEvent('mouseup'));

      expect(document.body.style.cursor).toBe('');
      expect(document.body.style.userSelect).toBe('');
      expect(wrapper.classList.contains('dialog__wrapper--resizing')).toBe(false);
    });
  });
});
