import classNames from 'classnames';
import React, { useContext } from 'react';

import ActionsPanel from 'app/views/beambox/Right-Panels/ActionsPanel';
import DimensionPanel from 'app/views/beambox/Right-Panels/DimensionPanel';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import i18n from 'helpers/i18n';
import OptionsPanel from 'app/views/beambox/Right-Panels/OptionsPanel';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { ObjectPanelContext } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';
import { useIsMobile } from 'helpers/system-helper';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});
const LANG = i18n.lang.beambox.right_panel.object_panel;

interface Props {
  elem: Element;
}

function ObjectPanel({ elem }: Props): JSX.Element {
  const isMobile = useIsMobile();
  const context = useContext(ObjectPanelContext);

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
      ungroup: elems?.length === 1 && elems[0].tagName.toLowerCase() === 'g' && !elem.getAttribute('data-textpath-g'),
      dist: elems?.length > 2,
      union: elems?.length > 1 && elems?.every(allowBooleanOperations),
      subtract: elems?.length === 2 && elems?.every(allowBooleanOperations),
      intersect: elems?.length > 1 && elems?.every(allowBooleanOperations),
      difference: elems?.length > 1 && elems?.every(allowBooleanOperations),
    };
  };

  const renderToolBtn = (
    label: string,
    src: string,
    disabled: boolean,
    onClick: () => void,
    id: string
  ): JSX.Element => (
    <div
      id={id}
      className={classNames('tool-btn', { disabled })}
      onClick={disabled ? null : onClick}
      title={label}
    >
      <img src={src} draggable={false} />
    </div>
  );

  const renderToolBtns = (): JSX.Element => {
    const buttonAvailability = getAvailableFunctions();
    return (
      <div className="tool-btns-container">
        <div className="tool-btns-row">
          <div className="half-row left sep">
            {renderToolBtn(
              LANG.hdist,
              'img/right-panel/icon-hdist.svg',
              !buttonAvailability.dist,
              svgCanvas.distHori,
              'hdist'
            )}
            {renderToolBtn(
              LANG.top_align,
              'img/right-panel/icon-valign-top.svg',
              false,
              FnWrapper.alignTop,
              'top_align'
            )}
            {renderToolBtn(
              LANG.middle_align,
              'img/right-panel/icon-valign-mid.svg',
              false,
              FnWrapper.alignMiddle,
              'middle_align'
            )}
            {renderToolBtn(
              LANG.bottom_align,
              'img/right-panel/icon-valign-bot.svg',
              false,
              FnWrapper.alignBottom,
              'bottom_align'
            )}
          </div>
          <div className="half-row right">
            {renderToolBtn(
              LANG.vdist,
              'img/right-panel/icon-vdist.svg',
              !buttonAvailability.dist,
              svgCanvas.distVert,
              'vdist'
            )}
            {renderToolBtn(
              LANG.left_align,
              'img/right-panel/icon-halign-left.svg',
              false,
              FnWrapper.alignLeft,
              'left_align'
            )}
            {renderToolBtn(
              LANG.center_align,
              'img/right-panel/icon-halign-mid.svg',
              false,
              FnWrapper.alignCenter,
              'center_align'
            )}
            {renderToolBtn(
              LANG.right_align,
              'img/right-panel/icon-halign-right.svg',
              false,
              FnWrapper.alignRight,
              'right_align'
            )}
          </div>
        </div>
        <div className="tool-btns-row">
          <div className="half-row left">
            {renderToolBtn(
              LANG.group,
              'img/right-panel/icon-group.svg',
              false,
              () => svgCanvas.groupSelectedElements(),
              'group'
            )}
            {renderToolBtn(
              LANG.ungroup,
              'img/right-panel/icon-ungroup.svg',
              !buttonAvailability.ungroup,
              () => svgCanvas.ungroupSelectedElement(),
              'ungroup'
            )}
          </div>
          <div className="half-row right">
            {renderToolBtn(
              LANG.union,
              'img/right-panel/icon-union.svg',
              !buttonAvailability.union,
              () => svgCanvas.booleanOperationSelectedElements('union'),
              'union'
            )}
            {renderToolBtn(
              LANG.subtract,
              'img/right-panel/icon-subtract.svg',
              !buttonAvailability.subtract,
              () => svgCanvas.booleanOperationSelectedElements('diff'),
              'subtract'
            )}
            {renderToolBtn(
              LANG.intersect,
              'img/right-panel/icon-intersect.svg',
              !buttonAvailability.intersect,
              () => svgCanvas.booleanOperationSelectedElements('intersect'),
              'intersect'
            )}
            {renderToolBtn(
              LANG.difference,
              'img/right-panel/icon-diff.svg',
              !buttonAvailability.difference,
              () => svgCanvas.booleanOperationSelectedElements('xor'),
              'difference'
            )}
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
    const { polygonSides, dimensionValues, updateDimensionValues, updateObjectPanel } = context;
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

  const renderActionPanel = (): JSX.Element => <ActionsPanel elem={elem} />;

  if (isMobile) {
    return (
      <div id="object-panel">
        {renderOptionPanel()}
        {renderDimensionPanel()}
        {renderToolBtns()}
        {renderActionPanel()}
      </div>
    );
  }

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
