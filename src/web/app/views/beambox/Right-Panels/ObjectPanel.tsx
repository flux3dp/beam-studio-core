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

function ObjectPanel({ elem }: Props): JSX.Element {
  const context = React.useContext(ObjectPanelContext);

  const getAvailableFunctions = () => {
    if (!elem) {
      return {};
    }
    let elems = [elem];
    if (elems.length > 0 && elems[0].getAttribute('data-tempgroup') === 'true') {
      elems = Array.from(elems[0].childNodes) as Element[];
    }
    const allowBooleanOperations = (e: Element) => {
      if (['rect', 'polygon', 'ellipse'].includes(e.tagName.toLowerCase())) {
        return true;
      }
      return e.tagName.toLowerCase() === 'path' && svgCanvas.isElemFillable(e);
    };
    return {
      ungroup: elems && elems.length === 1 && ['g'].includes(elems[0].tagName.toLowerCase()) && !elem.getAttribute('data-textpath-g'),
      dist: elems && elems.length > 2,
      union: elems && elems.length > 1 && elems.every(allowBooleanOperations),
      subtract: elems && elems.length === 2 && elems.every(allowBooleanOperations),
      intersect: elems && elems.length > 1 && elems.every(allowBooleanOperations),
      difference: elems && elems.length > 1 && elems.every(allowBooleanOperations),
    };
  };

  const renderToolBtn = (
    label: string,
    src: string,
    disabled: boolean,
    onClick: () => void,
  ): JSX.Element => (
    <div className={classNames('tool-btn', { disabled })} onClick={disabled ? null : onClick} title={label}>
      <img src={src} draggable={false} />
    </div>
  );

  const renderToolBtns = (): JSX.Element => {
    const buttonAvailability = getAvailableFunctions();
    return (
      <div className="tool-btns-container">
        <div className="tool-btns-row">
          <div className="half-row left sep">
            {renderToolBtn(LANG.hdist, 'img/right-panel/icon-hdist.svg', !buttonAvailability.dist, svgCanvas.distHori)}
            {renderToolBtn(LANG.top_align, 'img/right-panel/icon-valign-top.svg', false, FnWrapper.alignTop)}
            {renderToolBtn(LANG.middle_align, 'img/right-panel/icon-valign-mid.svg', false, FnWrapper.alignMiddle)}
            {renderToolBtn(LANG.bottom_align, 'img/right-panel/icon-valign-bot.svg', false, FnWrapper.alignBottom)}
          </div>
          <div className="half-row right">
            {renderToolBtn(LANG.vdist, 'img/right-panel/icon-vdist.svg', !buttonAvailability.dist, svgCanvas.distVert)}
            {renderToolBtn(LANG.left_align, 'img/right-panel/icon-halign-left.svg', false, FnWrapper.alignLeft)}
            {renderToolBtn(LANG.center_align, 'img/right-panel/icon-halign-mid.svg', false, FnWrapper.alignCenter)}
            {renderToolBtn(LANG.right_align, 'img/right-panel/icon-halign-right.svg', false, FnWrapper.alignRight)}
          </div>
        </div>
        <div className="tool-btns-row">
          <div className="half-row left">
            {renderToolBtn(LANG.group, 'img/right-panel/icon-group.svg', false, () => svgCanvas.groupSelectedElements())}
            {renderToolBtn(LANG.ungroup, 'img/right-panel/icon-ungroup.svg', !buttonAvailability.ungroup, () => svgCanvas.ungroupSelectedElement())}
          </div>
          <div className="half-row right">
            {renderToolBtn(LANG.union, 'img/right-panel/icon-union.svg', !buttonAvailability.union, () => svgCanvas.booleanOperationSelectedElements('union'))}
            {renderToolBtn(LANG.subtract, 'img/right-panel/icon-subtract.svg', !buttonAvailability.subtract, () => svgCanvas.booleanOperationSelectedElements('diff'))}
            {renderToolBtn(LANG.intersect, 'img/right-panel/icon-intersect.svg', !buttonAvailability.intersect, () => svgCanvas.booleanOperationSelectedElements('intersect'))}
            {renderToolBtn(LANG.difference, 'img/right-panel/icon-diff.svg', !buttonAvailability.difference, () => svgCanvas.booleanOperationSelectedElements('xor'))}
          </div>
        </div>
      </div>
    );
  };

  const renderDimensionPanel = (): JSX.Element => {
    const { updateDimensionValues, getDimensionValues } = context;
    return (
      <DimensionPanel
        elem={elem}
        updateDimensionValues={updateDimensionValues}
        getDimensionValues={getDimensionValues}
      />
    );
  };

  const renderOptionPanel = (): JSX.Element => {
    const {
      polygonSides,
      dimensionValues,
      updateDimensionValues,
      updateObjectPanel,
    } = context;
    return (
      <OptionsPanel
        elem={elem}
        rx={dimensionValues.rx}
        polygonSides={polygonSides}
        updateObjectPanel={updateObjectPanel}
        updateDimensionValues={updateDimensionValues}
      />
    );
  };

  const renderActionPanel = (): JSX.Element => (
    <ActionsPanel
      elem={elem}
    />
  );

  return (
    <div id="object-panel">
      {renderToolBtns()}
      {renderDimensionPanel()}
      {renderOptionPanel()}
      {renderActionPanel()}
    </div>
  );
}

export default ObjectPanel;
