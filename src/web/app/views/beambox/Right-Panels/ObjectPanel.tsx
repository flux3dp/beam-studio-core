import * as React from 'react';
import classNames from 'classnames';

import ActionsPanel from 'app/views/beambox/Right-Panels/ActionsPanel';
import DimensionPanel from 'app/views/beambox/Right-Panels/DimensionPanel';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import i18n from 'helpers/i18n';
import OptionsPanel from 'app/views/beambox/Right-Panels/OptionsPanel';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { ObjectPanelContext } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });
const LANG = i18n.lang.beambox.right_panel.object_panel;

interface Props {
  elem: Element;
}

export default class ObjectPanel extends React.Component<Props> {
  private getAvailableFunctions = () => {
    const { elem } = this.props;
    if (!elem) {
      return {};
    }
    let elems = [elem];
    if (elems.length > 0 && elems[0].getAttribute('data-tempgroup') === 'true') {
      elems = Array.from(elems[0].childNodes) as Element[];
    }

    const elementAllowBooleanOperations = (e: Element) => {
      if (['rect', 'polygon', 'ellipse'].includes(e.tagName)) {
        return true;
      }
      if (e.tagName === 'path') {
        return svgCanvas.isElemFillable(e);
      }
      return false;
    };

    return {
      group: (elems && elems.length > 0),
      ungroup: (elems && elems.length === 1 && ['g'].includes(elems[0].tagName) && !elem.getAttribute('data-textpath-g')),
      dist: (elems && elems.length > 2),
      union: (elems
        && elems.length > 1
        && elems.every((e) => elementAllowBooleanOperations(e))
      ),
      subtract: (elems
        && elems.length === 2
        && elems.every((e) => elementAllowBooleanOperations(e))
      ),
      intersect: (elems
        && elems.length > 1
        && elems.every((e) => elementAllowBooleanOperations(e))
      ),
      difference: (elems
        && elems.length > 1
        && elems.every((e) => elementAllowBooleanOperations(e))
      ),
    };
  };

  renderToolBtns = (): JSX.Element => {
    const buttonAvailability = this.getAvailableFunctions();
    return (
      <div className="tool-btns-container">
        <div className="tool-btns-row">
          <div className="half-row left sep">
            {this.renderToolBtn(LANG.hdist, 'img/right-panel/icon-hdist.svg', !buttonAvailability.dist, svgCanvas.distHori)}
            {this.renderToolBtn(LANG.top_align, 'img/right-panel/icon-valign-top.svg', false, FnWrapper.alignTop)}
            {this.renderToolBtn(LANG.middle_align, 'img/right-panel/icon-valign-mid.svg', false, FnWrapper.alignMiddle)}
            {this.renderToolBtn(LANG.bottom_align, 'img/right-panel/icon-valign-bot.svg', false, FnWrapper.alignBottom)}
          </div>
          <div className="half-row right">
            {this.renderToolBtn(LANG.vdist, 'img/right-panel/icon-vdist.svg', !buttonAvailability.dist, svgCanvas.distVert)}
            {this.renderToolBtn(LANG.left_align, 'img/right-panel/icon-halign-left.svg', false, FnWrapper.alignLeft)}
            {this.renderToolBtn(LANG.center_align, 'img/right-panel/icon-halign-mid.svg', false, FnWrapper.alignCenter)}
            {this.renderToolBtn(LANG.right_align, 'img/right-panel/icon-halign-right.svg', false, FnWrapper.alignRight)}
          </div>
        </div>
        <div className="tool-btns-row">
          <div className="half-row left">
            {this.renderToolBtn(LANG.group, 'img/right-panel/icon-group.svg', false, () => svgCanvas.groupSelectedElements())}
            {this.renderToolBtn(LANG.ungroup, 'img/right-panel/icon-ungroup.svg', !buttonAvailability.ungroup, () => svgCanvas.ungroupSelectedElement())}
          </div>
          <div className="half-row right">
            {this.renderToolBtn(LANG.union, 'img/right-panel/icon-union.svg', !buttonAvailability.union, () => svgCanvas.booleanOperationSelectedElements('union'))}
            {this.renderToolBtn(LANG.subtract, 'img/right-panel/icon-subtract.svg', !buttonAvailability.subtract, () => svgCanvas.booleanOperationSelectedElements('diff'))}
            {this.renderToolBtn(LANG.intersect, 'img/right-panel/icon-intersect.svg', !buttonAvailability.intersect, () => svgCanvas.booleanOperationSelectedElements('intersect'))}
            {this.renderToolBtn(LANG.difference, 'img/right-panel/icon-diff.svg', !buttonAvailability.difference, () => svgCanvas.booleanOperationSelectedElements('xor'))}
          </div>
        </div>
      </div>
    );
  };

  renderToolBtn = (
    label: string, src: string, disabled: boolean, onClick = () => {},
  ): JSX.Element => {
    const className = classNames('tool-btn', { disabled });
    return (
      <div className={className} onClick={disabled ? null : onClick} title={label}>
        <img src={src} draggable={false} />
      </div>
    );
  };

  renderDimensionPanel = (): JSX.Element => {
    const { updateDimensionValues, getDimensionValues } = this.context;
    const { elem } = this.props;
    return (
      <DimensionPanel
        elem={elem}
        updateDimensionValues={updateDimensionValues}
        getDimensionValues={getDimensionValues}
      />
    );
  };

  renderOptionPanel = (): JSX.Element => {
    const { dimensionValues, updateDimensionValues, updateObjectPanel } = this.context;
    const { elem } = this.props;
    return (
      <OptionsPanel
        elem={elem}
        rx={dimensionValues.rx}
        updateObjectPanel={updateObjectPanel}
        updateDimensionValues={updateDimensionValues}
      />
    );
  };

  renderActionPanel = (): JSX.Element => {
    const { elem } = this.props;
    return (
      <ActionsPanel
        elem={elem}
      />
    );
  };

  render(): JSX.Element {
    return (
      <div id="object-panel">
        {this.renderToolBtns()}
        {this.renderDimensionPanel()}
        {this.renderOptionPanel()}
        {this.renderActionPanel()}
      </div>
    );
  }
}

ObjectPanel.contextType = ObjectPanelContext;
