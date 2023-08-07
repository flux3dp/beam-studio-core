import * as React from 'react';
import Icon from '@ant-design/icons';

import Constant from 'app/actions/beambox/constant';
import i18n from 'helpers/i18n';
import HistoryCommandFactory from 'app/svgedit/HistoryCommandFactory';
import KeycodeConstants from 'app/constants/keycode-constants';
import ObjectPanelIcon from 'app/icons/object-panel/ObjectPanelIcons';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import SymbolMaker from 'helpers/symbol-maker';
import storage from 'implementations/storage';
import UnitInput from 'app/widgets/Unit-Input-v2';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IBatchCommand } from 'interfaces/IHistory';
import { isMobile } from 'helpers/system-helper';

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });

const LANG = i18n.lang.beambox.right_panel.object_panel;

const panelMap = {
  g: ['x', 'y', 'rot', 'w', 'h', 'lock'],
  path: ['x', 'y', 'rot', 'w', 'h', 'lock'],
  polygon: ['x', 'y', 'rot', 'w', 'h', 'lock'],
  rect: ['x', 'y', 'rot', 'w', 'h', 'lock'],
  ellipse: ['cx', 'cy', 'rot', 'rx', 'ry', 'lock'],
  line: ['x1', 'y1', 'rot', 'x2', 'y2', 'lock'],
  image: ['x', 'y', 'rot', 'w', 'h', 'lock'],
  img: ['x', 'y', 'rot', 'w', 'h', 'lock'],
  text: ['x', 'y', 'rot', 'w', 'h', 'lock'],
  use: ['x', 'y', 'rot', 'w', 'h', 'lock'],
};

const panelMapMobile = {
  g: ['w', 'lock', 'h', 'rot', 'x', 'y'],
  path: ['w', 'lock', 'h', 'rot', 'x', 'y'],
  polygon: ['w', 'lock', 'h', 'rot', 'x', 'y'],
  rect: ['w', 'lock', 'h', 'rot', 'x', 'y'],
  ellipse: ['rx', 'lock', 'ry', 'rot', 'cx', 'cy'],
  line: ['x1', 'y1', 'lock', 'x2', 'y2', 'rot'],
  image: ['w', 'lock', 'h', 'rot', 'x', 'y'],
  img: ['w', 'lock', 'h', 'rot', 'x', 'y'],
  text: ['w', 'lock', 'h', 'rot', 'x', 'y'],
  use: ['w', 'lock', 'h', 'rot', 'x', 'y'],
};

const fixedSizeMapping = {
  width: 'height',
  height: 'width',
  rx: 'ry',
  ry: 'rx',
};

interface Props {
  id?: string;
  elem: Element;
  getDimensionValues: (response: {
    dimensionValues: any,
  }) => void;
  updateDimensionValues: (newDimensionValue: { [key: string]: any }) => void;
}

class DimensionPanel extends React.Component<Props> {
  private unit: string;

  private unitInputClass: any;

  constructor(props: Props) {
    super(props);
    this.unit = storage.get('default-units') === 'inches' ? 'in' : 'mm';
    this.unitInputClass = { 'dimension-input': true };
  }

  componentWillUnmount(): void {
    this.handleSizeBlur();
  }

  handlePositionChange = (type: string, val: number): void => {
    const { elem, updateDimensionValues } = this.props;
    const posVal = val * Constant.dpmm;
    if (!['use', 'text'].includes(elem.tagName)) {
      svgCanvas.changeSelectedAttribute(type, posVal, [elem]);
    } else {
      svgCanvas.setSvgElemPosition(type, posVal, elem);
    }
    const newDimensionValue = {};
    newDimensionValue[type] = posVal;
    updateDimensionValues(newDimensionValue);
    this.forceUpdate();
  };

  handleRotationChange = (val: number): void => {
    const { elem, updateDimensionValues } = this.props;
    let rotationDeg = val % 360;
    if (rotationDeg > 180) rotationDeg -= 360;
    svgCanvas.setRotationAngle(rotationDeg, false, elem);
    updateDimensionValues({ rotation: rotationDeg });
    this.forceUpdate();
  };

  changeSize = (type: string, val: number): IBatchCommand => {
    const { elem } = this.props;
    const elemSize = val > 0.1 ? val : 0.1;
    let cmd = null;

    switch (elem.tagName) {
      case 'ellipse':
      case 'rect':
      case 'image':
        svgCanvas.undoMgr.beginUndoableChange(type, [elem]);
        svgCanvas.changeSelectedAttributeNoUndo(type, elemSize, [elem]);
        cmd = svgCanvas.undoMgr.finishUndoableChange();
        break;
      case 'g':
      case 'polygon':
      case 'path':
      case 'text':
      case 'use':
        cmd = svgCanvas.setSvgElemSize(type, elemSize);
        break;
      default:
        break;
    }
    if (elem.tagName === 'text') {
      if (elem.getAttribute('stroke-width') === '2') {
        elem.setAttribute('stroke-width', '2.01');
      } else {
        elem.setAttribute('stroke-width', '2');
      }
    }
    return cmd;
  };

  handleSizeChange = (type: 'width' | 'height' | 'rx' | 'ry', val: number): void => {
    const batchCmd = HistoryCommandFactory.createBatchCommand('Object Panel Size Change');
    const { updateDimensionValues, getDimensionValues } = this.props;
    const response = {
      dimensionValues: {} as any,
    };
    getDimensionValues(response);
    const { dimensionValues } = response;
    const isRatioFixed = dimensionValues.isRatioFixed || false;

    const newDimensionValue = {};
    const sizeVal = val * Constant.dpmm;
    if (isRatioFixed) {
      const ratio = sizeVal / parseFloat(dimensionValues[type]);
      const otherType = fixedSizeMapping[type];
      const newOtherTypeVal = ratio * parseFloat(dimensionValues[otherType]);

      let cmd = this.changeSize(type, sizeVal);
      if (cmd && !cmd.isEmpty()) {
        batchCmd.addSubCommand(cmd);
      }
      cmd = this.changeSize(otherType, newOtherTypeVal);
      if (cmd && !cmd.isEmpty()) {
        batchCmd.addSubCommand(cmd);
      }
      newDimensionValue[type] = sizeVal;
      newDimensionValue[otherType] = newOtherTypeVal;
    } else {
      const cmd = this.changeSize(type, sizeVal);
      if (cmd && !cmd.isEmpty()) {
        batchCmd.addSubCommand(cmd);
      }
      newDimensionValue[type] = sizeVal;
    }
    if (batchCmd && !batchCmd.isEmpty()) {
      svgCanvas.undoMgr.addCommandToHistory(batchCmd);
    }
    updateDimensionValues(newDimensionValue);
    this.forceUpdate();
  };

  handleSizeKeyUp = (e: KeyboardEvent): void => {
    const { elem } = this.props;
    if (elem.tagName === 'use' && (e.keyCode === KeycodeConstants.KEY_UP || e.keyCode === KeycodeConstants.KEY_DOWN)) {
      SymbolMaker.reRenderImageSymbol(elem as SVGUseElement);
    }
  };

  handleSizeBlur = async (): Promise<void> => {
    const { elem } = this.props;
    if (elem.tagName === 'use') {
      SymbolMaker.reRenderImageSymbol(elem as SVGUseElement);
    } else if (elem.tagName === 'g') {
      const allUses = Array.from(elem.querySelectorAll('use'));
      SymbolMaker.reRenderImageSymbolArray(allUses);
    }
  };

  handleFixRatio = (): void => {
    const { elem, updateDimensionValues } = this.props;
    const isRatioFixed = elem.getAttribute('data-ratiofixed') === 'true';
    elem.setAttribute('data-ratiofixed', String(!isRatioFixed));
    updateDimensionValues({ isRatioFixed: !isRatioFixed });
    this.forceUpdate();
  };

  getDisplayValue = (val: number): number => {
    if (!val) {
      return 0;
    }
    return val / Constant.dpmm;
  };

  renderDimensionPanel = (type: string): JSX.Element => {
    const { getDimensionValues } = this.props;
    const response = {
      dimensionValues: {} as any,
    };
    getDimensionValues(response);
    const { dimensionValues } = response;
    const isRatioFixed = dimensionValues.isRatioFixed || false;
    switch (type) {
      case 'x':
        if (isMobile()) {
          return (
            <ObjectPanelItem.Number
              id="x_position"
              value={this.getDisplayValue(dimensionValues[type])}
              updateValue={(val) => this.handlePositionChange(type, val)}
              label="X"
            />
          );
        }
        return (
          <div className="dimension-container" key={type}>
            <div className="label">X</div>
            <UnitInput
              id="x_position"
              unit={this.unit}
              className={this.unitInputClass}
              defaultValue={this.getDisplayValue(dimensionValues.x)}
              getValue={(val) => this.handlePositionChange('x', val)}
            />
          </div>
        );
      case 'y':
        if (isMobile()) {
          return (
            <ObjectPanelItem.Number
              id="y_position"
              value={this.getDisplayValue(dimensionValues[type])}
              updateValue={(val) => this.handlePositionChange(type, val)}
              label="Y"
            />
          );
        }
        return (
          <div className="dimension-container" key={type}>
            <div className="label">Y</div>
            <UnitInput
              id="y_position"
              unit={this.unit}
              className={this.unitInputClass}
              defaultValue={this.getDisplayValue(dimensionValues.y)}
              getValue={(val) => this.handlePositionChange('y', val)}
            />
          </div>
        );
      case 'x1':
        if (isMobile()) {
          return (
            <ObjectPanelItem.Number
              id="x1_position"
              value={this.getDisplayValue(dimensionValues[type])}
              updateValue={(val) => this.handlePositionChange(type, val)}
              label={
                <>
                  X<sub>1</sub>
                </>
              }
            />
          );
        }
        return (
          <div className="dimension-container" key={type}>
            <div className="label">
              X
              <sub>1</sub>
            </div>
            <UnitInput
              id="x1_position"
              unit={this.unit}
              className={this.unitInputClass}
              defaultValue={this.getDisplayValue(dimensionValues.x1)}
              getValue={(val) => this.handlePositionChange('x1', val)}
            />
          </div>
        );
      case 'y1':
        if (isMobile()) {
          return (
            <ObjectPanelItem.Number
              id="y1_position"
              value={this.getDisplayValue(dimensionValues[type])}
              updateValue={(val) => this.handlePositionChange(type, val)}
              label={
                <>
                  Y<sub>1</sub>
                </>
              }
            />
          );
        }
        return (
          <div className="dimension-container" key={type}>
            <div className="label">
              Y
              <sub>1</sub>
            </div>
            <UnitInput
              id="y1_position"
              unit={this.unit}
              className={this.unitInputClass}
              defaultValue={this.getDisplayValue(dimensionValues.y1)}
              getValue={(val) => this.handlePositionChange('y1', val)}
            />
          </div>
        );
      case 'x2':
        if (isMobile()) {
          return (
            <ObjectPanelItem.Number
              id="x2_position"
              value={this.getDisplayValue(dimensionValues[type])}
              updateValue={(val) => this.handlePositionChange(type, val)}
              label={
                <>
                  X<sub>2</sub>
                </>
              }
            />
          );
        }
        return (
          <div className="dimension-container" key={type}>
            <div className="label">
              X
              <sub>2</sub>
            </div>
            <UnitInput
              id="x2_position"
              unit={this.unit}
              className={this.unitInputClass}
              defaultValue={this.getDisplayValue(dimensionValues.x2)}
              getValue={(val) => this.handlePositionChange('x2', val)}
            />
          </div>
        );
      case 'y2':
        if (isMobile()) {
          return (
            <ObjectPanelItem.Number
              id="y2_position"
              value={this.getDisplayValue(dimensionValues[type])}
              updateValue={(val) => this.handlePositionChange(type, val)}
              label={
                <>
                  Y<sub>2</sub>
                </>
              }
            />
          );
        }
        return (
          <div className="dimension-container" key={type}>
            <div className="label">
              Y
              <sub>2</sub>
            </div>
            <UnitInput
              id="y2_position"
              unit={this.unit}
              className={this.unitInputClass}
              defaultValue={this.getDisplayValue(dimensionValues.y2)}
              getValue={(val) => this.handlePositionChange('y2', val)}
            />
          </div>
        );
      case 'cx':
        if (isMobile()) {
          return (
            <ObjectPanelItem.Number
              id="cx_position"
              value={this.getDisplayValue(dimensionValues[type])}
              updateValue={(val) => this.handlePositionChange(type, val)}
              label={
                <>
                  X<sub>C</sub>
                </>
              }
            />
          );
        }
        return (
          <div className="dimension-container" key={type}>
            <div className="label">
              X
              <sub>C</sub>
            </div>
            <UnitInput
              id="cx_position"
              unit={this.unit}
              className={this.unitInputClass}
              defaultValue={this.getDisplayValue(dimensionValues.cx)}
              getValue={(val) => this.handlePositionChange('cx', val)}
            />
          </div>
        );
      case 'cy':
        if (isMobile()) {
          return (
            <ObjectPanelItem.Number
              id="cy_position"
              value={this.getDisplayValue(dimensionValues[type])}
              updateValue={(val) => this.handlePositionChange(type, val)}
              label={
                <>
                  Y<sub>C</sub>
                </>
              }
            />
          );
        }
        return (
          <div className="dimension-container" key={type}>
            <div className="label">
              Y
              <sub>C</sub>
            </div>
            <UnitInput
              id="cy_position"
              unit={this.unit}
              className={this.unitInputClass}
              defaultValue={this.getDisplayValue(dimensionValues.cy)}
              getValue={(val) => this.handlePositionChange('cy', val)}
            />
          </div>
        );
      case 'rot':
        if (isMobile()) {
          return (
            <ObjectPanelItem.Number
              id="rotate"
              value={dimensionValues.rotation || 0}
              updateValue={this.handleRotationChange}
              label="Rotate"
            />
          );
        }
        return (
          <div className="dimension-container" key={type}>
            <div className="label img">
              <img src="img/right-panel/icon-rotate.svg" alt="" />
            </div>
            <UnitInput
              id="rotate"
              unit="deg"
              className={this.unitInputClass}
              defaultValue={dimensionValues.rotation}
              getValue={(val) => this.handleRotationChange(val)}
            />
          </div>
        );
      case 'w':
        if (isMobile()) {
          return (
            <ObjectPanelItem.Number
              id="width"
              value={this.getDisplayValue(dimensionValues.width)}
              updateValue={(val) => this.handleSizeChange('width', val)}
              label="W"
            />
          );
        }
        return (
          <div className="dimension-container" key={type}>
            <div className="label">W</div>
            <UnitInput
              id="width"
              unit={this.unit}
              className={this.unitInputClass}
              onBlur={() => this.handleSizeBlur()}
              onKeyUp={(e) => this.handleSizeKeyUp(e)}
              defaultValue={this.getDisplayValue(dimensionValues.width)}
              getValue={(val) => this.handleSizeChange('width', val)}
            />
          </div>
        );
      case 'h':
        if (isMobile()) {
          return (
            <ObjectPanelItem.Number
              id="height"
              value={this.getDisplayValue(dimensionValues.height)}
              updateValue={(val) => this.handleSizeChange('height', val)}
              label="H"
            />
          );
        }
        return (
          <div className="dimension-container" key={type}>
            <div className="label">H</div>
            <UnitInput
              id="height"
              unit={this.unit}
              className={this.unitInputClass}
              onBlur={() => this.handleSizeBlur()}
              onKeyUp={(e) => this.handleSizeKeyUp(e)}
              defaultValue={this.getDisplayValue(dimensionValues.height)}
              getValue={(val) => this.handleSizeChange('height', val)}
            />
          </div>
        );
      case 'rx':
        if (isMobile()) {
          return (
            <ObjectPanelItem.Number
              id="rx_width"
              value={this.getDisplayValue(dimensionValues.rx * 2)}
              updateValue={(val) => this.handleSizeChange('rx', val / 2)}
              label="W"
            />
          );
        }
        return (
          <div className="dimension-container" key={type}>
            <div className="label">W</div>
            <UnitInput
              id="rx_width"
              unit={this.unit}
              className={this.unitInputClass}
              defaultValue={this.getDisplayValue(dimensionValues.rx * 2)}
              getValue={(val) => this.handleSizeChange('rx', val / 2)}
            />
          </div>
        );
      case 'ry':
        if (isMobile()) {
          return (
            <ObjectPanelItem.Number
              id="ry_height"
              value={this.getDisplayValue(dimensionValues.ry * 2)}
              updateValue={(val) => this.handleSizeChange('ry', val / 2)}
              label="H"
            />
          );
        }
        return (
          <div className="dimension-container" key={type}>
            <div className="label">H</div>
            <UnitInput
              id="ry_height"
              unit={this.unit}
              className={this.unitInputClass}
              defaultValue={this.getDisplayValue(dimensionValues.ry * 2)}
              getValue={(val) => this.handleSizeChange('ry', val / 2)}
            />
          </div>
        );
      case 'lock':
        if (isMobile()) {
          return (
            <ObjectPanelItem.Item
              id="lock"
              content={
                <Icon
                  component={isRatioFixed ? ObjectPanelIcon.Lock : ObjectPanelIcon.Unlock}
                  viewBox="0 0 32 32"
                />
              }
              onClick={this.handleFixRatio}
            />
          );
        }
        return (
          <div
            className="dimension-lock"
            title={isRatioFixed ? LANG.unlock_aspect : LANG.lock_aspect}
            key={type}
            onClick={() => this.handleFixRatio()}
          >
            <img src={isRatioFixed ? 'img/right-panel/icon-lock.svg' : 'img/right-panel/icon-unlock.svg'} alt="" />
          </div>
        );
      default:
        break;
    }
    return null;
  };

  renderDimensionPanels = (panels: Array<string>): Array<Element> => {
    const ret = [];
    for (let i = 0; i < panels.length; i += 1) {
      ret.push(this.renderDimensionPanel(panels[i]));
    }
    return ret;
  };

  renderFlipButtons = (): JSX.Element =>
    isMobile() ? (
      <ObjectPanelItem.ActionList
        id="flip"
        actions={[
          {
            icon: <Icon component={ObjectPanelIcon.Flip} viewBox="0 0 32 32" />,
            label: LANG.hflip,
            onClick: () => svgCanvas.flipSelectedElements(-1, 1),
          },
          {
            icon: <Icon component={ObjectPanelIcon.Flip} rotate={90} viewBox="0 0 32 32" />,
            label: LANG.vflip,
            onClick: () => svgCanvas.flipSelectedElements(1, -1),
          },
        ]}
        content={<ObjectPanelIcon.Flip />}
        label="flip"
      />
    ) : (
      <div className="flip-btn-container">
        <div
          id="horizontal_flip"
          className="tool-btn"
          onClick={() => svgCanvas.flipSelectedElements(-1, 1)}
          title={LANG.hflip}
        >
          <img src="img/right-panel/icon-hflip.svg" alt="" />
        </div>
        <div
          id="vertical_flip"
          className="tool-btn"
          onClick={() => svgCanvas.flipSelectedElements(1, -1)}
          title={LANG.vflip}
        >
          <img src="img/right-panel/icon-vflip.svg" alt="" />
        </div>
      </div>
    );

  render(): JSX.Element {
    const { elem } = this.props;
    let panels = ['x', 'y', 'rot', 'w', 'h'];
    if (elem) {
      panels = (isMobile() ? panelMapMobile : panelMap)[elem.tagName.toLowerCase()] || panels;
    }
    return (
      <div className="dimension-panel">
        {isMobile() && <ObjectPanelItem.Divider />}
        {this.renderDimensionPanels(panels)}
        {this.renderFlipButtons()}
      </div>
    );
  }
}

export default DimensionPanel;
