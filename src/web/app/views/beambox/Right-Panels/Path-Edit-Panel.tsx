import i18n from 'helpers/i18n';
import * as React from 'react';
import SegmentedControl from 'app/widgets/Segmented-Control';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas, svgedit;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; svgedit = globalSVG.Edit });

const LANG = i18n.lang.beambox.right_panel.object_panel.path_edit_panel;

const LINKTYPE_CORNER = 0;
const LINKTYPE_SMOOTH = 1; // same direction, different dist
const LINKTYPE_SYMMETRIC = 2; // same direction, same dist

class PathEditPanel extends React.Component<any, any> {
    onNodeTypeChange = (newType) => {
        svgedit.path.path.setSelectedNodeType(newType);
    }

  renderNodeTypePanel() {
    const currentPath = svgedit.path.path;
    let isDisabled = (!currentPath || currentPath.selected_pts.length === 0);
    let selectedNodeTypes = [];
    if (currentPath) {
      const selectedNodes = currentPath.selected_pts.map((index) => currentPath.nodePoints[index]).filter((point) => point);
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
          onChanged={(newType) => this.onNodeTypeChange(newType)}
          segments={[
            {
              imgSrc: 'img/right-panel/icon-nodetype-0.svg',
              title: 'tCorner',
              value: LINKTYPE_CORNER,
              id:'qa-tCorner-seg-item',
            },
            {
              imgSrc: 'img/right-panel/icon-nodetype-1.svg',
              title: 'tSmooth',
              value: LINKTYPE_SMOOTH,
              id:'qa-tSmooth-seg-item',
            },
            {
              imgSrc: 'img/right-panel/icon-nodetype-2.svg',
              title: 'tSymmetry',
              value: LINKTYPE_SYMMETRIC,
              id: 'qa-tSymmetry-seg-item',
            },
          ]}
        />
      </div>
    );
  }

  render() {
    return (
      <div id="pathedit-panel">
        {this.renderNodeTypePanel()}
      </div>
    );
  }
}

export default PathEditPanel;
