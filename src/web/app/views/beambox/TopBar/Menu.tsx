import React from 'react';
import {
  Menu as TopBarMenu,
  MenuItem,
  MenuDivider,
  SubMenu,
} from '@szhsin/react-menu';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import eventEmitterFactory from 'helpers/eventEmitterFactory';

export default function Menu(): JSX.Element {
  const [shouldShowRulers, changeShouldShowRulers] = React.useState(BeamboxPreference.read('show_rulers'));
  const eventEmitter = eventEmitterFactory.createEventEmitter('top-bar-menu');
  const callback = (id: string) => {
    eventEmitter.emit('MENU_CLICK', null, {
      id,
    });
  };
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
          <MenuItem onClick={() => callback('IMPORT_EXAMPLE')}>Example of beamo</MenuItem>
          <MenuItem>Example of beambox</MenuItem>
          <MenuItem>Material Engraving Test</MenuItem>
          <MenuItem>Material Engraving Test - Classic</MenuItem>
          <MenuItem>Material Cutting Test</MenuItem>
          <MenuItem>Material Cutting Test - Classic</MenuItem>
          <MenuItem>Material Line Test</MenuItem>
        </SubMenu>
        <MenuDivider />
        <SubMenu label="Export To ...">
          <MenuItem onClick={() => callback('EXPORT_BVG')}>SVG</MenuItem>
          <MenuItem onClick={() => callback('EXPORT_SVG')}>SVG</MenuItem>
          <MenuItem onClick={() => callback('EXPORT_PNG')}>PNG</MenuItem>
          <MenuItem onClick={() => callback('EXPORT_JPG')}>JPG</MenuItem>
          <MenuItem onClick={() => callback('EXPORT_FLUX_TASK')}>FLUX task</MenuItem>
        </SubMenu>
      </SubMenu>
      <SubMenu label="Edit">
        <MenuItem onClick={() => callback('UNDO')}>Undo</MenuItem>
        <MenuItem onClick={() => callback('REDO')}>Redo</MenuItem>
        <MenuDivider />
        <MenuItem>Cut</MenuItem>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
        <MenuItem>Paste in Place</MenuItem>
        <MenuItem>Duplicate</MenuItem>
        <MenuDivider />
        <MenuItem onClick={() => callback('GROUP')}>Group</MenuItem>
        <MenuItem onClick={() => callback('UNGROUP')}>Ungroup</MenuItem>
        <MenuDivider />
        <SubMenu label="Path">
          <MenuItem>Offset</MenuItem>
          <MenuItem>Decompose Discrete Path</MenuItem>
        </SubMenu>
      </SubMenu>
      <SubMenu label="View">
        <MenuItem onClick={() => callback('ZOOM_IN')}>Zoom In</MenuItem>
        <MenuItem onClick={() => callback('ZOOM_OUT')}>Zoom Out</MenuItem>
        <MenuItem onClick={() => callback('FITS_TO_WINDOW')}>Fit to Window Size</MenuItem>
        <MenuItem onClick={() => callback('ZOOM_WITH_WINDOW')}>Auto Fit to Window Size</MenuItem>
        <MenuDivider />
        <MenuItem type="checkbox" onClick={() => callback('SHOW_GRIDS')} checked>Show Grids</MenuItem>
        <MenuItem
          type="checkbox"
          onClick={() => {
            callback('SHOW_RULERS');
            changeShouldShowRulers(!shouldShowRulers);
          }}
          checked={shouldShowRulers}
        >
          Show Rulers
        </MenuItem>
        <MenuItem type="checkbox" onClick={() => callback('SHOW_LAYER_COLOR')} checked>User Layer Color</MenuItem>
      </SubMenu>
    </TopBarMenu>
  );
}
