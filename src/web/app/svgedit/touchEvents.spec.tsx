import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

import touchEvents from './touchEvents';

const Workarea = () => (
  <div id="workarea" style={{ width: 100, height: 100 }}>
    <div id="svgcanvas" style={{ width: 300, height: 300 }}>
      <svg viewBox="0 0 100 100" />
    </div>
  </div>
);

const mouseDown = jest.fn();
const mouseMove = jest.fn();
const mouseUp = jest.fn();
const doubleClick = jest.fn();
const getZoom = jest.fn();
const setZoom = jest.fn();

let wrapper;

describe('test textPathEdit', () => {
  beforeAll(() => {
    document.body.innerHTML = "<div id='main'></div>";
    const mainDiv = document.getElementById('main');
    wrapper = mount(<Workarea />, { attachTo: mainDiv });
    const container = document.getElementById('svgcanvas');
    const workarea = document.getElementById('workarea');
    touchEvents.setupCanvasTouchEvents(
      container,
      workarea,
      mouseDown,
      mouseMove,
      mouseUp,
      doubleClick,
      getZoom,
      setZoom,
    );
  });

  afterAll(() => {
    wrapper?.detach();
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('test one finger touchEvents', () => {
    jest.useFakeTimers();
    const container = document.getElementById('svgcanvas');

    const onePointTouchStart = new TouchEvent('touchstart', {
      touches: [
        {
          identifier: 0,
          pageX: 10,
          pageY: 10,
        } as Touch,
      ],
    });
    container.dispatchEvent(onePointTouchStart);
    expect(mouseDown).not.toBeCalled();
    jest.runOnlyPendingTimers();
    expect(mouseDown).toHaveBeenNthCalledWith(1, onePointTouchStart);

    const onePointTouchMove = new TouchEvent('touchmove', {
      touches: [
        {
          identifier: 0,
          pageX: 20,
          pageY: 20,
        } as Touch,
      ],
    });
    container.dispatchEvent(onePointTouchMove);
    expect(mouseDown).toHaveBeenNthCalledWith(1, onePointTouchMove);

    const onePointTouchEnd = new TouchEvent('touchend', {
      changedTouches: [
        {
          identifier: 0,
          pageX: 20,
          pageY: 20,
        } as Touch,
      ],
    });
    container.dispatchEvent(onePointTouchEnd);
    expect(mouseUp).toHaveBeenNthCalledWith(1, onePointTouchEnd, false);

    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('test two finger touch', () => {
    const container = document.getElementById('svgcanvas');

    const firstPointTouchStart = new TouchEvent('touchstart', {
      touches: [
        {
          identifier: 0,
          pageX: 10,
          pageY: 10,
        } as Touch,
      ],
      // @ts-expect-error scale is defined in chrome & safari
      scale: 1,
    });
    container.dispatchEvent(firstPointTouchStart);
    expect(mouseDown).not.toBeCalled();

    const twoPointTouchStart = new TouchEvent('touchstart', {
      touches: [
        {
          identifier: 0,
          pageX: 10,
          pageY: 10,
        } as Touch,
        {
          identifier: 1,
          pageX: 20,
          pageY: 20,
        } as Touch,
      ],
      // @ts-expect-error scale is defined in chrome & safari
      scale: 1,
    });
    container.dispatchEvent(twoPointTouchStart);

    const twoPointTouchMovePan = new TouchEvent('touchmove', {
      touches: [
        {
          identifier: 0,
          pageX: 20,
          pageY: 20,
        } as Touch,
        {
          identifier: 1,
          pageX: 30,
          pageY: 30,
        } as Touch,
      ],
    });
    container.dispatchEvent(twoPointTouchMovePan);
    expect(mouseMove).toHaveBeenCalledTimes(0);
    expect(toJson(wrapper)).toMatchSnapshot();

    const twoPointTouchEnd = new TouchEvent('touchend', {
      touches: [
        {
          identifier: 0,
          pageX: 20,
          pageY: 20,
        } as Touch,
        {
          identifier: 1,
          pageX: 30,
          pageY: 30,
        } as Touch,
      ],
    });
    container.dispatchEvent(twoPointTouchEnd);
    expect(mouseUp).toHaveBeenCalledTimes(0);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
