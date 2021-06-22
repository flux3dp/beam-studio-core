import React from 'react';
import {
  Menu as TopBarMenu,
  MenuItem,
  MenuDivider,
  SubMenu,
} from '@szhsin/react-menu';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import i18n from 'helpers/i18n';

export default function Menu(): JSX.Element {
  const menuCms = i18n.lang.topbar.menu;
  const [shouldShowRulers, changeShouldShowRulers] = React.useState(BeamboxPreference.read('show_rulers'));
  const [shouldShowGrids, changeShouldShowGrids] = React.useState(true);
  const [shouldUseLayerColor, changeShouldUseLayerColor] = React.useState(BeamboxPreference.read('use_layer_color'));
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
      <SubMenu label={menuCms.file}>
        <MenuItem>{menuCms.open}</MenuItem>
        <MenuItem>{menuCms.recent}</MenuItem>
        <MenuDivider />
        <MenuItem>{menuCms.save_scene}</MenuItem>
        <MenuItem>{menuCms.save_as}</MenuItem>
        <MenuDivider />
        <SubMenu label={menuCms.samples}>
          <MenuItem onClick={() => callback('IMPORT_EXAMPLE')}>{menuCms.import_hello_beamo}</MenuItem>
          <MenuItem>{menuCms.import_hello_beambox}</MenuItem>
          <MenuItem>{menuCms.import_material_testing_engrave}</MenuItem>
          <MenuItem>{menuCms.import_material_testing_old}</MenuItem>
          <MenuItem>{menuCms.import_material_testing_cut}</MenuItem>
          <MenuItem>{menuCms.import_material_testing_simple_cut}</MenuItem>
          <MenuItem>{menuCms.import_material_testing_line}</MenuItem>
        </SubMenu>
        <MenuDivider />
        <SubMenu label={menuCms.export_to}>
          <MenuItem onClick={() => callback('EXPORT_BVG')}>{menuCms.export_BVG}</MenuItem>
          <MenuItem onClick={() => callback('EXPORT_SVG')}>{menuCms.export_SVG}</MenuItem>
          <MenuItem onClick={() => callback('EXPORT_FLUX_TASK')}>{menuCms.export_flux_task}</MenuItem>
        </SubMenu>
        <MenuDivider />
        <MenuItem>{menuCms.preferences}</MenuItem>
      </SubMenu>
      <SubMenu label={menuCms.edit}>
        <MenuItem onClick={() => callback('UNDO')}>{menuCms.undo}</MenuItem>
        <MenuItem onClick={() => callback('REDO')}>{menuCms.redo}</MenuItem>
        <MenuDivider />
        <MenuItem onClick={() => callback('CUT')}>{menuCms.cut}</MenuItem>
        <MenuItem onClick={() => callback('COPY')}>{menuCms.copy}</MenuItem>
        <MenuItem onClick={() => callback('PASTE')}>{menuCms.paste}</MenuItem>
        <MenuItem onClick={() => callback('PASTE_IN_PLACE')}>{menuCms.paste_in_place}</MenuItem>
        <MenuItem onClick={() => callback('DUPLICATE')}>{menuCms.duplicate}</MenuItem>
        <MenuDivider />
        <MenuItem onClick={() => callback('GROUP')}>{menuCms.group}</MenuItem>
        <MenuItem onClick={() => callback('UNGROUP')}>{menuCms.ungroup}</MenuItem>
        <MenuDivider />
        <SubMenu label={menuCms.path}>
          <MenuItem onClick={() => callback('OFFSET')}>{menuCms.offset}</MenuItem>
          <MenuItem onClick={() => callback('DECOMPOSE_PATH')}>{menuCms.decompose_path}</MenuItem>
        </SubMenu>
      </SubMenu>
      <SubMenu label={menuCms.view}>
        <MenuItem onClick={() => callback('ZOOM_IN')}>{menuCms.zoom_in}</MenuItem>
        <MenuItem onClick={() => callback('ZOOM_OUT')}>{menuCms.zoom_out}</MenuItem>
        <MenuItem onClick={() => callback('FITS_TO_WINDOW')}>{menuCms.fit_to_window}</MenuItem>
        <MenuItem onClick={() => callback('ZOOM_WITH_WINDOW')}>{menuCms.zoom_with_window}</MenuItem>
        <MenuDivider />
        <MenuItem
          type="checkbox"
          onClick={() => {
            callback('SHOW_GRIDS');
            changeShouldShowGrids(!shouldShowGrids);
          }}
          checked={shouldShowGrids}
        >
          {menuCms.show_grids}
        </MenuItem>
        <MenuItem
          type="checkbox"
          onClick={() => {
            callback('SHOW_RULERS');
            changeShouldShowRulers(!shouldShowRulers);
          }}
          checked={shouldShowRulers}
        >
          {menuCms.show_rulers}
        </MenuItem>
        <MenuItem
          type="checkbox"
          onClick={() => {
            callback('SHOW_LAYER_COLOR');
            changeShouldUseLayerColor(!shouldUseLayerColor);
          }}
          checked={shouldUseLayerColor}
        >
          {menuCms.show_layer_color}
        </MenuItem>
      </SubMenu>
      <SubMenu label={menuCms.machines}>
        <MenuItem>{menuCms.add_new_machine}</MenuItem>
        <MenuItem>{menuCms.network_testing}</MenuItem>
      </SubMenu>
      <SubMenu label={menuCms.help}>
        <MenuItem>{menuCms.about_beam_studio}</MenuItem>
        <MenuItem>{menuCms.show_start_tutorial}</MenuItem>
        <MenuItem>{menuCms.show_ui_intro}</MenuItem>
        <MenuItem>{menuCms.questionnaire}</MenuItem>
        <MenuItem>{menuCms.change_logs}</MenuItem>
        <MenuItem>{menuCms.help_center}</MenuItem>
        <MenuItem>{menuCms.contact}</MenuItem>
        <MenuDivider />
        <MenuItem>{menuCms.forum}</MenuItem>
        <MenuDivider />
        <MenuItem>{menuCms.bug_report}</MenuItem>
        <MenuItem>{menuCms.dev_tool}</MenuItem>
      </SubMenu>
    </TopBarMenu>
  );
}
