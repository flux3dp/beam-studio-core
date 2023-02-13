import Cropper from 'cropperjs';
import React, { useEffect, useState } from 'react';
import { Button, Modal, Slider } from 'antd';

import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import history from 'app/svgedit/history';
import ImageData from 'helpers/image-data';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import i18n from 'helpers/i18n';
import PreviewModeBackgroundDrawer from 'app/actions/beambox/preview-mode-background-drawer';
import requirejsHelper from 'helpers/requirejs-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { moveElements } from 'app/svgedit/operations/move';

import styles from './StepTune.module.scss';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const LANG = i18n.lang.beambox.image_trace_panel;

const traceAndImportPath = async (
  imgBase64: string,
  dimension: { x: number; y: number; width: number; height: number }
): Promise<boolean> => {
  const ImageTracer = await requirejsHelper('imagetracer');
  const { x, y, width, height } = dimension;
  return new Promise((resolve) => {
    ImageTracer.imageToSVG(imgBase64, (svgstr) => {
      const gId = svgCanvas.getNextId();
      const batchCmd = new history.BatchCommand('Add Image Trace');
      const g = svgCanvas.addSvgElementFromJson<SVGGElement>({ element: 'g', attr: { id: gId } });
      const path = svgCanvas.addSvgElementFromJson<SVGPathElement>({
        element: 'path',
        attr: {
          id: svgCanvas.getNextId(),
          fill: '#000000',
          'stroke-width': 1,
          'vector-effect': 'non-scaling-stroke',
        },
      });
      path.addEventListener('mouseover', svgCanvas.handleGenerateSensorArea);
      path.addEventListener('mouseleave', svgCanvas.handleGenerateSensorArea);
      batchCmd.addSubCommand(new history.InsertElementCommand(path));
      svgCanvas.selectOnly([g]);
      ImageTracer.appendSVGString(svgstr.replace(/<\/?svg[^>]*>/g, ''), gId);
      const gBBox = g.getBBox();
      if (width !== gBBox.width) svgCanvas.setSvgElemSize('width', width);
      if (height !== gBBox.height) svgCanvas.setSvgElemSize('height', height);
      let d = '';
      for (let i = 0; i < g.childNodes.length; i += 1) {
        const child = g.childNodes[i] as Element;
        if (child.getAttribute('opacity') !== '0') {
          d += child.getAttribute('d');
        }
        child.remove();
        i -= 1;
      }
      g.remove();
      path.setAttribute('d', d);
      moveElements([x], [y], [path], false);
      svgCanvas.selectOnly([path], true);
      svgCanvas.undoMgr.addCommandToHistory(batchCmd);
      resolve(true);
    });
  });
};

interface Props {
  imageUrl: string;
  cropData: Cropper.Data;
  onGoBack: () => void;
  onClose: () => void;
}

const MODAL_PADDING_X = 80;
const MODAL_PADDING_Y = 210;

function StepTune({ imageUrl, cropData, onGoBack, onClose }: Props): JSX.Element {
  const [threshold, setThreshold] = useState(128);
  const [previewImgBase64, setPreviewImgBase64] = useState('');

  const generatePreviewImgUrl = (val: number) => {
    ImageData(imageUrl, {
      width: 0,
      height: 0,
      grayscale: {
        is_rgba: true,
        is_shading: false,
        threshold: val,
        is_svg: false,
      },
      onComplete: (result) => setPreviewImgBase64(result.pngBase64),
    });
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => generatePreviewImgUrl(threshold), []);

  const handleOk = async () => {
    const { minX, minY } = PreviewModeBackgroundDrawer.getCoordinates();
    const dimension = {
      x: cropData.x + minX,
      y: cropData.y + minY,
      width: cropData.width,
      height: cropData.height,
    };
    await traceAndImportPath(previewImgBase64, dimension);
    FnWrapper.insertImage(imageUrl, dimension, threshold);
    onClose();
  };
  const { width, height } = cropData;
  const maxWidth = window.innerWidth - MODAL_PADDING_X;
  const maxHieght = window.innerHeight - MODAL_PADDING_Y;
  const isWideImage = width / maxWidth > height / maxHieght;

  const renderFooter = () => (
    <>
      <Button onClick={onClose}>{LANG.cancel}</Button>
      <Button onClick={onGoBack}>{LANG.back}</Button>
      <Button type="primary" onClick={handleOk}>{LANG.next}</Button>
    </>
  );

  return (
    <Modal
      centered
      open
      closable={false}
      maskClosable={false}
      width={isWideImage ? maxWidth : undefined}
      footer={renderFooter()}
    >
      <div>
        <img
          id="tunedImage"
          src={previewImgBase64}
          style={isWideImage ? { width: `${maxWidth}px` } : { height: `${maxHieght}px` }}
        />
      </div>
      <div>
        <div className={styles.title}>{LANG.tuning}</div>
        <div>
          <h5 className={styles.subtitle}>{LANG.threshold}</h5>
          <Slider
            id="threshold"
            min={0}
            max={255}
            step={1}
            value={threshold}
            onChange={(val: number) => setThreshold(val)}
            onAfterChange={(val: number) => generatePreviewImgUrl(val)}
          />
        </div>
      </div>
    </Modal>
  );
}

export default StepTune;
