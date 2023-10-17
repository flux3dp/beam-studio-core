import classNames from 'classnames';
import React, { Fragment } from 'react';
import { ConfigProvider, InputNumber, Slider, Switch } from 'antd';
import { Popover } from 'antd-mobile';

import history from 'app/svgedit/history';
import i18n from 'helpers/i18n';
import ImageData from 'helpers/image-data';
import ObjectPanelController from 'app/views/beambox/Right-Panels/contexts/ObjectPanelController';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import OptionPanelIcons from 'app/icons/option-panel/OptionPanelIcons';
import UnitInput from 'app/widgets/Unit-Input-v2';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IBatchCommand } from 'interfaces/IHistory';
import { IImageDataResult } from 'interfaces/IImage';
import { isMobile } from 'helpers/system-helper';
import { sliderTheme } from 'app/views/beambox/Right-Panels/antd-config';

import styles from './Image-Options.module.scss';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const LANG = i18n.lang.beambox.right_panel.object_panel.option_panel;

interface Props {
  elem: Element;
  updateObjectPanel: () => void;
}

class ImageOptions extends React.Component<Props> {
  private thresholdCache: string[] = new Array(256).fill(null);

  private currentCallId = 0;

  private nextCallId = 1;

  changeAttribute = (changes: { [key: string]: string | number | boolean }): void => {
    const { elem } = this.props as Props;
    const batchCommand: IBatchCommand = new history.BatchCommand('Image Option Panel');
    const setAttribute = (key: string, value: string | number | boolean) => {
      svgCanvas.undoMgr.beginUndoableChange(key, [elem]);
      elem.setAttribute(key, value as string);
      const cmd = svgCanvas.undoMgr.finishUndoableChange();
      if (!cmd.isEmpty()) {
        batchCommand.addSubCommand(cmd);
      }
    };
    const keys = Object.keys(changes);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      setAttribute(key, changes[key]);
    }
    if (!batchCommand.isEmpty()) {
      svgCanvas.undoMgr.addCommandToHistory(batchCommand);
    }
  };

  generateImageData = (isShading: boolean, threshold: number): Promise<IImageDataResult> => {
    const { elem } = this.props as Props;
    return new Promise<IImageDataResult>((resolve) => {
      ImageData(
        elem.getAttribute('origImage'),
        {
          width: parseFloat(elem.getAttribute('width')),
          height: parseFloat(elem.getAttribute('height')),
          grayscale: {
            is_rgba: true,
            is_shading: isShading,
            threshold,
            is_svg: false,
          },
          onComplete: (result: IImageDataResult) => {
            resolve(result);
          },
        },
      );
    });
  };

  handleGradientClick = async (): Promise<void> => {
    const { elem, updateObjectPanel } = this.props;
    let isShading = elem.getAttribute('data-shading') === 'true';
    isShading = !isShading;
    const threshold = isShading ? 254 : 128;
    const imageData = await this.generateImageData(isShading, threshold);
    const { pngBase64 } = imageData;
    this.changeAttribute({
      'data-shading': isShading,
      'data-threshold': isShading ? 254 : 128,
      'xlink:href': pngBase64,
    });
    this.forceUpdate();
    updateObjectPanel();
  };

  handleThresholdChange = async (val: number): Promise<void> => {
    const callId = this.nextCallId;
    this.nextCallId += 1;
    let result = this.thresholdCache[val];
    if (!result) {
      const { elem } = this.props;
      const isShading = elem.getAttribute('data-shading') === 'true';
      const imageData = await this.generateImageData(isShading, val);
      result = imageData.pngBase64;
      this.thresholdCache[val] = result;
    }
    if (callId >= this.currentCallId) {
      this.currentCallId = callId;
      this.changeAttribute({
        'data-threshold': val,
        'xlink:href': result,
      });
      this.forceUpdate();
    }
  };

  renderGradientBlock(): JSX.Element {
    const { elem } = this.props;
    const isGradient = elem.getAttribute('data-shading') === 'true';
    return isMobile() ? (
      <ObjectPanelItem.Item
        id="gradient"
        content={<Switch checked={isGradient} />}
        label={LANG.shading}
        onClick={this.handleGradientClick}
      />
    ) : (
      <div className={styles['option-block']} key="gradient">
        <div className={styles.label}>{LANG.shading}</div>
        <Switch size="small" checked={isGradient} onChange={this.handleGradientClick} />
      </div>
    );
  }

  renderThresholdBlock(): JSX.Element {
    const { elem } = this.props;
    const isGradient = elem.getAttribute('data-shading') === 'true';
    const activeKey = ObjectPanelController.getActiveKey();
    const visible = activeKey === 'threshold';
    if (isGradient) {
      return null;
    }
    const threshold = parseInt(elem.getAttribute('data-threshold'), 10) || 128;
    return isMobile() ? (
      <Popover
        visible={visible}
        content={
          <div className={styles.field}>
            <span className={styles.label}>{LANG.threshold_short}</span>
            <ConfigProvider theme={{ token: { borderRadius: 100 } }}>
              <InputNumber
                className={styles.input}
                type="number"
                min={1}
                max={255}
                value={threshold}
                precision={0}
                onChange={this.handleThresholdChange}
                controls={false}
              />
            </ConfigProvider>
            <Slider
              className={styles.slider}
              min={1}
              max={255}
              step={1}
              marks={{ 128: '128' }}
              value={threshold}
              onChange={this.handleThresholdChange}
            />
          </div>
        }
      >
        <ObjectPanelItem.Item
          id="threshold"
          content={<OptionPanelIcons.Threshold />}
          label={LANG.threshold_short}
          autoClose={false}
        />
      </Popover>
    ) : (
      <Fragment key="threshold">
        <div className={classNames(styles['option-block'], styles['with-slider'])}>
          <div className={styles.label}>{LANG.threshold}</div>
          <UnitInput
            min={1}
            max={255}
            decimal={0}
            unit=""
            className={{ [styles['option-input']]: true }}
            defaultValue={threshold}
            getValue={this.handleThresholdChange}
          />
        </div>
        <ConfigProvider theme={sliderTheme}>
          <Slider
            min={1}
            max={255}
            step={1}
            value={threshold}
            onChange={this.handleThresholdChange}
          />
        </ConfigProvider>
      </Fragment>
    );
  }

  render(): JSX.Element {
    return isMobile() ? (
      <>
        {this.renderGradientBlock()}
        {this.renderThresholdBlock()}
      </>
    ) : (
      <div className={styles.options}>
        {this.renderGradientBlock()}
        {this.renderThresholdBlock()}
      </div>
    );
  }
}

export default ImageOptions;
