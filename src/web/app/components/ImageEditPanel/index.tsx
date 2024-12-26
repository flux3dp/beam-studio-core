/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-case-declarations */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-bitwise */
/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { Button, Flex, TabPaneProps, Tabs } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Layer, Line, Stage } from 'react-konva';
import Konva from 'konva';
import { Filter } from 'konva/lib/Node';
import classNames from 'classnames';

import { preprocessByUrl } from 'helpers/image-edit-panel/preprocess';
import calculateBase64 from 'helpers/image-edit-panel/calculate-base64';
import handleFinish from 'helpers/image-edit-panel/handle-finish';
import progressCaller from 'app/actions/progress-caller';
import ImageEditPanelIcons from 'app/icons/image-edit-panel/ImageEditPanelIcons';
import BackButton from 'app/widgets/FullWindowPanel/BackButton';
import Footer from 'app/widgets/FullWindowPanel/Footer';
import FullWindowPanel from 'app/widgets/FullWindowPanel/FullWindowPanel';
import Header from 'app/widgets/FullWindowPanel/Header';
import Sider from 'app/widgets/FullWindowPanel/Sider';
import useI18n from 'helpers/useI18n';

import useForceUpdate from 'helpers/use-force-update';
import Eraser from './Eraser';
import MagicWand from './MagicWand';
import KonvaImage, { KonvaImageRef } from './KonvaImage';
import styles from './index.module.scss';

interface Props {
  src: string;
  image: SVGImageElement;
  onClose: () => void;
}

interface Tab extends Omit<TabPaneProps, 'tab'> {
  key: string;
  label: React.ReactNode;
}

interface LineItem {
  points: number[];
  strokeWidth: number;
}

interface HistoryItem {
  lines: Array<LineItem>;
  filters: Array<Filter>;
}

interface HistoryState {
  items: Array<HistoryItem>;
  index: number;
  hasUndoBefore?: boolean;
}

const historyReducer = (
  state: HistoryState,
  { type, payload }: { type: 'PUSH' | 'UNDO' | 'REDO'; payload?: HistoryItem }
) => {
  switch (type) {
    case 'PUSH':
      const items = state.hasUndoBefore ? state.items.slice(0, state.index + 1) : state.items;

      return {
        ...state,
        items: items.concat(payload),
        index: state.index + 1,
        hasUndoBefore: false,
      };
    case 'UNDO':
      return state.index > 0 ? { ...state, index: state.index - 1, hasUndoBefore: true } : state;
    case 'REDO':
      return state.index < state.items.length - 1 ? { ...state, index: state.index + 1 } : state;
    default:
      return state;
  }
};

const ImageEditPanel = ({ src, image, onClose }: Props): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.photo_edit_panel;
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
  const [currentImage, setCurrentImage] = useState('');
  const [displayImage, setDisplayImage] = useState('');
  const [progress, setProgress] = useState(0);
  const [brushSize, setBrushSize] = useState(20);
  const [tolerance, setTolerance] = useState(40);
  const divRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const imageRef = useRef<KonvaImageRef>(null);
  const imageData = useRef<ImageData>(null);
  const isDrawing = useRef(false);
  const isAddingFilter = useRef(false);
  const [history, dispatchHistory] = useReducer(historyReducer, {
    items: [{ lines: [], filters: [] }],
    index: 0,
    hasUndoBefore: false,
  });

  const boundFunc = useCallback(
    (
      pos: { x: number; y: number },
      { width, height, scale }: Record<'width' | 'height' | 'scale', number>
    ) => {
      const x = Math.min(0, Math.max(pos.x, width * (1 - scale)));
      const y = Math.min(0, Math.max(pos.y, height * (1 - scale)));

      return { x, y };
    },
    []
  );

  const addHistory = useCallback(() => {
    dispatchHistory({ type: 'PUSH', payload: { lines: [...lines], filters: [...filters] } });
  }, [lines, filters]);

  const handleUndo = useCallback(() => {
    if (history.index === 0) {
      return;
    }

    const { lines: prevLines, filters: prevFilters } = history.items[history.index - 1] || {};

    dispatchHistory({ type: 'UNDO' });
    setLines(prevLines || []);
    setFilters(prevFilters || []);
  }, [history]);

  const handleRedo = useCallback(() => {
    if (history.index === history.items.length - 1) {
      return;
    }

    const { lines: nextLines, filters: nextFilters } = history.items[history.index + 1] || {};

    dispatchHistory({ type: 'REDO' });
    setLines(nextLines || []);
    setFilters(nextFilters || []);
  }, [history]);

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      const scale = stage.scaleX();
      const { x, y } = stage.getPointerPosition();
      const { x: stageX, y: stageY } = stage.position();
      const modifiedX = (x - stageX) / scale;
      const modifiedY = (y - stageY) / scale;

      if (mode === 'eraser') {
        isDrawing.current = true;

        setLines((prevLines) => [
          ...prevLines,
          {
            // insert two points to make a line at the beginning
            points: [modifiedX, modifiedY, modifiedX, modifiedY],
            strokeWidth: brushSize / scale,
          },
        ]);
      } else if (mode === 'magicWand') {
        const generateFilter = (x: number, y: number, imageData: ImageData) => {
          const getFilteredPoints = (x: number, y: number, imageData: ImageData) => {
            const points = Array.of<number>();
            const { width, height, data } = imageData;
            const idx = (y * width + x) * 4;
            const targetR = data[idx];
            const targetG = data[idx + 1];
            const targetB = data[idx + 2];
            // use squared tolerance to avoid square root
            const toleranceSquared = tolerance * tolerance;

            // create a crosshair for current position
            for (let i = 0; i < width * 4; i += 4) {
              points.push(y * width * 4 + i + 3);
            }

            for (let i = 0; i < height; i++) {
              points.push((i * width + x) * 4 + 3);
            }

            const bfs = (x: number, y: number) => {
              const queue = [y * width + x];
              // store 8 pixels in each Byte, to reduce memory usage
              const visited = new Uint8Array(Math.ceil((width * height) / 8));
              const isVisited = (pos: number) => (visited[pos >> 3] & (1 << pos % 8)) !== 0;
              const markVisited = (pos: number) => {
                visited[pos >> 3] |= 1 << pos % 8;
              };

              markVisited(y * width + x);

              while (queue.length) {
                const pos = queue.pop();
                const x = pos % width;
                const y = (pos / width) >> 0;
                const idx = pos * 4;
                const r = targetR - data[idx];
                const g = targetG - data[idx + 1];
                const b = targetB - data[idx + 2];
                const diffSquared = r * r + g * g + b * b;

                if (diffSquared > toleranceSquared) {
                  continue;
                }

                points.push(idx + 3);

                // old school if statement, for performance
                if (x > 0 && !isVisited(pos - 1)) {
                  markVisited(pos - 1);
                  queue.push(pos - 1);
                }
                if (x < width - 1 && !isVisited(pos + 1)) {
                  markVisited(pos + 1);
                  queue.push(pos + 1);
                }
                if (y > 0 && !isVisited(pos - width)) {
                  markVisited(pos - width);
                  queue.push(pos - width);
                }
                if (y < height - 1 && !isVisited(pos + width)) {
                  markVisited(pos + width);
                  queue.push(pos + width);
                }
              }
            };

            bfs(x, y);

            return points;
          };
          const points = getFilteredPoints(x, y, imageData);

          return ({ data }: ImageData) => {
            for (let i = 0; i < points.length; i++) {
              data[points[i]] = 0;
            }
          };
        };
        // for loop, both dimensions are integers
        const filter = generateFilter(modifiedX >> 0, modifiedY >> 0, imageData.current);

        isAddingFilter.current = true;

        setFilters(filters.concat(filter));
      }
    },
    [mode, brushSize, filters, tolerance]
  );

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) {
      return;
    }

    const stage = e.target.getStage();
    const scale = stage.scaleX();
    const { x, y } = stage.getPointerPosition();
    const { x: stageX, y: stageY } = stage.position();
    const modifiedX = (x - stageX) / scale;
    const modifiedY = (y - stageY) / scale;

    setLines((prevLines) => {
      const updatedLines = [...prevLines];
      const lastLine = { ...updatedLines[updatedLines.length - 1] };

      lastLine.points = lastLine.points.concat([modifiedX, modifiedY]);
      updatedLines[updatedLines.length - 1] = lastLine;

      return updatedLines;
    });
  }, []);

  const handleExitDrawing = useCallback(() => {
    if (isDrawing.current || isAddingFilter.current) {
      isDrawing.current = false;
      isAddingFilter.current = false;

      addHistory();
    }
  }, [addHistory]);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const scaleBy = 1.02;
      const stage = e.target.getStage();
      const oldScale = stage.scaleX(); // Assuming uniform scaling
      const pointerPosition = stage.getPointerPosition();
      const width = stage.width();
      const height = stage.height();

      if (!pointerPosition) {
        return;
      }

      const mousePointTo = {
        x: (pointerPosition.x - stage.x()) / oldScale,
        y: (pointerPosition.y - stage.y()) / oldScale,
      };

      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const x = -(mousePointTo.x - pointerPosition.x / newScale) * newScale;
      const y = -(mousePointTo.y - pointerPosition.y / newScale) * newScale;
      const pos = boundFunc({ x, y }, { width, height, scale: newScale });

      stage.scale({ x: newScale, y: newScale });
      stage.position(pos);
      stage.batchDraw();
    },
    [boundFunc]
  );

  const handleComplete = () => {
    progressCaller.openNonstopProgress({ id: 'image-editing', message: t.processing });
    setDisplayImage(currentImage);

    const stage = stageRef.current;

    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    stage.batchDraw();

    setProgress(1);
  };

  const updateUrl = useCallback(() => stageRef.current.toDataURL(imageSize), [imageSize]);

  // wait re-render of stage, then update current url
  useEffect(() => {
    const updateImages = async () => {
      const url = updateUrl();
      const display = await calculateBase64(url, isShading, threshold, isFullColor);

      handleFinish(image, url, display);
      progressCaller.popById('image-editing');
      onClose();
    };

    if (progress === 1 && imageRef.current?.isCached()) {
      requestAnimationFrame(updateImages);
    }
  }, [image, isFullColor, isShading, onClose, progress, threshold, updateUrl]);

  // update stage dimensions according parent div
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const image = imageRef.current;

    if (!image) {
      return;
    }

    if (progress === 0) {
      if (image.isCached()) {
        imageData.current = image
          ._getCachedSceneCanvas()
          .context._context.getImageData(0, 0, imageSize.width, imageSize.height);
      } else {
        // force re-render until image is cached
        forceUpdate();
      }
    }
    // depends useImageStatus to force re-render
  }, [progress, imageSize, forceUpdate, imageRef.current?.useImageStatus]);

  useEffect(() => {
    const initialize = async () => {
      progressCaller.openNonstopProgress({ id: 'image-editing-init', message: t.processing });

      const {
        blobUrl,
        originalWidth: width,
        originalHeight: height,
      } = await preprocessByUrl(src, { isFullResolution: true });
      const current = await calculateBase64(blobUrl, true, 255, true);
      const display = await calculateBase64(blobUrl, isShading, threshold, isFullColor);

      setImageSize({ width, height });
      setCurrentImage(current);
      setDisplayImage(display);

      progressCaller.popById('image-editing-init');
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabItems: Array<Tab> = [
    {
      key: 'eraser',
      label: 'Eraser',
      children: <Eraser brushSize={brushSize} setBrushSize={setBrushSize} />,
      icon: <ImageEditPanelIcons.Eraser />,
    },
    {
      key: 'magicWand',
      label: 'Magic Wand',
      children: <MagicWand tolerance={tolerance} setTolerance={setTolerance} />,
      icon: <ImageEditPanelIcons.MagicWand />,
    },
  ];
  const cursorRatio = () => {
    if (brushSize <= 10) {
      return 2;
    }
    if (brushSize <= 20) {
      return 1;
    }
    if (brushSize <= 80) {
      return 0.5;
    }
    return 0.1;
  };
  const cursorSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#1890FF" stroke-opacity="1" stroke-width="${cursorRatio()}" width="${
    brushSize / 2
  }" height="${brushSize / 2}" viewBox="0 0 10 10">
    <circle cx="5.02" cy="5.02" r="5"/>
  </svg>`;
  const encodedSvg = encodeURIComponent(cursorSvg).replace(/'/g, '%27').replace(/"/g, '%22');

  return (
    <FullWindowPanel
      onClose={onClose}
      mobileTitle="Image Edit Panel"
      renderMobileFixedContent={() => null}
      renderMobileContents={() => null}
      renderContents={() => (
        <>
          <Sider className={styles.sider}>
            <Flex style={{ height: '100%' }} vertical justify="space-between">
              <div>
                <BackButton onClose={onClose}>{lang.buttons.back_to_beam_studio}</BackButton>
                <Header icon={<ImageEditPanelIcons.EditImage />} title="Edit Image" />
                <Tabs
                  centered
                  size="large"
                  activeKey={mode}
                  items={tabItems}
                  onChange={(mode: 'eraser' | 'magicWand') => {
                    isDrawing.current = false;
                    isAddingFilter.current = false;

                    setMode(mode);
                  }}
                />
              </div>
              <Footer>
                <Button key="ok" type="primary" onClick={handleComplete}>
                  {t.okay}
                </Button>
              </Footer>
            </Flex>
          </Sider>
          <Flex vertical className={styles['w-100']}>
            <Flex
              justify="space-between"
              className={classNames(styles['w-100'], styles['top-bar'], styles.bdb)}
            >
              <div>
                <Button
                  className={styles['mr-8px']}
                  shape="round"
                  icon={<ArrowLeftOutlined />}
                  disabled={history.index === 0}
                  onClick={handleUndo}
                />
                <Button
                  shape="round"
                  icon={<ArrowRightOutlined />}
                  disabled={history.index === history.items.length - 1}
                  onClick={handleRedo}
                />
              </div>
              a
            </Flex>
            <div
              style={{
                cursor:
                  mode === 'eraser'
                    ? // eslint-disable-next-line max-len
                      `url('data:image/svg+xml;utf8,${encodedSvg}') ${brushSize / 4} ${
                        brushSize / 4
                      }, auto`
                    : `url('core-img/image-edit-panel/magic-wand.svg') 6 6, auto`,
              }}
              ref={divRef}
              className={styles.block}
            >
              <Stage
                ref={stageRef}
                pixelRatio={1}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseLeave={handleExitDrawing}
                onMouseup={handleExitDrawing}
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
          </Flex>
        </>
      )}
    />
  );
};

export default ImageEditPanel;
