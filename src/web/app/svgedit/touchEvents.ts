import Hammer from 'hammerjs';

const calculateTouchCenter = (touches: TouchList) => {
  const center = { x: 0, y: 0 };
  if (touches.length > 0) {
    for (let i = 0; i < touches.length; i += 1) {
      center.x += touches[i].pageX;
      center.y += touches[i].pageY;
    }
    center.x /= touches.length;
    center.y /= touches.length;
  }
  return center;
};

const setupCanvasTouchEvents = (
  container: Element,
  workarea: Element,
  onMouseDown: (e: Event) => void,
  onMouseMove: (e: Event) => void,
  onMouseUp: (e: Event, blocked?: boolean) => void,
  onDoubleClick: (e: Event) => void,
  getZoom: () => number,
  setZoom: (zoom: number, staticPoint: { x: number, y: number }) => void,
): void => {
  let firstTouchID = null;
  let panStartPosition = null;
  let panStartScroll = { left: 0, top: 0 };
  let startZoom = null;
  let currentScale = 1;
  let lastMoveEventTimestamp = 0;
  let isDoubleTap = false;
  const mc = new Hammer.Manager(container as HTMLElement);

  container.addEventListener('touchstart', (e: TouchEvent) => {
    if (e.touches.length === 1) {
      firstTouchID = e.touches[0].identifier;
      onMouseDown(e);
    } else if (e.touches.length >= 2) {
      panStartPosition = calculateTouchCenter(e.touches);
      panStartScroll = {
        left: workarea.scrollLeft,
        top: workarea.scrollTop,
      };
      // @ts-expect-error scale is defined in chrome & safari
      if (e.scale === 1) {
        startZoom = getZoom();
        currentScale = 1;
      }
    }
  });

  container.addEventListener('touchmove', (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      if (e.touches[0].identifier === firstTouchID) {
        onMouseMove(e);
      }
    } else if (e.touches.length >= 2) {
      const center = calculateTouchCenter(e.touches);
      requestAnimationFrame(() => {
        // @ts-expect-error scale is defined in chrome & safari
        const { scale, timeStamp } = e;
        if (timeStamp < lastMoveEventTimestamp) return;
        if (startZoom && Math.abs(Math.log(currentScale / scale)) >= Math.log(1.05)) {
          const newZoom = startZoom * (scale ** 0.5);
          setZoom(newZoom, center);
          panStartPosition = center;
          panStartScroll = {
            left: workarea.scrollLeft,
            top: workarea.scrollTop,
          };
          currentScale = scale;
        }
        // eslint-disable-next-line no-param-reassign
        workarea.scrollLeft = panStartScroll.left + panStartPosition.x - center.x;
        // eslint-disable-next-line no-param-reassign
        workarea.scrollTop = panStartScroll.top + panStartPosition.y - center.y;
        lastMoveEventTimestamp = timeStamp;
      });
    }
  });

  container.addEventListener('touchend', (e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i += 1) {
      if (e.changedTouches[i].identifier === firstTouchID) {
        firstTouchID = null;
        onMouseUp(e, isDoubleTap);
        isDoubleTap = false;
      }
    }
    if (e.touches.length >= 2) {
      panStartPosition = calculateTouchCenter(e.touches);
      panStartScroll = {
        left: workarea.scrollLeft,
        top: workarea.scrollTop,
      };
    }
  });

  mc.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
  mc.on('doubletap', (e) => {
    isDoubleTap = true;
    onDoubleClick(e as unknown as Event);
  });
};

export default {
  setupCanvasTouchEvents,
};
