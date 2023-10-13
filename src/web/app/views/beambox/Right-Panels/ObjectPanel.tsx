import classNames from 'classnames';
import Icon from '@ant-design/icons';
import React, { useContext } from 'react';
import { Button, ConfigProvider } from 'antd';

import ActionsPanel from 'app/views/beambox/Right-Panels/ActionsPanel';
import ConfigPanel from 'app/views/beambox/Right-Panels/ConfigPanel/ConfigPanel';
import dialogCaller from 'app/actions/dialog-caller';
import DimensionPanel from 'app/views/beambox/Right-Panels/DimensionPanel';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import i18n from 'helpers/i18n';
import ObjectPanelIcon from 'app/icons/object-panel/ObjectPanelIcons';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import OptionsPanel from 'app/views/beambox/Right-Panels/OptionsPanel';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { iconButtonTheme } from 'app/views/beambox/Right-Panels/antd-config';
import { ObjectPanelContext } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';
import { useIsMobile } from 'helpers/system-helper';

import styles from './ObjectPanel.module.scss';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgEditor = globalSVG.Editor;
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
      group: !isMobile || elems?.length > 1,
      ungroup:
        elems?.length === 1 &&
        elems[0].tagName.toLowerCase() === 'g' &&
        !elem.getAttribute('data-textpath-g'),
      dist: elems?.length > 2,
      boolean: elems?.length > 1 && elems?.every(allowBooleanOperations),
      union: elems?.length > 1 && elems?.every(allowBooleanOperations),
      subtract: elems?.length === 2 && elems?.every(allowBooleanOperations),
      intersect: elems?.length > 1 && elems?.every(allowBooleanOperations),
      difference: elems?.length > 1 && elems?.every(allowBooleanOperations),
    };
  };

  const renderToolBtn = (
    label: string,
    icon: JSX.Element,
    disabled: boolean,
    onClick: () => void,
    id: string
  ): JSX.Element => (
    <Button type="text" id={id} icon={icon} onClick={onClick} disabled={disabled} title={label} />
  );

  const renderCommonActionPanel = (): JSX.Element => (
    <div className={styles.tools}>
      <ObjectPanelItem.Item
        id="delete"
        content={<ObjectPanelIcon.Trash />}
        label={i18n.lang.topbar.menu.delete}
        onClick={svgEditor.deleteSelected}
      />
      <ObjectPanelItem.Item
        id="duplicate"
        content={<ObjectPanelIcon.Duplicate />}
        label={i18n.lang.topbar.menu.duplicate}
        onClick={() => svgCanvas.cloneSelectedElements(20, 20)}
      />
      <ObjectPanelItem.Item
        id="parameter"
        content={<ObjectPanelIcon.Parameter />}
        label={i18n.lang.beambox.right_panel.laser_panel.parameters}
        onClick={() => {
          dialogCaller.addDialogComponent('config-panel', <ConfigPanel UIType="modal" />);
        }}
        autoClose={false}
      />
    </div>
  );

  const renderToolBtns = (): JSX.Element => {
    const buttonAvailability = getAvailableFunctions();
    return isMobile ? (
      <div className={styles.tools}>
        <ObjectPanelItem.Divider />
        <ObjectPanelItem.Item
          id="group"
          content={<ObjectPanelIcon.Group />}
          label={LANG.group}
          onClick={svgCanvas.groupSelectedElements}
          disabled={!buttonAvailability.group}
        />
        <ObjectPanelItem.Item
          id="ungroup"
          content={<ObjectPanelIcon.Ungroup />}
          label={LANG.ungroup}
          onClick={svgCanvas.ungroupSelectedElement}
          disabled={!buttonAvailability.ungroup}
        />
        <ObjectPanelItem.ActionList
          id="align"
          actions={[
            {
              icon: <Icon component={ObjectPanelIcon.ValignTop} />,
              label: LANG.top_align,
              onClick: FnWrapper.alignTop,
            },
            {
              icon: <Icon component={ObjectPanelIcon.ValignMid} />,
              label: LANG.middle_align,
              onClick: FnWrapper.alignMiddle,
            },
            {
              icon: <Icon component={ObjectPanelIcon.ValignBot} />,
              label: LANG.bottom_align,
              onClick: FnWrapper.alignBottom,
            },
            {
              icon: <Icon component={ObjectPanelIcon.HalignLeft} />,
              label: LANG.left_align,
              onClick: FnWrapper.alignLeft,
            },
            {
              icon: <Icon component={ObjectPanelIcon.HalignMid} />,
              label: LANG.center_align,
              onClick: FnWrapper.alignCenter,
            },
            {
              icon: <Icon component={ObjectPanelIcon.HalignRight} />,
              label: LANG.right_align,
              onClick: FnWrapper.alignRight,
            },
          ]}
          content={<ObjectPanelIcon.ValignMid />}
          label={LANG.align}
        />
        <ObjectPanelItem.ActionList
          id="distribute"
          actions={[
            {
              icon: <Icon component={ObjectPanelIcon.Distribute} rotate={90} />,
              label: LANG.hdist,
              onClick: svgCanvas.distHori,
            },
            {
              icon: <Icon component={ObjectPanelIcon.Distribute} />,
              label: LANG.vdist,
              onClick: svgCanvas.distVert,
            },
          ]}
          content={<ObjectPanelIcon.Distribute />}
          label={LANG.distribute}
          disabled={!buttonAvailability.dist}
        />
        <ObjectPanelItem.ActionList
          id="boolean"
          actions={[
            {
              icon: <Icon component={ObjectPanelIcon.Union} />,
              label: LANG.union,
              onClick: () => svgCanvas.booleanOperationSelectedElements('union'),
              disabled: !buttonAvailability.union,
            },
            {
              icon: <Icon component={ObjectPanelIcon.Subtract} />,
              label: LANG.subtract,
              onClick: () => svgCanvas.booleanOperationSelectedElements('diff'),
              disabled: !buttonAvailability.subtract,
            },
            {
              icon: <Icon component={ObjectPanelIcon.Intersect} />,
              label: LANG.intersect,
              onClick: () => svgCanvas.booleanOperationSelectedElements('intersect'),
              disabled: !buttonAvailability.intersect,
            },
            {
              icon: <Icon component={ObjectPanelIcon.Diff} />,
              label: LANG.difference,
              onClick: () => svgCanvas.booleanOperationSelectedElements('xor'),
              disabled: !buttonAvailability.difference,
            },
          ]}
          content={<ObjectPanelIcon.Union />}
          label={LANG.boolean}
          disabled={!buttonAvailability.boolean}
        />
      </div>
    ) : (
      <div className={styles.tools}>
        <ConfigProvider theme={iconButtonTheme}>
          <div className={styles.row}>
            <div className={classNames(styles.half, styles.left, styles.sep)}>
              {renderToolBtn(
                LANG.hdist,
                <ObjectPanelIcon.HDist />,
                !buttonAvailability.dist,
                svgCanvas.distHori,
                'hdist'
              )}
              {renderToolBtn(
                LANG.top_align,
                <ObjectPanelIcon.VAlignTop />,
                false,
                FnWrapper.alignTop,
                'top_align'
              )}
              {renderToolBtn(
                LANG.middle_align,
                <ObjectPanelIcon.VAlignMid />,
                false,
                FnWrapper.alignMiddle,
                'middle_align'
              )}
              {renderToolBtn(
                LANG.bottom_align,
                <ObjectPanelIcon.VAlignBot />,
                false,
                FnWrapper.alignBottom,
                'bottom_align'
              )}
            </div>
            <div className={classNames(styles.half, styles.right)}>
              {renderToolBtn(
                LANG.vdist,
                <ObjectPanelIcon.VDist />,
                !buttonAvailability.dist,
                svgCanvas.distVert,
                'vdist'
              )}
              {renderToolBtn(
                LANG.left_align,
                <ObjectPanelIcon.HAlignLeft />,
                false,
                FnWrapper.alignLeft,
                'left_align'
              )}
              {renderToolBtn(
                LANG.center_align,
                <ObjectPanelIcon.HAlignMid />,
                false,
                FnWrapper.alignCenter,
                'center_align'
              )}
              {renderToolBtn(
                LANG.right_align,
                <ObjectPanelIcon.HAlignRight />,
                false,
                FnWrapper.alignRight,
                'right_align'
              )}
            </div>
          </div>
          <div className={styles.row}>
            <div className={classNames(styles.half, styles.left)}>
              {renderToolBtn(
                LANG.group,
                <ObjectPanelIcon.Group />,
                false,
                () => svgCanvas.groupSelectedElements(),
                'group'
              )}
              {renderToolBtn(
                LANG.ungroup,
                <ObjectPanelIcon.Ungroup />,
                !buttonAvailability.ungroup,
                () => svgCanvas.ungroupSelectedElement(),
                'ungroup'
              )}
            </div>
            <div className={classNames(styles.half, styles.right)}>
              {renderToolBtn(
                LANG.union,
                <ObjectPanelIcon.Union />,
                !buttonAvailability.union,
                () => svgCanvas.booleanOperationSelectedElements('union'),
                'union'
              )}
              {renderToolBtn(
                LANG.subtract,
                <ObjectPanelIcon.Subtract />,
                !buttonAvailability.subtract,
                () => svgCanvas.booleanOperationSelectedElements('diff'),
                'subtract'
              )}
              {renderToolBtn(
                LANG.intersect,
                <ObjectPanelIcon.Intersect />,
                !buttonAvailability.intersect,
                () => svgCanvas.booleanOperationSelectedElements('intersect'),
                'intersect'
              )}
              {renderToolBtn(
                LANG.difference,
                <ObjectPanelIcon.Diff />,
                !buttonAvailability.difference,
                () => svgCanvas.booleanOperationSelectedElements('xor'),
                'difference'
              )}
            </div>
          </div>
        </ConfigProvider>
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

  return (
    <div id="object-panel" className={styles.container}>
      {isMobile ? (
        <>
          {renderCommonActionPanel()}
          {renderOptionPanel()}
          {renderDimensionPanel()}
          {renderToolBtns()}
          {renderActionPanel()}
        </>
      ) : (
        <>
          {renderToolBtns()}
          {renderDimensionPanel()}
          {renderOptionPanel()}
          {renderActionPanel()}
        </>
      )}
    </div>
  );
}

export default ObjectPanel;
