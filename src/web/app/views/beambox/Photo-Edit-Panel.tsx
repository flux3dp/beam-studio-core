import * as React from 'react';
import classNames from 'classnames';
import Cropper from 'cropperjs';

import ButtonGroup from 'app/widgets/ButtonGroup';
import Constants from 'app/actions/beambox/constant';
import CurveControl from 'app/widgets/Curve-Control';
import history from 'app/svgedit/history';
import i18n from 'helpers/i18n';
import ImageData from 'helpers/image-data';
import jimpHelper from 'helpers/jimp-helper';
import {
  Button, Col, Modal, Row,
} from 'antd';
import OpenCVWebSocket from 'helpers/api/open-cv';
import Progress from 'app/actions/progress-caller';
import SliderControl from 'app/widgets/Slider-Control';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IButton } from 'interfaces/IButton';
import { IImageDataResult } from 'interfaces/IImage';
import imageProcessor from 'implementations/imageProcessor';

const { $ } = window;
let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const opencvWS = new OpenCVWebSocket();
let LANG = i18n.lang.beambox.photo_edit_panel;
const updateLang = () => {
  LANG = i18n.lang.beambox.photo_edit_panel;
};

export type PhotoEditMode = 'sharpen' | 'crop' | 'curve';

interface Props {
  element: HTMLElement,
  src: string,
  mode: PhotoEditMode,
  unmount: () => void,
}

interface State {
  origWidth?: number;
  origHeight?: number;
  imageWidth?: number;
  imageHeight?: number;
  origSrc: string;
  previewSrc: string;
  displaySrc: string;
  sharpness: number;
  sharpRadius: number;
  srcHistory: string[],
  isCropping: boolean;
  threshold: string;
  shading: boolean;
  displayBase64: string,
  isImageDataGenerated: boolean;
  isShowingOriginal: boolean;
}

interface Dimension {
  x: number,
  y: number,
  w: number,
  h: number,
}

class PhotoEditPanel extends React.Component<Props, State> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cropper: any;

  private compareBase64: string;

  private curvefunction: (n: number) => number;

  private cropDimensionHistory: Dimension[];

  private currentCropDimension: Dimension;

  constructor(props: Props) {
    super(props);
    updateLang();
    const { element, src } = this.props;
    this.cropper = null;
    this.cropDimensionHistory = [];
    this.state = {
      origSrc: src,
      previewSrc: src,
      displaySrc: src,
      sharpness: 0,
      sharpRadius: 1,
      srcHistory: [],
      isCropping: false,
      threshold: $(element).attr('data-threshold'),
      shading: (element.getAttribute('data-shading') === 'true'),
      displayBase64: null,
      isImageDataGenerated: false,
      isShowingOriginal: false,
    };
  }

  componentDidMount(): void {
    const { mode, unmount } = this.props;
    if (!['sharpen', 'crop', 'curve'].includes(mode)) {
      unmount();
      return;
    }
    this.handlePreprocess();
  }

  componentDidUpdate(): void {
    const { isImageDataGenerated } = this.state;
    if (!isImageDataGenerated) {
      this.generateImageData();
    }
  }

  async handlePreprocess(): Promise<void> {
    const setCompareBase64 = async (imgUrl: string) => {
      const result = await this.calculateImageData(imgUrl);
      this.compareBase64 = result.pngBase64;
    };

    Progress.openNonstopProgress({
      id: 'photo-edit-processing',
      message: LANG.processing,
    });
    const { mode } = this.props;
    const { origSrc } = this.state;
    let imgBlobUrl = origSrc;
    try {
      const image = await jimpHelper.urlToImage(imgBlobUrl);
      const { width: origWidth, height: origHeight } = image.bitmap;
      if (Math.max(origWidth, origHeight) > 600) {
        // eslint-disable-next-line no-console
        console.log('Down Sampling');
        if (origWidth >= origHeight) {
          image.resize(600, imageProcessor.AUTO);
        } else {
          image.resize(imageProcessor.AUTO, 600);
        }
        imgBlobUrl = await jimpHelper.imageToUrl(image);
      }
      if (['sharpen', 'curve'].includes(mode)) {
        setCompareBase64(imgBlobUrl);
      } else if (mode === 'crop') {
        this.currentCropDimension = {
          x: 0,
          y: 0,
          w: image.bitmap.width,
          h: image.bitmap.height,
        };
      }
      this.setState({
        origWidth,
        origHeight,
        imageWidth: image.bitmap.width,
        imageHeight: image.bitmap.height,
        previewSrc: imgBlobUrl,
        displaySrc: imgBlobUrl,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    } finally {
      Progress.popById('photo-edit-processing');
    }
  }

  handleCancel(): void {
    const { displaySrc, srcHistory } = this.state;
    const { unmount } = this.props;
    let src = displaySrc;
    while (srcHistory.length > 0) {
      URL.revokeObjectURL(src);
      src = srcHistory.pop();
    }
    unmount();
  }

  async handleComplete(): Promise<void> {
    const clearHistory = () => {
      const { srcHistory, previewSrc, origSrc } = this.state;
      let src = '';
      while (srcHistory.length > 0) {
        URL.revokeObjectURL(src);
        src = srcHistory.pop();
      }
      if (previewSrc !== origSrc) {
        URL.revokeObjectURL(previewSrc);
      }
    };

    Progress.openNonstopProgress({
      id: 'photo-edit-processing',
      message: LANG.processing,
    });
    const { displaySrc, origWidth, origHeight } = this.state;
    const { element, mode, unmount } = this.props;
    const batchCmd = new history.BatchCommand('Photo edit');

    const handleSetAttribute = (attr: string, value) => {
      svgCanvas.undoMgr.beginUndoableChange(attr, [element]);
      element.setAttribute(attr, value);
      const cmd = svgCanvas.undoMgr.finishUndoableChange();
      if (!cmd.isEmpty()) {
        batchCmd.addSubCommand(cmd);
      }
    };

    handleSetAttribute('origImage', displaySrc);
    if (mode === 'crop') {
      const { w, h } = this.currentCropDimension;
      if (origWidth !== w) {
        const ratio = w / origWidth;
        handleSetAttribute('width', parseFloat($(element).attr('width')) * ratio);
      }
      if (origHeight !== h) {
        const ratio = h / origHeight;
        handleSetAttribute('height', parseFloat($(element).attr('height')) * ratio);
      }
    }

    clearHistory();
    const result = await this.calculateImageData(displaySrc);
    handleSetAttribute('xlink:href', result.pngBase64);
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
    svgCanvas.selectOnly([element], true);
    unmount();
    Progress.popById('photo-edit-processing');
  }

  async handleSharp(isPreview?: boolean): Promise<void> {
    Progress.openNonstopProgress({
      id: 'photo-edit-processing',
      message: LANG.processing,
    });
    const {
      sharpness, displaySrc, previewSrc, origSrc, origWidth, imageWidth,
    } = this.state;
    let { sharpRadius } = this.state;
    sharpRadius = isPreview ? Math.ceil(sharpRadius * (imageWidth / origWidth)) : sharpRadius;
    const imgBlobUrl = isPreview ? previewSrc : origSrc;
    try {
      let newImgUrl = imgBlobUrl;
      if (sharpRadius * sharpness > 0) {
        const blob = await opencvWS.sharpen(imgBlobUrl, sharpness, sharpRadius);
        newImgUrl = URL.createObjectURL(blob);
      }
      if (displaySrc !== previewSrc) {
        URL.revokeObjectURL(displaySrc);
      }
      Progress.popById('photo-edit-processing');
      if (isPreview) {
        this.setState({
          displaySrc: newImgUrl,
          isImageDataGenerated: false,
        });
      } else {
        this.setState({ displaySrc: newImgUrl }, () => this.handleComplete());
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Error when sharpening image', error);
      Progress.popById('photo-edit-processing');
    }
  }

  handleStartCrop = (): void => {
    const { isCropping } = this.state;
    if (isCropping) {
      return;
    }
    const image = document.getElementById('original-image') as HTMLImageElement;
    this.cropper = new Cropper(
      image,
      {
        autoCropArea: 1,
        zoomable: false,
        viewMode: 0,
        // targetWidth: image.width,
        // targetHeight: image.height,
      },
    );
    this.setState({ isCropping: true });
  };

  async handleCrop(complete = false): Promise<void> {
    const { displaySrc, origSrc, srcHistory } = this.state;
    const image = document.getElementById('original-image') as HTMLImageElement;
    const cropData = this.cropper.getData();
    let x = Math.max(0, Math.round(cropData.x));
    let y = Math.max(0, Math.round(cropData.y));
    let w = Math.min(image.naturalWidth - x, Math.round(cropData.width));
    let h = Math.min(image.naturalHeight - y, Math.round(cropData.height));
    if (x === 0 && y === 0 && w === image.naturalWidth && h === image.naturalHeight && !complete) {
      return;
    }
    const imgBlobUrl = complete ? origSrc : displaySrc;
    Progress.openNonstopProgress({
      id: 'photo-edit-processing',
      message: LANG.processing,
    });
    if (complete) {
      const { origWidth, origHeight } = this.state;
      const resizedW = this.cropDimensionHistory.length > 0
        ? this.cropDimensionHistory[0].w : this.currentCropDimension.w;
      const resizedH = this.cropDimensionHistory.length > 0
        ? this.cropDimensionHistory[0].h : this.currentCropDimension.h;
      const ratio = origWidth > origHeight
        ? origWidth / resizedW : origHeight / resizedH;
      for (let i = 0; i < this.cropDimensionHistory.length; i += 1) {
        const dim = this.cropDimensionHistory[i];
        x += dim.x;
        y += dim.y;
      }
      x += this.currentCropDimension.x;
      y += this.currentCropDimension.y;
      w = Math.floor(w * ratio);
      h = Math.floor(h * ratio);
      x = Math.floor(x * ratio);
      y = Math.floor(y * ratio);
    }
    const newImgUrl = await jimpHelper.cropImage(imgBlobUrl, x, y, w, h);
    if (newImgUrl) {
      srcHistory.push(displaySrc);
      this.cropDimensionHistory.push(this.currentCropDimension);
      this.currentCropDimension = {
        x, y, w, h,
      };
      this.destroyCropper();
      this.setState({
        displaySrc: newImgUrl,
        srcHistory,
        isCropping: false,
        isImageDataGenerated: false,
        imageWidth: w,
        imageHeight: h,
      }, () => {
        Progress.popById('photo-edit-processing');
        if (complete) {
          Progress.openNonstopProgress({
            id: 'photo-edit-processing',
            message: LANG.processing,
          });
          setTimeout(() => this.handleComplete(), 500);
        }
      });
    } else {
      Progress.popById('photo-edit-processing');
    }
  }

  destroyCropper(): void {
    if (this.cropper) {
      this.cropper.destroy();
    }
  }

  updateCurveFunction(curvefunction: (n: number) => number): void {
    this.curvefunction = curvefunction;
  }

  async handleCurve(isPreview: boolean): Promise<void> {
    const { displaySrc, previewSrc, origSrc } = this.state;
    const curveMap = [...Array(256).keys()].map((e: number) => Math.round(this.curvefunction(e)));
    const imgBlobUrl = isPreview ? previewSrc : origSrc;
    Progress.openNonstopProgress({
      id: 'photo-edit-processing',
      message: LANG.processing,
    });
    const newImgUrl = await jimpHelper.curveOperate(imgBlobUrl, curveMap);
    if (newImgUrl) {
      if (displaySrc !== previewSrc) {
        URL.revokeObjectURL(displaySrc);
      }
      Progress.popById('photo-edit-processing');
      if (isPreview) {
        this.setState({
          displaySrc: newImgUrl,
          isImageDataGenerated: false,
        });
      } else {
        this.setState({ displaySrc: newImgUrl }, () => this.handleComplete());
      }
    } else {
      Progress.popById('photo-edit-processing');
    }
  }

  generateImageData = async (): Promise<void> => {
    const { displaySrc, displayBase64 } = this.state;
    Progress.openNonstopProgress({
      id: 'photo-edit-processing',
      message: LANG.processing,
    });
    const result = await this.calculateImageData(displaySrc);
    Progress.popById('photo-edit-processing');
    if (displayBase64) {
      URL.revokeObjectURL(displayBase64);
    }
    this.setState({
      displayBase64: result.pngBase64,
      isImageDataGenerated: true,
    });
  };

  async calculateImageData(src: string): Promise<IImageDataResult> {
    const { shading, threshold } = this.state;
    return new Promise<IImageDataResult>((resolve) => {
      ImageData(src, {
        grayscale: {
          is_rgba: true,
          is_shading: shading,
          threshold,
          is_svg: false,
        },
        isFullResolution: true,
        onComplete: (result: IImageDataResult) => {
          resolve(result);
        },
      });
    });
  }

  handleGoBack(): void {
    const { isCropping, displaySrc, srcHistory } = this.state;
    if (isCropping) {
      this.destroyCropper();
    }
    URL.revokeObjectURL(displaySrc);
    const src = srcHistory.pop();
    this.currentCropDimension = this.cropDimensionHistory.pop();
    const { w, h } = this.currentCropDimension;
    this.setState({
      displaySrc: src,
      isCropping: false,
      isImageDataGenerated: false,
      imageWidth: w,
      imageHeight: h,
    });
  }

  renderPhotoEditeModal(): JSX.Element {
    const { mode } = this.props;
    const {
      imageWidth, imageHeight, isCropping, isShowingOriginal, displayBase64,
    } = this.state;

    let panelContent = null;
    let rightWidth = 40;
    let title = '';
    switch (mode) {
      case 'sharpen':
        panelContent = this.renderSharpenPanel();
        title = LANG.sharpen;
        rightWidth = 390;
        break;
      case 'curve':
        panelContent = this.renderCurvePanel();
        title = LANG.curve;
        rightWidth = 390;
        break;
      default:
        break;
    }
    const maxAllowableWidth = window.innerWidth - rightWidth;
    const maxAllowableHeight = window.innerHeight - 2 * Constants.topBarHeightWithoutTitleBar - 180;
    const imgSizeStyle = (imageWidth / maxAllowableWidth > imageHeight / maxAllowableHeight)
      ? { width: maxAllowableWidth } : { height: maxAllowableHeight };
    const imgWidth = imgSizeStyle.width
      ? maxAllowableWidth
      : imgSizeStyle.height * (imageWidth / imageHeight);
    const onImgLoad = () => {
      if (mode === 'crop' && !isCropping) {
        this.handleStartCrop();
      }
    };
    return (
      <Modal
        open
        centered
        width={imgWidth + rightWidth}
        title={title}
        footer={this.renderPhotoEditFooter()}
        onCancel={this.handleGoBack}
      >
        <Row gutter={10}>
          <Col flex={`1 1 ${imgSizeStyle.width}`}>
            <img
              id="original-image"
              style={imgSizeStyle}
              src={isShowingOriginal ? this.compareBase64 : displayBase64}
              onLoad={() => onImgLoad()}
            />
          </Col>
          <Col flex={`1 1 ${mode === 'crop' ? 0 : 260}px`}>
            {panelContent}
          </Col>
        </Row>
      </Modal>
    );
  }

  renderSharpenPanel(): JSX.Element {
    const setStateAndPreview = (key: string, value: number) => {
      const { state } = this;
      if (state[key] === value) {
        return;
      }
      state[key] = value;
      this.setState(state, () => {
        this.handleSharp(true);
      });
    };

    return (
      <div className="right-part">
        <div className="scroll-bar-container sharpen">
          <div className="sub-functions with-slider">
            <SliderControl
              id="sharpen-intensity"
              label={LANG.sharpness}
              min={0}
              max={20}
              step={1}
              default={0}
              onChange={(id: string, val: string) => setStateAndPreview('sharpness', parseFloat(val))}
              doOnlyOnMouseUp
              doOnlyOnBlur
            />
            <SliderControl
              id="sharpen-radius"
              label={LANG.radius}
              min={0}
              max={100}
              step={1}
              default={1}
              onChange={(id: string, val: string) => setStateAndPreview('sharpRadius', parseInt(val, 10))}
              doOnlyOnMouseUp
              doOnlyOnBlur
            />
          </div>
        </div>
      </div>
    );
  }

  renderCurvePanel(): JSX.Element {
    const updateCurveFunction = (curvefunction) => this.updateCurveFunction(curvefunction);
    const handleCurve = () => this.handleCurve(true);
    return (
      <div style={{ width: 260, height: 260 }}>
        <CurveControl
          updateCurveFunction={updateCurveFunction}
          updateImage={handleCurve}
        />
      </div>
    );
  }

  renderPhotoEditFooter(): JSX.Element {
    const { mode } = this.props;
    const { srcHistory } = this.state;
    const previewButton = (
      <Button
        onMouseDown={() => this.setState({ isShowingOriginal: true })}
        onMouseUp={() => this.setState({ isShowingOriginal: false })}
        onMouseLeave={() => this.setState({ isShowingOriginal: false })}
        type="dashed"
      >
        {LANG.compare}
      </Button>
    );
    const handleOk = () => {
      if (mode === 'sharpen') {
        this.handleSharp(false);
      } else if (mode === 'crop') {
        this.handleCrop(true);
      } else if (mode === 'curve') {
        this.handleCurve(false);
      }
    };

    const cancelButton = (
      <Button
        onClick={() => this.handleCancel()}
      >
        {LANG.cancel}
      </Button>
    );
    const okButton = (
      <Button
        onClick={() => handleOk()}
        type="primary"
      >
        {LANG.okay}
      </Button>
    );
    return (
      <div>
        {previewButton}
        {' '}
        {cancelButton}
        {' '}
        {okButton}
      </div>
    );
  }

  render(): JSX.Element {
    const { mode } = this.props;
    if (['sharpen', 'crop', 'curve'].includes(mode)) {
      return this.renderPhotoEditeModal();
    }
    return null;
  }
}

export default PhotoEditPanel;
