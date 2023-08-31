import * as React from 'react';

import calculateBase64 from 'helpers/image-edit-panel/calculate-base64';
import Constants from 'app/actions/beambox/constant';
import CurveControl from 'app/widgets/Curve-Control';
import history from 'app/svgedit/history';
import i18n from 'helpers/i18n';
import jimpHelper from 'helpers/jimp-helper';
import {
  Button, Col, Modal, Row,
} from 'antd';
import OpenCVWebSocket from 'helpers/api/open-cv';
import Progress from 'app/actions/progress-caller';
import SliderControl from 'app/widgets/Slider-Control';
import { getSVGAsync } from 'helpers/svg-editor-helper';
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

export type PhotoEditMode = 'sharpen' | 'curve';

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
  threshold: number;
  shading: boolean;
  isFullColor: boolean;
  displayBase64: string,
  isImageDataGenerated: boolean;
  isShowingOriginal: boolean;
}

// TODO: refactor this component, seperate different function into different component

class PhotoEditPanel extends React.Component<Props, State> {
  private compareBase64: string;

  private curvefunction: (n: number) => number;

  constructor(props: Props) {
    super(props);
    updateLang();
    const { element, src } = this.props;
    this.state = {
      origSrc: src,
      previewSrc: src,
      displaySrc: src,
      sharpness: 0,
      sharpRadius: 1,
      threshold: parseInt(element.getAttribute('data-threshold'), 10),
      shading: element.getAttribute('data-shading') === 'true',
      isFullColor: element.getAttribute('data-fullcolor') === '1',
      displayBase64: null,
      isImageDataGenerated: false,
      isShowingOriginal: false,
    };
  }

  componentDidMount(): void {
    const { mode, unmount } = this.props;
    if (!['sharpen', 'curve'].includes(mode)) {
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
      this.compareBase64 = result;
    };

    Progress.openNonstopProgress({
      id: 'photo-edit-processing',
      message: LANG.processing,
    });
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
      setCompareBase64(imgBlobUrl);
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

  handleCancel = (): void => {
    const { displaySrc } = this.state;
    const { unmount } = this.props;
    URL.revokeObjectURL(displaySrc);
    unmount();
  }

  async handleComplete(): Promise<void> {
    const clearHistory = () => {
      const { previewSrc, origSrc } = this.state;
      if (previewSrc !== origSrc) {
        URL.revokeObjectURL(previewSrc);
      }
    };

    Progress.openNonstopProgress({
      id: 'photo-edit-processing',
      message: LANG.processing,
    });
    const { displaySrc } = this.state;
    const { element, unmount } = this.props;
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
    clearHistory();
    const result = await this.calculateImageData(displaySrc);
    handleSetAttribute('xlink:href', result);
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
      displayBase64: result,
      isImageDataGenerated: true,
    });
  };

  updateCurveFunction(curvefunction: (n: number) => number): void {
    this.curvefunction = curvefunction;
  }

  async calculateImageData(src: string): Promise<string> {
    const { shading, threshold, isFullColor } = this.state;
    const resultBase64 = calculateBase64(src, shading, threshold, isFullColor);
    return resultBase64
  }

  renderPhotoEditeModal(): JSX.Element {
    const { mode } = this.props;
    const {
      imageWidth, imageHeight, isShowingOriginal, displayBase64,
    } = this.state;

    let panelContent = null;
    let rightWidth = 60;
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
    return (
      <Modal
        open
        centered
        width={imgWidth + rightWidth}
        title={title}
        footer={this.renderPhotoEditFooter()}
        onCancel={this.handleCancel}
      >
        <Row gutter={10}>
          <Col flex={`1 1 ${imgSizeStyle.width}`}>
            <img
              id="original-image"
              style={imgSizeStyle}
              src={isShowingOriginal ? this.compareBase64 : displayBase64}
            />
          </Col>
          <Col flex="1 1 260px">
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

  renderPhotoEditFooter(): JSX.Element[] {
    const { mode } = this.props;
    const previewButton = (
      <Button
        key="preview"
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
      } else if (mode === 'curve') {
        this.handleCurve(false);
      }
    };

    const cancelButton = (
      <Button
        key="cancel"
        onClick={this.handleCancel}
      >
        {LANG.cancel}
      </Button>
    );
    const okButton = (
      <Button
        key="ok"
        onClick={() => handleOk()}
        type="primary"
      >
        {LANG.okay}
      </Button>
    );
    return [
      previewButton,
      cancelButton,
      okButton,
    ];
  }

  render(): JSX.Element {
    const { mode } = this.props;
    if (['sharpen', 'curve'].includes(mode)) {
      return this.renderPhotoEditeModal();
    }
    return null;
  }
}

export default PhotoEditPanel;
