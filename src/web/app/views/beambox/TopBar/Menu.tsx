import React from 'react';
import {
  Menu as TopBarMenu,
  MenuItem,
  MenuDivider,
  SubMenu,
} from '@szhsin/react-menu';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import ExportFuncs from 'app/actions/beambox/export-funcs';
import FileExportHelper from 'helpers/file-export-helper';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgEditor;
getSVGAsync((globalSVG) => {
  svgEditor = globalSVG.Editor;
});

export default function Menu(): JSX.Element {
  return (
    <TopBarMenu menuButton={(
      <img
        src="img/top-bar/icon.png"
        style={{
          width: '40px',
        }}
      />
    )}
    >
      <SubMenu label="File">
        <MenuItem>Open</MenuItem>
        <MenuItem>Open Recent</MenuItem>
        <MenuDivider />
        <MenuItem>Save</MenuItem>
        <MenuItem>Save As...</MenuItem>
        <MenuDivider />
        <SubMenu label="Examples">
          <MenuItem>Example of beamo</MenuItem>
          <MenuItem>Example of beambox</MenuItem>
          <MenuItem>Material Engraving Test</MenuItem>
          <MenuItem>Material Engraving Test - Classic</MenuItem>
          <MenuItem>Material Cutting Test</MenuItem>
          <MenuItem>Material Cutting Test - Classic</MenuItem>
          <MenuItem>Material Line Test</MenuItem>
        </SubMenu>
        <MenuDivider />
        <SubMenu label="Export To ...">
          <MenuItem onClick={() => {
            FileExportHelper.exportAsBVG().then((value) => value);
          }}
          >
            BVG
          </MenuItem>
          <MenuItem onClick={() => FileExportHelper.exportAsSVG()}>SVG</MenuItem>
          <MenuItem onClick={() => FileExportHelper.exportAsImage('png')}>PNG</MenuItem>
          <MenuItem onClick={() => FileExportHelper.exportAsImage('jpg')}>JPG</MenuItem>
          <MenuItem onClick={() => ExportFuncs.exportFcode()}>FLUX task</MenuItem>
        </SubMenu>
      </SubMenu>
      <SubMenu label="Edit">
        <MenuItem onClick={() => svgEditor.clickUndo()}>Undo</MenuItem>
        <MenuItem onClick={() => svgEditor.clickRedo()}>Redo</MenuItem>
        <MenuDivider />
        <MenuItem>Cut</MenuItem>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
        <MenuItem>Paste in Place</MenuItem>
        <MenuItem>Duplicate</MenuItem>
        <MenuDivider />
        <MenuItem onClick={() => FnWrapper.groupSelected()}>Group</MenuItem>
        <MenuItem onClick={() => FnWrapper.ungroupSelected()}>Ungroup</MenuItem>
        <MenuDivider />
        <SubMenu label="Path">
          <MenuItem>Offset</MenuItem>
          <MenuItem>Decompose Discrete Path</MenuItem>
        </SubMenu>
      </SubMenu>
      <SubMenu label="View">
        <MenuItem onClick={() => svgEditor.zoomIn()}>Zoom In</MenuItem>
        <MenuItem onClick={() => svgEditor.zoomOut()}>Zoom Out</MenuItem>
        <MenuItem onClick={() => svgEditor.resetView()}>Fit to Window Size</MenuItem>
        {/* <MenuItem>Auto Fit to Window Size</MenuItem> */}
        <MenuDivider />
        <MenuItem type="checkbox" checked>Show Grids</MenuItem>
        <MenuItem
          type="checkbox"
          onClick={() => {
            const shouldShowRulers = !BeamboxPreference.read('show_rulers');
            // updateCheckbox(['_view', 'SHOW_RULERS'], shouldShowRulers);
            document.getElementById('rulers').style.display = shouldShowRulers ? '' : 'none';
            if (shouldShowRulers) {
              svgEditor.updateRulers();
            }
            BeamboxPreference.write('show_rulers', shouldShowRulers);
          }}
        >
          Show Rulers
        </MenuItem>
        <MenuItem type="checkbox" checked>User Layer Color</MenuItem>
      </SubMenu>
    </TopBarMenu>
  );
}
