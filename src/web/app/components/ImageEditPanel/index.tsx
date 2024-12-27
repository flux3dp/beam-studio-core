/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Flex } from 'antd';
import { Layer, Line, Stage } from 'react-konva';
import Konva from 'konva';
import { Filter } from 'konva/lib/Node';

import { preprocessByUrl } from 'helpers/image-edit-panel/preprocess';
import calculateBase64 from 'helpers/image-edit-panel/calculate-base64';
import handleFinish from 'helpers/image-edit-panel/handle-finish';
import useI18n from 'helpers/useI18n';
import shortcuts from 'helpers/shortcuts';

import progressCaller from 'app/actions/progress-caller';
import FullWindowPanel from 'app/widgets/FullWindowPanel/FullWindowPanel';

import useForceUpdate from 'helpers/use-force-update';
import KonvaImage, { KonvaImageRef } from './components/KonvaImage';
import Sider from './components/Sider';
import TopBar from './components/TopBar';

import { useKeyDown } from './hooks/useKeyDown';
import { useMouseDown } from './hooks/useMouseDown';
import { useHistory } from './hooks/useHistory';

import { getMagicWandFilter } from './utils/getMagicWandFilter';
import { generateCursorSvg } from './utils/generateCursorSvg';

import styles from './index.module.scss';

interface Props {
  src: string;
  image: SVGImageElement;
  onClose: () => void;
}

interface LineItem {
  points: number[];
  strokeWidth: number;
}

const EDITING = 0;
const EXPORTING = 1;

const IMAGE_PADDING = 30;

function ImageEditPanel({ src, image, onClose }: Props): JSX.Element {
  const {
    beambox: { photo_edit_panel: langPhoto },
    image_edit_panel: lang,
  } = useI18n();

  const { history, push, undo, redo } = useHistory({
    items: [{ lines: [], filters: [] }],
    index: 0,
    hasUndid: false,
  });
  const forceUpdate = useForceUpdate();

  const { isShading, threshold, isFullColor } = useMemo(
    () => ({
      isShading: image.getAttribute('data-shading') === 'true',
      threshold: Number.parseInt(image.getAttribute('data-threshold'), 10),
      isFullColor: image.getAttribute('data-fullcolor') === '1',
    }),
    [image]
  );
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [mode, setMode] = useState<'eraser' | 'magicWand'>('eraser');
  const [lines, setLines] = useState<Array<LineItem>>([]);
  const [filters, setFilters] = useState<Array<Filter>>([]);
  const [displayImage, setDisplayImage] = useState('');
  const [progress, setProgress] = useState(EDITING);
  const [brushSize, setBrushSize] = useState(20);
  const [tolerance, setTolerance] = useState(40);
  // only for display percentage, not for calculation
  const [zoomScale, setZoomScale] = useState(1);
  const [operation, setOperation] = useState<'eraser' | 'magicWand' | 'drag' | null>(null);
  const [fitScreenDimension, setFitScreenDimension] = useState({ x: 0, y: 0, scale: 1 });
  const divRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const imageRef = useRef<KonvaImageRef>(null);
  const imageData = useRef<ImageData>(null);

  useKeyDown({
    predicate: useCallback(({ key }) => key === ' ', []),
    keyDown: useCallback(() => setOperation('drag'), []),
    keyUp: useCallback(() => setOperation(null), []),
  });

  useMouseDown({
    predicate: useCallback(({ button }) => button === 1, []),
    keyDown: useCallback(() => {
      setOperation('drag');
      // start drag directly
      stageRef.current.startDrag();
    }, []),
    keyUp: useCallback(() => setOperation(null), []),
  });

  const cursorStyle = useMemo(() => {
    if (operation === 'drag') {
      return { cursor: 'grab' };
    }

    if (mode === 'eraser') {
      return {
        cursor: `url('data:image/svg+xml;utf8,${generateCursorSvg(brushSize)}') ${brushSize / 2} ${
          brushSize / 2
        }, auto`,
      };
    }

    return { cursor: `url('core-img/image-edit-panel/magic-wand.svg') 7 7, auto` };
  }, [operation, mode, brushSize]);

  const handlePushHistory = useCallback(() => push({ lines, filters }), [push, lines, filters]);
  const handleHistoryChange = useCallback(
    (action: 'undo' | 'redo') => () => {
      const { lines, filters } = action === 'undo' ? undo() : redo();

      setLines(lines);
      setFilters(filters);
      requestAnimationFrame(() => stageRef.current.batchDraw());
    },
    [undo, redo]
  );

  const getPointerPositionFromStage = useCallback((stage: Konva.Stage) => {
    const scale = stage.scaleX();
    const { x, y } = stage.getPointerPosition();
    const { x: stageX, y: stageY } = stage.position();

    return {
      x: (x - stageX) / scale,
      y: (y - stageY) / scale,
    };
  }, []);

  const handleMouseDown = useCallback(
    ({ target, evt }: Konva.KonvaEventObject<MouseEvent>) => {
      if (operation === 'drag' || evt.button !== 0) {
        return;
      }

      const stage = target.getStage();
      const scale = stage.scaleX();
      const { x, y } = getPointerPositionFromStage(stage);

      if (mode === 'eraser') {
        setOperation('eraser');
        setLines((prevLines) =>
          // add two sets of points to create a initial line
          prevLines.concat([{ points: [x, y, x, y], strokeWidth: brushSize / scale }])
        );
      } else if (mode === 'magicWand') {
        setOperation('magicWand');

        const filter = getMagicWandFilter(imageData.current, { x, y, tolerance });

        setFilters((prevFilters) => prevFilters.concat(filter));
      }
    },
    [getPointerPositionFromStage, operation, mode, brushSize, tolerance]
  );

  const handleMouseMove = useCallback(
    ({ target }: Konva.KonvaEventObject<MouseEvent>) => {
      if (operation !== 'eraser') {
        return;
      }

      const { x, y } = getPointerPositionFromStage(target.getStage());

      setLines((prevLines) => {
        const updatedLines = [...prevLines];
        const lastLine = { ...updatedLines[updatedLines.length - 1] };

        if (
          lastLine.points[lastLine.points.length - 2] === x &&
          lastLine.points[lastLine.points.length - 1] === y
        ) {
          return updatedLines;
        }

        lastLine.points = lastLine.points.concat([x, y]);
        updatedLines[updatedLines.length - 1] = lastLine;

        return updatedLines;
      });
    },
    [getPointerPositionFromStage, operation]
  );

  const handleExitDrawing = useCallback(() => {
    setOperation(null);

    if (operation === 'eraser' || operation === 'magicWand') {
      handlePushHistory();
    }
  }, [handlePushHistory, operation]);

  const handleMove = useCallback(
    ({ evt: { deltaX, deltaY } }: Konva.KonvaEventObject<WheelEvent>) => {
      const stage = stageRef.current;
      const { x, y } = stage.position();

      stage.position({ x: x - deltaX, y: y - deltaY });
      stage.batchDraw();
    },
    []
  );

  const handleZoom = useCallback((scale: number, isPointer = false) => {
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const targetPosition = isPointer
      ? stage.getPointerPosition()
      : { x: stage.width() / 2, y: stage.height() / 2 };

    if (!targetPosition) {
      return;
    }

    const mousePointTo = {
      x: (targetPosition.x - stage.x()) / oldScale,
      y: (targetPosition.y - stage.y()) / oldScale,
    };

    const boundedScale = Math.min(20, Math.max(0.01, scale));
    const x = -(mousePointTo.x - targetPosition.x / boundedScale) * boundedScale;
    const y = -(mousePointTo.y - targetPosition.y / boundedScale) * boundedScale;
    const pos = { x, y };

    setZoomScale(boundedScale);

    stage.scale({ x: boundedScale, y: boundedScale });
    stage.position(pos);
    stage.batchDraw();
  }, []);

  const handleZoomByScale = useCallback(
    (scaleBy: number, isPointer = false) => {
      const stage = stageRef.current;
      const scale = stage.scaleX();

      handleZoom(scale * scaleBy, isPointer);
    },
    [handleZoom]
  );

  const handleReset = useCallback(() => {
    const stage = stageRef.current;

    handleZoom(fitScreenDimension.scale);
    stage.position(fitScreenDimension);
  }, [fitScreenDimension, handleZoom]);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      if (e.evt.ctrlKey) {
        handleZoomByScale(e.evt.deltaY < 0 ? 1.02 : 0.98, true);
      } else {
        handleMove(e);
      }
    },
    [handleMove, handleZoomByScale]
  );

  const handleComplete = useCallback(() => {
    progressCaller.openNonstopProgress({ id: 'image-editing', message: langPhoto.processing });

    const stage = stageRef.current;

    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });

    // add a frame to wait for re-render, otherwise the image might be blank or not updated
    requestAnimationFrame(() => {
      stage.batchDraw();
      requestAnimationFrame(() => setProgress(EXPORTING));
    });
  }, [langPhoto]);

  const updateUrl = useCallback(() => stageRef.current.toDataURL(imageSize), [imageSize]);

  useEffect(() => {
    const updateImages = async () => {
      const url = updateUrl();
      const display = await calculateBase64(url, isShading, threshold, isFullColor);

      handleFinish(image, url, display);

      progressCaller.popById('image-editing');
      onClose();
    };

    if (progress === EXPORTING && imageRef.current?.isCached()) {
      updateImages();
    }
  }, [image, isFullColor, isShading, onClose, progress, threshold, updateUrl]);

  useEffect(() => {
    const image = imageRef.current;

    if (!image) {
      return;
    }

    if (progress === EDITING) {
      if (image.isCached()) {
        imageData.current = image
          ._getCachedSceneCanvas()
          .context._context.getImageData(0, 0, imageSize.width, imageSize.height);
      } else {
        // force re-render until image is cached
        requestAnimationFrame(forceUpdate);
      }
    }
    // depends useImageStatus to force re-render
  }, [progress, imageSize, imageRef.current?.useImageStatus, forceUpdate]);

  useEffect(() => {
    const initialize = async () => {
      const {
        blobUrl,
        originalWidth: width,
        originalHeight: height,
      } = await preprocessByUrl(src, { isFullResolution: true });
      const fullColorImage = await calculateBase64(blobUrl, true, 255, true);
      const initScale = Math.min(
        1,
        (divRef.current.clientWidth - IMAGE_PADDING * 2) / width,
        (divRef.current.clientHeight - IMAGE_PADDING * 2) / height
      );

      const imageX = Math.max(IMAGE_PADDING, (divRef.current.clientWidth - width * initScale) / 2);
      const imageY = Math.max(
        IMAGE_PADDING,
        (divRef.current.clientHeight - height * initScale) / 2
      );

      setFitScreenDimension({ x: imageX, y: imageY, scale: initScale });
      setZoomScale(initScale);

      stageRef.current.position({ x: imageX, y: imageY });
      stageRef.current.scale({ x: initScale, y: initScale });

      setImageSize({ width, height });
      setDisplayImage(fullColorImage);

      progressCaller.popById('image-editing-init');
    };

    progressCaller.openNonstopProgress({ id: 'image-editing-init', message: langPhoto.processing });

    setTimeout(initialize, 1000);

    // update stage dimensions according parent div
    const stage = stageRef.current;
    const observer = new ResizeObserver((elements) => {
      if (!stage) {
        return;
      }

      elements.forEach(({ contentRect: { width, height } }) => {
        stage.width(width);
        stage.height(height);
        stage.batchDraw();
      });
    });

    observer.observe(divRef.current);

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const subscribedShortcuts = [
      shortcuts.on(['Escape'], onClose, { isBlocking: true }),
      shortcuts.on(['Fnkey+z'], handleHistoryChange('undo'), { isBlocking: true }),
      shortcuts.on(['Shift+Fnkey+z'], handleHistoryChange('redo'), { isBlocking: true }),
      shortcuts.on(['Fnkey-+', 'Fnkey-='], () => handleZoomByScale(1.2), {
        isBlocking: true,
        splitKey: '-',
      }),
      shortcuts.on(['Fnkey+-'], () => handleZoomByScale(0.8), { isBlocking: true }),
    ];

    return () => {
      subscribedShortcuts.forEach((unsubscribe) => unsubscribe());
    };
  }, [handleHistoryChange, handleZoomByScale, onClose]);

  return (
    <FullWindowPanel
      onClose={onClose}
      mobileTitle={lang.title}
      renderMobileFixedContent={() => null}
      renderMobileContents={() => null}
      renderContents={() => (
        <>
          <Sider
            onClose={onClose}
            handleComplete={handleComplete}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            tolerance={tolerance}
            setTolerance={setTolerance}
            mode={mode}
            setMode={setMode}
            setOperation={setOperation}
          />
          <Flex vertical className={styles['w-100']}>
            <TopBar
              handleReset={handleReset}
              handleZoomByScale={handleZoomByScale}
              zoomScale={zoomScale}
              history={history}
              handleHistoryChange={handleHistoryChange}
            />
            <div className={styles['outer-container']}>
              <div style={cursorStyle} ref={divRef} className={styles.container}>
                <Stage
                  ref={stageRef}
                  pixelRatio={1}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMousemove={handleMouseMove}
                  onMouseLeave={handleExitDrawing}
                  onMouseup={handleExitDrawing}
                  draggable={operation === 'drag'}
                >
                  <Layer ref={layerRef} pixelRatio={1}>
                    <KonvaImage ref={imageRef} src={displayImage} filters={filters} />
                    {lines.map((line, i) => (
                      <Line
                        key={`line-${i}`}
                        points={line.points}
                        stroke="#df4b26"
                        strokeWidth={line.strokeWidth}
                        tension={0.5}
                        lineCap="round"
                        lineJoin="round"
                        globalCompositeOperation="destination-out"
                      />
                    ))}
                  </Layer>
                </Stage>
              </div>
            </div>
          </Flex>
        </>
      )}
    />
  );
}

const MemorizedImageEditPanel = memo(ImageEditPanel);

export default MemorizedImageEditPanel;
