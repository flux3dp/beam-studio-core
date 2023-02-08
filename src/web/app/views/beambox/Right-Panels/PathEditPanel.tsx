import * as React from 'react';

import i18n from 'helpers/i18n';
import SegmentedControl from 'app/widgets/SegmentedControl';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { Button, Divider, Space } from 'antd';
import { ISVGPath } from 'interfaces/ISVGPath';
import ISVGCanvas from 'interfaces/ISVGCanvas';

let svgedit;
let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => { svgedit = globalSVG.Edit; svgCanvas = globalSVG.Canvas; });

const LANG = i18n.lang.beambox.right_panel.object_panel.path_edit_panel;

const LINKTYPE_CORNER = 0;
const LINKTYPE_SMOOTH = 1; // same direction, different dist
const LINKTYPE_SYMMETRIC = 2; // same direction, same dist

function PathEditPanel(): JSX.Element {
  const onNodeTypeChange = (newType) => {
    svgedit.path.path.setSelectedNodeType(newType);
  };

  const currentPath: ISVGPath = svgedit.path.path;
  let containsSharpNodes = false;
  let containsRoundNodes = false;
  const isDisabled = (!currentPath || currentPath.selected_pts.length === 0);
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

  const canDisconnect = selectedNodes?.length === 1 && selectedNodes[0].prev && selectedNodes[0].next;
  return (
    <div id="pathedit-panel">
      <div className="node-type-panel">
        <div className="title">{LANG.node_type}</div>
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
        <Divider />
        <Space>
          <Button disabled={!containsRoundNodes} onClick={() => svgCanvas.pathActions.setSharp()} size="small">
            Sharp
          </Button>
          <Button disabled={!containsSharpNodes} onClick={() => svgCanvas.pathActions.setRound()} size="small">
            Round
          </Button>
          <Button
            disabled={selectedNodes?.length !== 2}
            onClick={() => svgCanvas.pathActions.connectNodes()}
            size="small"
          >
            Connect
          </Button>
          <Button
            disabled={!canDisconnect}
            onClick={svgCanvas.pathActions.disconnectNode}
            size="small"
          >
            Disconnect
          </Button>
        </Space>
      </div>
    </div>
  );
}

export default PathEditPanel;
