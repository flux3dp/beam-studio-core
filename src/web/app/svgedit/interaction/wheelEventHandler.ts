const wheelEventHandlerGenerator = (
  getCurrentRatio: () => number,
  zoomFunction: (ratio: number, center: { x: number; y: number }) => void,
  opts?: { maxZoom?: number; minZoom?: number; zoomInterval?: number}
): (evt: WheelEvent) => void => {
  let targetRatio: number;
  let timer: NodeJS.Timeout | null = null;
  let trigger: number;

  const handler = (e: WheelEvent) => {
    // @ts-expect-error use wheelDelta if exists
    const { deltaY, wheelDelta, detail, ctrlKey } = e;
    const { maxZoom, minZoom, zoomInterval = 20 } = opts ?? {};

    const isMouse = Math.abs(deltaY) >= 40;

    const zoomProcess = () => {
      const currentRatio = getCurrentRatio();
      if (targetRatio === currentRatio) {
        clearTimeout(timer);
        timer = null;
        return;
      }
      // let nextRatio = currentRatio + (targetRatio - currentRatio) / 5;
      // if (Math.abs(targetRatio - currentRatio) < 0.005) nextRatio = targetRatio;
      const center = { x: e.pageX, y: e.pageY };
      trigger = Date.now();
      zoomFunction(targetRatio, center);
    };

    const zoom = () => {
      const delta = wheelDelta ?? -detail ?? 0;
      targetRatio = getCurrentRatio()
      if (maxZoom && targetRatio >= maxZoom && delta > 0) return;
      if (minZoom && targetRatio <= minZoom && delta < 0) return;
      targetRatio *= 1.02 ** (delta / (isMouse ? 50 : 100));
      if (maxZoom) targetRatio = Math.min(targetRatio, maxZoom);
      if (minZoom) targetRatio = Math.max(targetRatio, minZoom);

      if (Date.now() - trigger < zoomInterval) {
        clearTimeout(timer);
        timer = setTimeout(zoomProcess, zoomInterval);
      } else zoomProcess();
    };

    if (isMouse) {
      // mouse
      e.preventDefault();
      e.stopPropagation();
    } else if (!ctrlKey) return;

    if (Math.abs(deltaY) >= 40) {
      // mouse
      e.preventDefault();
      e.stopPropagation();
    } else if (!ctrlKey) return;
    zoom();
  };

  return handler;
};

export default wheelEventHandlerGenerator;
