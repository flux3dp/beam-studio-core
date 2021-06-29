import React from 'react';
import {
  Menu as TopBarMenu,
  MenuItem,
  MenuDivider,
  SubMenu,
} from '@szhsin/react-menu';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import browser from 'implementations/browser';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import i18n from 'helpers/i18n';

export default function Menu(): JSX.Element {
  const menuCms = i18n.lang.topbar.menu;
  const eventEmitter = React.useMemo(() => eventEmitterFactory.createEventEmitter('top-bar-menu'), []);
  const [shouldShowRulers, changeShouldShowRulers] = React.useState(BeamboxPreference.read('show_rulers'));
  const [shouldShowGrids, changeShouldShowGrids] = React.useState(true);
  const [shouldUseLayerColor, changeShouldUseLayerColor] = React.useState(BeamboxPreference.read('use_layer_color'));
  const [shouldZoomWithWindow, changeShouldZoomWithWindow] = React.useState(false);

  const [importDisabled, setImportDisabled] = React.useState(false);
  const [exportFluxTaskDisabled, setExportFluxTaskDisabled] = React.useState(false);
  const [saveSceneDisabled, setSaveSceneDisabled] = React.useState(false);
  const [undoDisabled, setUndoDisabled] = React.useState(false);
  const [redoDisabled, setRedoDisabled] = React.useState(false);
  const [duplicateDisabled, setDuplicateDisabled] = React.useState(false);
  const [svgEditDisabled, setSvgEditDisabled] = React.useState(false);
  const [documentSettingDisabled, setDocumentSettingDisabled] = React.useState(false);
  const [clearSceneDisabled, setClearSceneDisabled] = React.useState(false);
  const [zoomInDisabled, setZoomInDisabled] = React.useState(false);
  const [zoomOutDisabled, setZoomOutDisabled] = React.useState(false);
  const [fitsToWindowDisabled, setFitsToWindowDisabled] = React.useState(false);
  const [zoomWithWindowDisabled, setZoomWithWindowDisabled] = React.useState(false);
  const [showGridsDisabled, setShowGridsDisabled] = React.useState(false);
  const [showLayerColorDisabled, setShowLayerColorDisabled] = React.useState(false);
  const [networkTestingDisabled, setNetworkTestingDisabled] = React.useState(false);
  const [aboutBeamStudioDisabled, setAboutBeamStudioDisabled] = React.useState(false);
  const [decomposePathDisabled, setDecomposePathDisabled] = React.useState(false);
  const [groupDisabled, setGroupDisabled] = React.useState(false);
  const [ungroupDisabled, setUngroupDisabled] = React.useState(false);
  const menuItemUpdater = {
    IMPORT: setImportDisabled,
    EXPORT_FLUX_TASK: setExportFluxTaskDisabled,
    SAVE_SCENE: setSaveSceneDisabled,
    UNDO: setUndoDisabled,
    REDO: setRedoDisabled,
    DUPLICATE: setDuplicateDisabled,
    SVG_EDIT: setSvgEditDisabled,
    DOCUMENT_SETTING: setDocumentSettingDisabled,
    CLEAR_SCENE: setClearSceneDisabled,
    ZOOM_IN: setZoomInDisabled,
    ZOOM_OUT: setZoomOutDisabled,
    FITS_TO_WINDOW: setFitsToWindowDisabled,
    ZOOM_WITH_WINDOW: setZoomWithWindowDisabled,
    SHOW_GRIDS: setShowGridsDisabled,
    SHOW_LAYER_COLOR: setShowLayerColorDisabled,
    NETWORK_TESTING: setNetworkTestingDisabled,
    ABOUT_BEAM_STUDIO: setAboutBeamStudioDisabled,
    DECOMPOSE_PATH: setDecomposePathDisabled,
    GROUP: setGroupDisabled,
    UNGROUP: setUngroupDisabled,
  };

  eventEmitter.once('ENABLE_MENU_ITEM', (items: string[]) => {
    console.log('ENABLE_MENU_ITEM', items);
    for (const item of items) {
      menuItemUpdater[item]?.(false);
    }
  });
  eventEmitter.once('DISABLE_MENU_ITEM', (items: string[]) => {
    console.log('DISABLE_MENU_ITEM', items);
    for (const item of items) {
      menuItemUpdater[item]?.(true);
    }
  });

  const callback = (id: string) => {
    eventEmitter.emit('MENU_CLICK', null, {
      id,
    });
  };
  const openPage = (url: string) => browser.open(url);
  return (
    <TopBarMenu menuButton={(
      <img
        src="img/icon.png"
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
        <MenuItem disabled={saveSceneDisabled} onClick={() => callback('SAVE_SCENE')}>{menuCms.save_scene}</MenuItem>
        <MenuItem onClick={() => callback('SAVE_AS')}>{menuCms.save_as}</MenuItem>
        <MenuDivider />
        <SubMenu label={menuCms.samples}>
          <MenuItem onClick={() => callback('IMPORT_EXAMPLE')}>{menuCms.import_hello_beamo}</MenuItem>
          <MenuItem onClick={() => callback('IMPORT_HELLO_BEAMBOX')}>{menuCms.import_hello_beambox}</MenuItem>
          <MenuItem onClick={() => callback('IMPORT_MATERIAL_TESTING_ENGRAVE')}>{menuCms.import_material_testing_engrave}</MenuItem>
          <MenuItem onClick={() => callback('IMPORT_MATERIAL_TESTING_OLD')}>{menuCms.import_material_testing_old}</MenuItem>
          <MenuItem onClick={() => callback('IMPORT_MATERIAL_TESTING_CUT')}>{menuCms.import_material_testing_cut}</MenuItem>
          <MenuItem onClick={() => callback('IMPORT_MATERIAL_TESTING_SIMPLECUT')}>{menuCms.import_material_testing_simple_cut}</MenuItem>
          <MenuItem onClick={() => callback('IMPORT_MATERIAL_TESTING_LINE')}>{menuCms.import_material_testing_line}</MenuItem>
        </SubMenu>
        <MenuDivider />
        <SubMenu label={menuCms.export_to}>
          <MenuItem onClick={() => callback('EXPORT_BVG')}>{menuCms.export_BVG}</MenuItem>
          <MenuItem onClick={() => callback('EXPORT_SVG')}>{menuCms.export_SVG}</MenuItem>
          <MenuItem disabled={exportFluxTaskDisabled} onClick={() => callback('EXPORT_FLUX_TASK')}>{menuCms.export_flux_task}</MenuItem>
        </SubMenu>
        <MenuDivider />
        <MenuItem onClick={() => callback('PREFERENCE')}>{menuCms.preferences}</MenuItem>
      </SubMenu>
      <SubMenu label={menuCms.edit}>
        <MenuItem disabled={undoDisabled} onClick={() => callback('UNDO')}>{menuCms.undo}</MenuItem>
        <MenuItem disabled={redoDisabled} onClick={() => callback('REDO')}>{menuCms.redo}</MenuItem>
        <MenuDivider />
        <MenuItem onClick={() => callback('CUT')}>{menuCms.cut}</MenuItem>
        <MenuItem onClick={() => callback('COPY')}>{menuCms.copy}</MenuItem>
        <MenuItem onClick={() => callback('PASTE')}>{menuCms.paste}</MenuItem>
        <MenuItem onClick={() => callback('PASTE_IN_PLACE')}>{menuCms.paste_in_place}</MenuItem>
        <MenuItem disabled={duplicateDisabled} onClick={() => callback('DUPLICATE')}>{menuCms.duplicate}</MenuItem>
        <MenuDivider />
        <MenuItem disabled={groupDisabled} onClick={() => callback('GROUP')}>{menuCms.group}</MenuItem>
        <MenuItem disabled={ungroupDisabled} onClick={() => callback('UNGROUP')}>{menuCms.ungroup}</MenuItem>
        <MenuDivider />
        <SubMenu label={menuCms.path}>
          <MenuItem onClick={() => callback('OFFSET')}>{menuCms.offset}</MenuItem>
          <MenuItem disabled={decomposePathDisabled} onClick={() => callback('DECOMPOSE_PATH')}>{menuCms.decompose_path}</MenuItem>
        </SubMenu>
        <SubMenu disabled={svgEditDisabled} label={menuCms.svg_edit}>
          <MenuItem onClick={() => callback('DISASSEMBLE_USE')}>{menuCms.disassemble_use}</MenuItem>
        </SubMenu>
        <MenuItem disabled={documentSettingDisabled} onClick={() => callback('DOCUMENT_SETTING')}>{menuCms.document_setting}</MenuItem>
        <MenuItem disabled={clearSceneDisabled} onClick={() => callback('CLEAR_SCENE')}>{menuCms.clear_scene}</MenuItem>
      </SubMenu>
      <SubMenu label={menuCms.view}>
        <MenuItem disabled={zoomInDisabled} className="rc-menu__item--type-checkbox" onClick={() => callback('ZOOM_IN')}>{menuCms.zoom_in}</MenuItem>
        <MenuItem disabled={zoomOutDisabled} className="rc-menu__item--type-checkbox" onClick={() => callback('ZOOM_OUT')}>{menuCms.zoom_out}</MenuItem>
        <MenuItem disabled={fitsToWindowDisabled} className="rc-menu__item--type-checkbox" onClick={() => callback('FITS_TO_WINDOW')}>{menuCms.fit_to_window}</MenuItem>
        <MenuItem
          type="checkbox"
          disabled={zoomWithWindowDisabled}
          onClick={() => {
            callback('ZOOM_WITH_WINDOW');
            changeShouldZoomWithWindow(!shouldZoomWithWindow);
          }}
          checked={shouldZoomWithWindow}
        >
          {menuCms.zoom_with_window}
        </MenuItem>
        <MenuDivider />
        <MenuItem
          type="checkbox"
          disabled={showGridsDisabled}
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
          disabled={showLayerColorDisabled}
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
        <MenuItem onClick={() => callback('ADD_NEW_MACHINE')}>{menuCms.add_new_machine}</MenuItem>
        <MenuItem disabled={networkTestingDisabled} onClick={() => callback('NETWORK_TESTING')}>{menuCms.network_testing}</MenuItem>
      </SubMenu>
      <SubMenu label={menuCms.help}>
        <MenuItem disabled={aboutBeamStudioDisabled} onClick={() => callback('ABOUT_BEAM_STUDIO')}>{menuCms.about_beam_studio}</MenuItem>
        <MenuItem onClick={() => callback('START_TUTORIAL')}>{menuCms.show_start_tutorial}</MenuItem>
        <MenuItem onClick={() => callback('START_UI_INTRO')}>{menuCms.show_ui_intro}</MenuItem>
        <MenuItem onClick={() => callback('QUESTIONNAIRE')}>{menuCms.questionnaire}</MenuItem>
        <MenuItem onClick={() => callback('CHANGE_LOGS')}>{menuCms.change_logs}</MenuItem>
        <MenuItem onClick={() => openPage(menuCms.link.help_center)}>
          {menuCms.help_center}
        </MenuItem>
        <MenuItem onClick={() => openPage(menuCms.link.contact_us)}>{menuCms.contact}</MenuItem>
        <MenuDivider />
        <MenuItem onClick={() => openPage(menuCms.link.forum)}>{menuCms.forum}</MenuItem>
        <MenuDivider />
        <MenuItem onClick={() => callback('BUG_REPORT')}>{menuCms.bug_report}</MenuItem>
        <MenuItem>{menuCms.dev_tool}</MenuItem>
      </SubMenu>
    </TopBarMenu>
  );
}
