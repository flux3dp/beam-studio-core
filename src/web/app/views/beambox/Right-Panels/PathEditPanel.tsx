import * as React from 'react';

import i18n from 'helpers/i18n';
import SegmentedControl from 'app/widgets/SegmentedControl';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgedit;
getSVGAsync((globalSVG) => { svgedit = globalSVG.Edit; });

const LANG = i18n.lang.beambox.right_panel.object_panel.path_edit_panel;

const LINKTYPE_CORNER = 0;
const LINKTYPE_SMOOTH = 1; // same direction, different dist
const LINKTYPE_SYMMETRIC = 2; // same direction, same dist

function PathEditPanel(): JSX.Element {
  const onNodeTypeChange = (newType) => {
    svgedit.path.path.setSelectedNodeType(newType);
  };

  const renderNodeTypePanel = (): JSX.Element => {
    const currentPath = svgedit.path.path;
    const isDisabled = (!currentPath || currentPath.selected_pts.length === 0);
    let selectedNodeTypes = [];
    if (currentPath) {
      const selectedNodes = currentPath.selected_pts
        .map((index) => currentPath.nodePoints[index])
        .filter((point) => point);
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
    return (
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
      </div>
    );
  };

  return (
    <div id="pathedit-panel">
      {renderNodeTypePanel()}
    </div>
  );
}

export default PathEditPanel;
