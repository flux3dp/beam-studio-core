import React from 'react';
import {
  Menu as TopBarMenu,
  MenuItem,
  MenuDivider,
  SubMenu,
} from '@szhsin/react-menu';

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
          <MenuItem>BVG</MenuItem>
          <MenuItem>SVG</MenuItem>
          <MenuItem>PNG</MenuItem>
          <MenuItem>JPG</MenuItem>
          <MenuItem>FLUX task</MenuItem>
        </SubMenu>
      </SubMenu>
      <SubMenu label="Edit">
        <MenuItem>Undo</MenuItem>
        <MenuItem>Redo</MenuItem>
        <MenuDivider />
        <MenuItem>Cut</MenuItem>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
        <MenuItem>Paste in Place</MenuItem>
        <MenuItem>Duplicate</MenuItem>
        <MenuDivider />
        <MenuItem>Group</MenuItem>
        <MenuItem>Ungroup</MenuItem>
        <MenuDivider />
        <SubMenu label="Path">
          <MenuItem>Offset</MenuItem>
          <MenuItem>Decompose Discrete Path</MenuItem>
        </SubMenu>
      </SubMenu>
      <SubMenu label="View">
        <MenuItem>Zoom In</MenuItem>
        <MenuItem>Zoom Out</MenuItem>
        <MenuItem>Fit to Window Size</MenuItem>
        <MenuItem>Auto Fit to Window Size</MenuItem>
        <MenuDivider />
        <MenuItem type="checkbox" checked>Show Grids</MenuItem>
        <MenuItem type="checkbox">Show Rulers</MenuItem>
        <MenuItem type="checkbox" checked>User Layer Color</MenuItem>
      </SubMenu>
    </TopBarMenu>
  );
}
