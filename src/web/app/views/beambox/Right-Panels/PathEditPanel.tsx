import * as React from 'react';
import { Button, Divider, Space } from 'antd';

import FloatingPanel from 'app/widgets/FloatingPanel';
import i18n from 'helpers/i18n';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import SegmentedControl from 'app/widgets/SegmentedControl';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { ISVGPath } from 'interfaces/ISVGPath';
import {
  PathConnectIcon,
  PathDisconnectIcon,
  PathRoundIcon,
  PathSharpIcon,
  TrashIcon,
} from 'app/icons/icons';
import { useIsMobile } from 'helpers/system-helper';

import styles from './PathEditPanel.module.scss';

let svgedit;
let svgEditor;
let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgedit = globalSVG.Edit;
  svgEditor = globalSVG.Editor;
  svgCanvas = globalSVG.Canvas;
});

const LANG = i18n.lang.beambox.right_panel.object_panel.path_edit_panel;

const LINKTYPE_CORNER = 0;
const LINKTYPE_SMOOTH = 1; // same direction, different dist
const LINKTYPE_SYMMETRIC = 2; // same direction, same dist

const PanelContent = ({ isMobile = false }: { isMobile?: boolean }) => {
  const onNodeTypeChange = (newType) => {
    svgedit.path.path.setSelectedNodeType(newType);
  };

  const currentPath: ISVGPath = svgedit.path.path;
  let containsSharpNodes = false;
  let containsRoundNodes = false;
  const isDisabled = !currentPath || currentPath.selected_pts.length === 0;
  let selectedNodeTypes = [];
  const selectedNodes = currentPath?.selected_pts
    .map((index) => currentPath.nodePoints[index])
    .filter((point) => point);
  if (currentPath) {
    containsSharpNodes = selectedNodes.some((node) => node.isSharp());
    containsRoundNodes = selectedNodes.some((node) => node.isRound());
    selectedNodes.forEach((node) => {
      if (node) {
        selectedNodeTypes.push(node.linkType);
      }
    });
    selectedNodeTypes = [...new Set(selectedNodeTypes)];
    selectedNodeTypes.sort();
    if (selectedNodeTypes.length > 1) {
      selectedNodeTypes = [];
    }
  }

  const canConnect = selectedNodes?.length === 2 && selectedNodes.every((point) => !point.prevSeg || !point.nextSeg);
  const canDisconnect = selectedNodes?.length === 1 && selectedNodes[0].prev && selectedNodes[0].next;
  const canDelete = selectedNodes?.length > 0;
  const buttonShape = isMobile ? 'round' : 'default';

  return (
    <div className={styles['node-type-panel']}>
      {!isMobile && <div className={styles.title}>{LANG.node_type}</div>}
      <SegmentedControl
        isDisabled={isDisabled}
        selectedIndexes={selectedNodeTypes}
        onChanged={(newType) => onNodeTypeChange(newType)}
        segments={[
          {
            imgSrc: 'img/right-panel/icon-nodetype-0.svg',
            title: 'tCorner',
            value: LINKTYPE_CORNER,
            id: 'tCorner-seg-item',
          },
          {
            imgSrc: 'img/right-panel/icon-nodetype-1.svg',
            title: 'tSmooth',
            value: LINKTYPE_SMOOTH,
            id: 'tSmooth-seg-item',
          },
          {
            imgSrc: 'img/right-panel/icon-nodetype-2.svg',
            title: 'tSymmetry',
            value: LINKTYPE_SYMMETRIC,
            id: 'tSymmetry-seg-item',
          },
        ]}
      />
      <Divider className={styles.divider} />
      <Space className={styles.actions} wrap>
        <Button
          disabled={!containsRoundNodes}
          onClick={() => svgCanvas.pathActions.setSharp()}
          size="small"
          shape={buttonShape}
          block={isMobile}
        >
          <PathSharpIcon />
          Sharp
        </Button>
        <Button
          disabled={!containsSharpNodes}
          onClick={() => svgCanvas.pathActions.setRound()}
          size="small"
          shape={buttonShape}
          block={isMobile}
        >
          <PathRoundIcon />
          Round
        </Button>
        <Button
          disabled={!canConnect}
          onClick={svgCanvas.pathActions.connectNodes}
          size="small"
          shape={buttonShape}
          block={isMobile}
        >
          <PathConnectIcon />
          Connect
        </Button>
        <Button
          disabled={!canDisconnect}
          onClick={svgCanvas.pathActions.disconnectNode}
          size="small"
          shape={buttonShape}
          block={isMobile}
        >
          <PathDisconnectIcon />
          Disconnect
        </Button>
        {isMobile && (
          <Button
            disabled={!canDelete}
            onClick={svgEditor.deleteSelected}
            size="small"
            shape={buttonShape}
            block={isMobile}
          >
            <TrashIcon />
            Delete
          </Button>
        )}
      </Space>
    </div>
  );
};

function PathEditPanel(): JSX.Element {
  const isMobile = useIsMobile();
  if (!svgCanvas || !svgedit) return null;

  return isMobile ? (
    <FloatingPanel
      className={styles.panel}
      anchors={[0, 280]}
      title={i18n.lang.beambox.right_panel.tabs.path_edit}
      onClose={svgCanvas.pathActions.toSelectMode}
    >
      <PanelContent isMobile />
    </FloatingPanel>
  ) : (
    <div id="pathedit-panel" className={styles.panel}>
      <PanelContent />
    </div>
  );
}

export default PathEditPanel;
