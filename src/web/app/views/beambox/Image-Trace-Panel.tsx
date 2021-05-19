/* eslint-disable react/sort-comp */
/* eslint-disable no-console */
import React from 'react';

import i18n from 'helpers/i18n';
import BeamboxActions from 'app/actions/beambox';
import BeamboxStore from 'app/stores/beambox-store';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import ImageData from 'helpers/image-data';
import Modal from 'app/widgets/Modal';
import PreviewModeBackgroundDrawer from 'app/actions/beambox/preview-mode-background-drawer';
import requirejsHelper from 'helpers/requirejs-helper';
import SliderControl from 'app/widgets/Slider-Control';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
let svgedit;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgedit = globalSVG.Edit;
});

const Cropper = requireNode('cropperjs');
const LANG = i18n.lang.beambox.image_trace_panel;

const TESTING_IT = false;

// View render the following steps
const STEP_NONE = Symbol('STEP_NONE');
const STEP_OPEN = Symbol('STEP_OPEN');
const STEP_CROP = Symbol('STEP_CROP');
const STEP_TUNE = Symbol('STEP_TUNE');
const STEP_APPLY = Symbol('STEP_APPLY');

let cropper = null;
let grayscaleCroppedImg = null;

const TestImg = 'img/hehe.png';

const PANEL_PADDING = 100;
let maxAllowableWidth: number;
let maxAllowableHieght: number;

interface State {
  currentStep: symbol;
  croppedBlobUrl: string;
  croppedCameraCanvasBlobUrl: string;
  imageTrace: string;
  cropData: {
    x: number,
    y: number,
    width: number,
    height: number
  };
  preCrop: {
    offsetX: number;
    offsetY: number;
  };
  threshold: number;
}

class ImageTracePanel extends React.Component<Record<string, never>, State> {
  constructor(props: Record<string, never>) {
    super(props);

    this.state = {
      currentStep: STEP_NONE,
      croppedBlobUrl: '',
      croppedCameraCanvasBlobUrl: '',
      imageTrace: '',
      cropData: {
        x: 0, y: 0, width: 0, height: 0,
      },
      preCrop: { offsetX: 0, offsetY: 0 },
      threshold: 128,
    };
    maxAllowableWidth = window.innerWidth - 2 * PANEL_PADDING;
    maxAllowableHieght = window.innerHeight - 2 * PANEL_PADDING;
  }

  componentDidMount(): void {
    BeamboxStore.onCropperShown(() => this.openCropper());

    if (TESTING_IT) {
      console.log('dev ! testing it-panel');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      const img = new Image();
      img.src = TestImg;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          const croppedBlobUrl = URL.createObjectURL(blob);

          this.setState({ croppedBlobUrl });
          ImageData(
            croppedBlobUrl,
            {
              height: 0,
              width: 0,
              grayscale: {
                is_binary: true,
                is_rgba: true,
                is_shading: false,
                threshold: 128,
                is_svg: false,
              },
              onComplete: (result) => {
                grayscaleCroppedImg = result.pngBase64;
                this.setState({ currentStep: STEP_TUNE });
              },
            },
          );
        });
      };
    }
  }

  componentWillUnmount(): void {
    BeamboxStore.removeCropperShownListener(() => this.openCropper());
  }

  openCropper(): void {
    const { currentStep } = this.state;
    if (currentStep === STEP_NONE) {
      this.next();
    }
  }

  next(): void {
    const { currentStep } = this.state;

    switch (currentStep) {
      case STEP_NONE:
        this.setState({ currentStep: STEP_OPEN });
        break;
      case STEP_OPEN:
        this.setState({ currentStep: STEP_CROP });
        break;
      case STEP_CROP:
        this.setState({ currentStep: STEP_APPLY });
        this.destroyCropper();
        break;
      case STEP_TUNE:
        this.setState({ currentStep: STEP_APPLY });
        break;
      case STEP_APPLY:
        this.setState({ currentStep: STEP_NONE });
        break;
      default:
        break;
    }
  }

  prev(): void {
    const { currentStep } = this.state;

    switch (currentStep) {
      case STEP_CROP:
        this.setState({ currentStep: STEP_NONE });
        break;
      case STEP_TUNE:
        this.setState({ currentStep: STEP_CROP });
        break;
      case STEP_APPLY:
        this.setState({ currentStep: STEP_CROP });
        break;
      default:
        break;
    }
  }

  backToCropper(): void {
    const { croppedBlobUrl } = this.state;

    this.prev();
    URL.revokeObjectURL(croppedBlobUrl);
    this.setState({
      threshold: 128,
    });
  }

  backToTune(): void {
    this.prev();
    this.setState({ imageTrace: '' });
  }

  async calculateImageTrace(): Promise<void> {
    const { currentStep } = this.state;
    if (currentStep === STEP_TUNE) {
      this.next();
    }
  }

  handleCropping(): void {
    const cropData = cropper.getData();
    const croppedCanvas = cropper.getCroppedCanvas();

    croppedCanvas.toBlob((blob) => {
      const croppedBlobUrl = URL.createObjectURL(blob);

      this.setState({ cropData, croppedBlobUrl });

      ImageData(
        croppedBlobUrl,
        {
          height: 0,
          width: 0,
          grayscale: {
            is_rgba: true,
            is_shading: false,
            threshold: 128,
            is_svg: false,
          },
          onComplete: (result) => {
            if (grayscaleCroppedImg) {
              URL.revokeObjectURL(grayscaleCroppedImg);
            }
            grayscaleCroppedImg = result.pngBase64;
            this.next();
          },
        },
      );
    });
  }

  handleCropperCancel(): void {
    this.destroyCropper();
    this.prev();
    BeamboxActions.endImageTrace();
  }

  handleParameterChange(id: string, value: string|number): void {
    if (id === 'threshold') {
      const { croppedBlobUrl } = this.state;
      ImageData(
        croppedBlobUrl,
        {
          height: 0,
          width: 0,
          grayscale: {
            is_rgba: true,
            is_shading: false,
            threshold: parseInt(value as string, 10),
            is_svg: false,
          },
          onComplete: (result) => {
            if (grayscaleCroppedImg) {
              URL.revokeObjectURL(grayscaleCroppedImg);
            }
            grayscaleCroppedImg = result.pngBase64;
            this.setState({ threshold: value as number });
          },
        },
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  destroyCropper(): void {
    if (cropper) {
      cropper.destroy();
    }
  }

  handleImageTraceCancel(): void {
    const {
      croppedBlobUrl,
      croppedCameraCanvasBlobUrl,
    } = this.state;

    URL.revokeObjectURL(croppedBlobUrl);
    if (croppedCameraCanvasBlobUrl !== '') {
      URL.revokeObjectURL(croppedCameraCanvasBlobUrl);
    }
    this.setState({
      currentStep: STEP_NONE,
      croppedBlobUrl: '',
      croppedCameraCanvasBlobUrl: '',
      imageTrace: '',
      threshold: 128,
    });
    BeamboxActions.endImageTrace();
  }

  handleImageTraceComplete(): void {
    this.next();
  }

  async pushImageTrace(): Promise<void> {
    const {
      cropData,
      preCrop,
      threshold,
      croppedBlobUrl,
      croppedCameraCanvasBlobUrl,
    } = this.state;
    const tunedImage = document.getElementById('tunedImage') as HTMLImageElement;

    if (TESTING_IT) {
      const testingCropData = {
        x: tunedImage.x,
        y: tunedImage.y,
        width: 1150,
        height: 918,
      };
      const testingPreCrop = {
        offsetX: 100,
        offsetY: 100,
      };

      FnWrapper.insertImage(croppedBlobUrl, testingCropData, testingPreCrop, 1, threshold, true);
    } else {
      FnWrapper.insertImage(croppedBlobUrl, cropData, preCrop, 1, threshold, true);
      await this.traceImageAndAppend(grayscaleCroppedImg, cropData, preCrop);
    }

    URL.revokeObjectURL(grayscaleCroppedImg);
    if (croppedCameraCanvasBlobUrl !== '') {
      URL.revokeObjectURL(croppedCameraCanvasBlobUrl);
    }
    this.setState({
      currentStep: STEP_NONE,
      croppedBlobUrl: '',
      croppedCameraCanvasBlobUrl: '',
      imageTrace: '',
      threshold: 128,
    });
    BeamboxActions.endImageTrace();
  }

  // eslint-disable-next-line class-methods-use-this
  async traceImageAndAppend(
    imgUrl: string,
    cropData: { x: number, y: number, width: number, height: number },
    preCrop: { offsetX: number, offsetY: number },
  ): Promise<boolean> {
    const ImageTracer = await requirejsHelper('imagetracer');
    return new Promise((resolve) => {
      ImageTracer.imageToSVG(imgUrl, (svgstr) => {
        const gId = svgCanvas.getNextId();
        const batchCmd = new svgedit.history.BatchCommand('Add Image Trace');
        const g = svgCanvas.addSvgElementFromJson({
          element: 'g',
          attr: {
            id: gId,
          },
        }) as SVGGElement;
        const path = svgCanvas.addSvgElementFromJson({
          element: 'path',
          attr: {
            id: svgCanvas.getNextId(),
            fill: '#000000',
            'stroke-width': 1,
            'vector-effect': 'non-scaling-stroke',
          },
        }) as SVGPathElement;
        path.addEventListener('mouseover', svgCanvas.handleGenerateSensorArea);
        path.addEventListener('mouseleave', svgCanvas.handleGenerateSensorArea);
        batchCmd.addSubCommand(new svgedit.history.InsertElementCommand(path));
        svgCanvas.selectOnly([g]);
        ImageTracer.appendSVGString(svgstr.replace(/<\/?svg[^>]*>/g, ''), gId);
        const gBBox = g.getBBox();
        if (cropData.width !== gBBox.width) {
          svgCanvas.setSvgElemSize('width', cropData.width);
        }
        if (cropData.height !== gBBox.height) {
          svgCanvas.setSvgElemSize('height', cropData.height);
        }
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
        svgCanvas.moveElements(
          [cropData.x + preCrop.offsetX],
          [cropData.y + preCrop.offsetY],
          [path],
          false,
        );
        svgCanvas.selectOnly([path], true);
        svgCanvas.undoMgr.addCommandToHistory(batchCmd);
        resolve(true);
      });
    });
  }

  renderImageToCrop(): JSX.Element {
    return (
      <img
        id="previewForCropper"
        onLoad={this.renderCropper}
        src={PreviewModeBackgroundDrawer.getCameraCanvasUrl()}
      />
    );
  }

  renderCropper(): void {
    const imageObj = document.getElementById('previewForCropper') as HTMLImageElement;
    const coordinates = PreviewModeBackgroundDrawer.getCoordinates();
    const sourceWidth = coordinates.maxX - coordinates.minX;
    const sourceHeight = coordinates.maxY - coordinates.minY;
    const ratio = Math.min(maxAllowableHieght / sourceHeight, maxAllowableWidth / sourceWidth);
    const destWidth = sourceWidth * ratio;
    const destHeight = sourceHeight * ratio;

    this.setState({
      preCrop: {
        offsetX: coordinates.minX,
        offsetY: coordinates.minY,
      },
    });
    cropper = new Cropper(
      imageObj,
      {
        zoomable: false,
        viewMode: 0,
        targetWidth: destWidth,
        targetHeight: destHeight,
      },
    );
  }

  renderCropperModal(): JSX.Element {
    const coordinates = PreviewModeBackgroundDrawer.getCoordinates();
    const sourceWidth = coordinates.maxX - coordinates.minX;
    const sourceHeight = coordinates.maxY - coordinates.minY;
    const containerStyle = (sourceWidth / maxAllowableWidth > sourceHeight / maxAllowableHieght)
      ? { width: `${maxAllowableWidth}px` } : { height: `${maxAllowableHieght}px` };
    const { croppedCameraCanvasBlobUrl } = this.state;

    return (
      <Modal>
        <div className="cropper-panel">
          <div className="main-content" style={{ width: maxAllowableWidth, height: maxAllowableHieght }}>
            <img
              id="previewForCropper"
              onLoad={this.renderCropper}
              src={croppedCameraCanvasBlobUrl}
              style={containerStyle}
            />
          </div>
          <div className="footer">
            <button
              type="button"
              className="btn btn-default pull-right"
              onClick={this.handleCropperCancel}
            >
              {LANG.cancel}
            </button>
            <button
              type="button"
              className="btn btn-default pull-right primary"
              onClick={this.handleCropping}
            >
              {LANG.next}
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  getImageTraceDom(): JSX.Element {
    const { imageTrace } = this.state;
    if (imageTrace === null) {
      return null;
    }

    const {
      x,
      y,
      width: w,
      height: h,
    } = document.getElementById('tunedImage') as HTMLImageElement;

    return (
      <img
        id="imageTrace"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${w}px`,
          height: `${h}px`,
        }}
        src={`data:image/svg+xml; utf8, ${encodeURIComponent(imageTrace)}`}
      />
    );
  }

  cropCameraCanvas(): void {
    const imageObj = document.getElementById('cameraCanvas') as HTMLCanvasElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const coordinates = PreviewModeBackgroundDrawer.getCoordinates();
    const sourceX = coordinates.minX;
    const sourceY = coordinates.minY;
    const sourceWidth = (coordinates.maxX - coordinates.minX) + 465.17;
    const sourceHeight = (coordinates.maxY - coordinates.minY) + 465.17;
    const destX = 0;
    const destY = 0;
    const { croppedCameraCanvasBlobUrl, currentStep } = this.state;

    canvas.width = sourceWidth;
    canvas.height = sourceHeight;

    context.drawImage(
      imageObj,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      destX,
      destY,
      sourceWidth,
      sourceHeight,
    );
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);

      if (croppedCameraCanvasBlobUrl !== '') {
        URL.revokeObjectURL(croppedCameraCanvasBlobUrl);
      }

      this.setState({ croppedCameraCanvasBlobUrl: url });

      if (currentStep === STEP_OPEN) {
        this.next();
      }
    });
  }

  renderImageTraceModal(): JSX.Element {
    const {
      threshold,
      currentStep,
      imageTrace,
      cropData,
    } = this.state;
    const footer = this.renderImageTraceFooter();
    const it = ((currentStep === STEP_APPLY) && (imageTrace !== '')) ? this.getImageTraceDom() : null;
    let containerStyle: { width?: string, height?: string };

    if (TESTING_IT) {
      containerStyle = { width: `${maxAllowableWidth}px` };
    } else {
      const containerMaxWidth = maxAllowableWidth - 330;
      const containerMaxHeight = maxAllowableHieght - 40;
      containerStyle = (cropData.width / containerMaxWidth > cropData.height / containerMaxHeight)
        ? { width: `${containerMaxWidth}px` } : { height: `${containerMaxHeight}px` };
    }

    return (
      <Modal>
        <div className="image-trace-panel">
          <div className="main-content">
            <div className="cropped-container" style={containerStyle}>
              <img id="tunedImage" src={grayscaleCroppedImg} />
              {it}
            </div>
            <div className="right-part">
              <div className="scroll-bar-container">
                <div className="title">{LANG.tuning}</div>
                <SliderControl
                  id="threshold"
                  label={LANG.threshold}
                  min={0}
                  max={255}
                  step={1}
                  default={Math.floor(threshold)}
                  onChange={(id, val) => this.handleParameterChange(id, val)}
                />
              </div>
            </div>
          </div>
          {footer}
        </div>
      </Modal>
    );
  }

  renderImageTraceFooter(): JSX.Element {
    const { currentStep } = this.state;
    if (currentStep === STEP_TUNE) {
      return (
        <div className="footer">
          <button
            type="button"
            className="btn btn-default pull-right"
            onClick={this.handleImageTraceCancel}
          >
            {LANG.cancel}
          </button>
          <button
            type="button"
            className="btn btn-default pull-right"
            onClick={this.backToCropper}
          >
            {LANG.back}
          </button>
          <button
            type="button"
            className="btn btn-default pull-right primary"
            onClick={this.calculateImageTrace}
          >
            {LANG.apply}
          </button>
        </div>
      );
    }
    return (
      <div className="footer">
        <button
          type="button"
          className="btn btn-default pull-right"
          onClick={this.handleImageTraceCancel}
        >
          {LANG.cancel}
        </button>
        <button
          type="button"
          className="btn btn-default pull-right"
          onClick={this.prev}
        >
          {LANG.back}
        </button>
        <button
          type="button"
          className="btn btn-default pull-right primary"
          onClick={this.pushImageTrace}
        >
          {LANG.okay}
        </button>
      </div>
    );
  }

  renderContent(): JSX.Element {
    const { currentStep } = this.state;
    switch (currentStep) {
      case STEP_OPEN:
        return (
          <img
            id="cameraCanvas"
            onLoad={() => this.cropCameraCanvas()}
            src={PreviewModeBackgroundDrawer.getCameraCanvasUrl() || ''}
          />
        );
      case STEP_CROP:
        return this.renderCropperModal();
      case STEP_TUNE:
        return this.renderImageTraceModal();
      case STEP_APPLY:
        return this.renderImageTraceModal();
      default:
        return null;
    }
  }

  render(): JSX.Element {
    return (
      <div id="image-trace-panel-outer">
        {this.renderContent()}
      </div>
    );
  }
}

export default ImageTracePanel;
