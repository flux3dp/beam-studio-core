/* eslint-disable import/first */
const read = jest.fn();
const write = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read,
  write,
}));

const getSVGAsync = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync,
}));

const updateLayerColor = jest.fn();
const updateRulers = jest.fn();
const resetView = jest.fn();
getSVGAsync.mockImplementation((callback) => {
  callback({
    Canvas: {
      isUsingLayerColor: false,
      updateLayerColor,
    },
    Editor: {
      curConfig: {
        showGrid: true,
      },
      updateRulers,
      resetView,
    },
  });
});

import viewMenu from './view';

describe('test view', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('test updateAntiAliasing', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    test('svg content is existing', () => {
      document.body.innerHTML = '<div id="svgcontent" />';
      viewMenu.updateAntiAliasing(false);
      expect(document.body.innerHTML).toBe('<div id="svgcontent" style="shape-rendering: optimizeSpeed;"></div>');
      viewMenu.updateAntiAliasing(true);
      expect(document.body.innerHTML).toBe('<div id="svgcontent" style=""></div>');
    });

    test('svg content does not exist', () => {
      document.body.innerHTML = '<div id="abcde" />';
      viewMenu.updateAntiAliasing(true);
      expect(document.body.innerHTML).toBe('<div id="abcde"></div>');
    });
  });

  test('test toggleLayerColor', () => {
    document.body.innerHTML = '<g class="layer" /><g class="layer" />';
    const result = viewMenu.toggleLayerColor();
    expect(write).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenNthCalledWith(1, 'use_layer_color', true);
    expect(updateLayerColor).toHaveBeenCalledTimes(2);
    expect(result).toBeTruthy();
  });

  test('test toggleGrid', () => {
    document.body.innerHTML = '<div id="canvasGrid" />';
    const result = viewMenu.toggleGrid();
    expect(document.body.innerHTML).toBe('<div id="canvasGrid" style="display: none"></div>');
    expect(result).toBeFalsy();
  });

  describe('test toggleRulers', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    test('default is false', () => {
      read.mockReturnValue(false);
      document.body.innerHTML = '<div id="rulers" />';
      const result = viewMenu.toggleRulers();
      expect(document.body.innerHTML).toBe('<div id="rulers"></div>');
      expect(updateRulers).toHaveBeenCalledTimes(1);
      expect(write).toHaveBeenCalledTimes(1);
      expect(write).toHaveBeenNthCalledWith(1, 'show_rulers', true);
      expect(result).toBeTruthy();
    });

    test('default is true', () => {
      read.mockReturnValue(true);
      document.body.innerHTML = '<div id="rulers" />';
      const result = viewMenu.toggleRulers();
      expect(document.body.innerHTML).toBe('<div id="rulers" style="display: none;"></div>');
      expect(updateRulers).not.toHaveBeenCalled();
      expect(write).toHaveBeenCalledTimes(1);
      expect(write).toHaveBeenNthCalledWith(1, 'show_rulers', false);
      expect(result).toBeFalsy();
    });
  });

  describe('test toggleZoomWithWindow', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    test('toggle one time', () => {
      const addEventListener = jest.spyOn(window, 'addEventListener');
      const removeEventListener = jest.spyOn(window, 'removeEventListener');
      const result = viewMenu.toggleZoomWithWindow();
      expect(resetView).toHaveBeenCalledTimes(1);
      expect(addEventListener).toHaveBeenCalledTimes(1);
      expect(addEventListener).toHaveBeenNthCalledWith(1, 'resize', resetView);
      expect(removeEventListener).not.toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    test('toggle second time', () => {
      const addEventListener = jest.spyOn(window, 'addEventListener');
      const removeEventListener = jest.spyOn(window, 'removeEventListener');
      const result = viewMenu.toggleZoomWithWindow();
      expect(resetView).toHaveBeenCalledTimes(1);
      expect(removeEventListener).toHaveBeenCalledTimes(1);
      expect(removeEventListener).toHaveBeenNthCalledWith(1, 'resize', resetView);
      expect(addEventListener).not.toHaveBeenCalled();
      expect(result).toBeFalsy();
    });
  });

  describe('test toggleAntiAliasing', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    test('default is false', () => {
      read.mockReturnValue(false);
      const result = viewMenu.toggleAntiAliasing();
      expect(write).toHaveBeenCalledTimes(1);
      expect(write).toHaveBeenNthCalledWith(1, 'anti-aliasing', true);
      expect(result).toBeTruthy();
    });

    test('default is true', () => {
      read.mockReturnValue(true);
      const result = viewMenu.toggleAntiAliasing();
      expect(write).toHaveBeenCalledTimes(1);
      expect(write).toHaveBeenNthCalledWith(1, 'anti-aliasing', false);
      expect(result).toBeFalsy();
    });
  });
});
