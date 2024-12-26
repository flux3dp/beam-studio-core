/* eslint-disable react/no-unused-prop-types */
/* eslint-disable no-plusplus */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button, Flex, TabPaneProps, Tabs } from 'antd';
import BackButton from 'app/widgets/FullWindowPanel/BackButton';
import Footer from 'app/widgets/FullWindowPanel/Footer';
import FullWindowPanel from 'app/widgets/FullWindowPanel/FullWindowPanel';
import Header from 'app/widgets/FullWindowPanel/Header';
import Sider from 'app/widgets/FullWindowPanel/Sider';
import useI18n from 'helpers/useI18n';
import { preprocessByUrl } from 'helpers/image-edit-panel/preprocess';
import calculateBase64 from 'helpers/image-edit-panel/calculate-base64';
import ImageEditPanelIcons from 'app/icons/image-edit-panel/ImageEditPanelIcons';

import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { Image, Layer, Line, Stage } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';
import handleFinish from 'helpers/image-edit-panel/handle-finish';
import progressCaller from 'app/actions/progress-caller';
import { Filter } from 'konva/lib/Node';
import styles from './index.module.scss';
import Eraser from './Eraser';
import MagicWand from './MagicWand';

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

const historyList: Array<HistoryItem> = [{ lines: [], filters: [Konva.Filters.Invert] }];
let historyIndex = 0;

const ImageEditPanel = ({ src, image, onClose }: Props): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.photo_edit_panel;
  const { isShading, threshold, isFullColor } = useMemo(
    () => ({
      isShading: image.getAttribute('data-shading') === 'true',
      threshold: Number.parseInt(image.getAttribute('data-threshold'), 10),
      isFullColor: image.getAttribute('data-fullcolor') === '1',
    }),
    [image]
  );
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const divRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [tabKey, setTabKey] = useState('eraser');
  const [lines, setLines] = useState<Array<LineItem>>([]);
  const [filters, setFilters] = useState<Array<Filter>>([]);
  const [currentImage, setCurrentImage] = useState('');
  const [displayImage, setDisplayImage] = useState('');
  const [progress, setProgress] = useState(0);
  const [stageState, setStageState] = useState({ x: 0, y: 0, width: 0, height: 0, scale: 1 });
  const [brushSize, setBrushSize] = useState(20);
  const [hasUndoBefore, setHasUndoBefore] = useState(false);
  const isDrawing = useRef(false);

  const boundFunc = (pos: { x: number; y: number }, scale: number) => {
    const { width, height } = stageState;

    const x = Math.min(0, Math.max(pos.x, width * (1 - scale)));
    const y = Math.min(0, Math.max(pos.y, height * (1 - scale)));

    return { x, y };
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    isDrawing.current = true;

    const { x, y } = e.target.getStage().getPointerPosition();
    const modifiedX = (x - stageState.x) / stageState.scale;
    const modifiedY = (y - stageState.y) / stageState.scale;

    setLines(
      lines.concat({
        points: [modifiedX, modifiedY, modifiedX, modifiedY],
        strokeWidth: brushSize / stageState.scale,
      })
    );
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) {
      return;
    }

    const { x, y } = e.target.getStage().getPointerPosition();
    const lastLine = lines[lines.length - 1];
    const modifiedX = (x - stageState.x) / stageState.scale;
    const modifiedY = (y - stageState.y) / stageState.scale;

    // add point
    lastLine.points = lastLine.points.concat([modifiedX, modifiedY]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);

    setLines(lines.concat());
  };

  const handleExitDrawing = useCallback(() => {
    if (isDrawing.current) {
      isDrawing.current = false;

      if (hasUndoBefore) {
        historyList.splice(historyIndex + 1, historyList.length - 1);
        setHasUndoBefore(false);
      }

      historyList.push({ lines: [...lines], filters: [...filters] });
      historyIndex++;
    }
  }, [hasUndoBefore, lines, filters]);

  const updateUrl = useCallback(
    () => stageRef.current.toDataURL({ width: imageWidth, height: imageHeight }),
    [imageHeight, imageWidth]
  );

  // wait re-render of stage, then update current url
  useEffect(() => {
    const updateImages = async () => {
      const url = updateUrl();
      const display = await calculateBase64(url, isShading, threshold, isFullColor);

      // heheXD
      setTimeout(() => {
        handleFinish(image, url, display);
        progressCaller.popById('image-editing');
        onClose();
      }, 1);
    };

    if (progress === 1) {
      // trigger updateImages after nextTick
      setTimeout(() => {
        updateImages();
      }, 1);
    }
  }, [progress, updateUrl, isShading, threshold, isFullColor, image, onClose]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const scaleBy = 1.02;
    const stage = e.target.getStage();
    const { x: oldScale } = stage.scale();

    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const x = -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale;
    const y = -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale;
    const pos = boundFunc({ x, y }, newScale);

    setStageState({ ...stageState, scale: newScale, ...pos });
  };

  const handleComplete = () => {
    progressCaller.openNonstopProgress({ id: 'image-editing', message: t.processing });

    setStageState({ ...stageState, x: 0, y: 0, scale: 1 });
    setDisplayImage(currentImage);
    setProgress(1);
  };

  const handleUndo = () => {
    if (historyIndex === 0) {
      return;
    }

    const { lines: prevLines, filters: prevFilters } = historyList[historyIndex - 1];

    setLines(prevLines);
    setFilters(prevFilters);

    historyIndex--;
    setHasUndoBefore(true);
  };

  const handleRedo = () => {
    if (historyIndex === historyList.length - 1) {
      return;
    }

    const { lines: nextLines, filters: nextFilters } = historyList[++historyIndex];

    setLines(nextLines);
    setFilters(nextFilters);
  };

  // update stage dimensions according parent div
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      setStageState({
        ...stageState,
        width: divRef.current?.offsetWidth,
        height: divRef.current?.offsetHeight,
      });
      stageRef.current?.width(divRef.current?.offsetWidth);
      stageRef.current?.height(divRef.current?.offsetHeight);
    });

    observer.observe(divRef.current);

    return () => observer.disconnect();
  }, [stageState]);

  const items: Array<Tab> = [
    {
      key: 'eraser',
      label: 'Eraser',
      children: <Eraser brushSize={brushSize} setBrushSize={setBrushSize} />,
      icon: <ImageEditPanelIcons.Eraser />,
    },
    {
      key: 'magicWand',
      label: 'Magic Wand',
      children: <MagicWand />,
      icon: <ImageEditPanelIcons.MagicWand />,
    },
  ];

  const init = async () => {
    const { blobUrl, originalWidth, originalHeight } = await preprocessByUrl(src, {
      isFullResolution: true,
    });
    const current = await calculateBase64(blobUrl, true, 255, true);
    const display = await calculateBase64(blobUrl, isShading, threshold, isFullColor);

    setImageWidth(originalWidth);
    setImageHeight(originalHeight);
    setCurrentImage(current);
    setDisplayImage(display);
  };

  // add useCallback to prevent re-rendering
  const UrlImage = useCallback(({ src, filters }: { src: string; filters: Array<Filter> }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [imageInstance] = useImage(src);

    return <Image image={imageInstance} filters={filters} />;
  }, []);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                <Tabs centered size="large" activeKey={tabKey} items={items} onChange={setTabKey} />
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
                  disabled={historyIndex === 0}
                  onClick={handleUndo}
                />
                <Button
                  shape="round"
                  icon={<ArrowRightOutlined />}
                  disabled={historyIndex === historyList.length - 1}
                  onClick={handleRedo}
                />
              </div>
              a
            </Flex>
            <div
              style={{
                cursor:
                  tabKey === 'eraser'
                    ? // eslint-disable-next-line max-len
                      `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="black" stroke-opacity="1" stroke-width="${(() => {
                        if (brushSize <= 20) return 1;
                        if (brushSize <= 80) return 0.5;
                        return 0.1;
                      })()}px" width="${brushSize / 2}px" height="${
                        brushSize / 2
                      }px" viewBox="0 0 10.04 10.04"><circle cx="5.02" cy="5.02" r="4.52"/></svg>') ${
                        brushSize / 4
                      } ${brushSize / 4}, auto`
                    : undefined,
              }}
              ref={divRef}
              className={styles.block}
            >
              <Stage
                width={stageState.width}
                height={stageState.height}
                x={stageState.x}
                y={stageState.y}
                scale={{ x: stageState.scale, y: stageState.scale }}
                ref={stageRef}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseLeave={handleExitDrawing}
                onMouseup={handleExitDrawing}
              >
                <Layer>
                  <UrlImage src={displayImage} filters={filters} />
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
