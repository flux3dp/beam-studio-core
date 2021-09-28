import React from 'react';
import {
  Menu as TopBarMenu,
  MenuItem,
  MenuDivider,
  SubMenu,
} from '@szhsin/react-menu';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import browser from 'implementations/browser';
import Discover from 'helpers/api/discover';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import hotkeys from 'app/constants/hotkeys';
import i18n from 'helpers/i18n';
import { IDeviceInfo } from 'interfaces/IDevice';

interface Props {
  email: string;
}

let discover;

export default function Menu({ email }: Props): JSX.Element {
  const eventEmitter = React.useMemo(() => eventEmitterFactory.createEventEmitter('top-bar-menu'), []);
  const [devices, setDevices] = React.useState<IDeviceInfo[]>([]);
  const [shouldShowRulers, changeShouldShowRulers] = React.useState(BeamboxPreference.read('show_rulers'));
  const [shouldShowGrids, changeShouldShowGrids] = React.useState(true);
  const [shouldUseLayerColor, changeShouldUseLayerColor] = React.useState(BeamboxPreference.read('use_layer_color'));
  const [isUsingAntiAliasing, setIsUsingAntiAliasing] = React.useState(BeamboxPreference.read('anti-aliasing') !== false);
  const [shouldZoomWithWindow, changeShouldZoomWithWindow] = React.useState(false);
  const [duplicateDisabled, setDuplicateDisabled] = React.useState(true);
  const [svgEditDisabled, setSvgEditDisabled] = React.useState(true);
  const [decomposePathDisabled, setDecomposePathDisabled] = React.useState(true);
  const [groupDisabled, setGroupDisabled] = React.useState(true);
  const [ungroupDisabled, setUngroupDisabled] = React.useState(true);
  const [imageEditDisabled, setImageEditDisabled] = React.useState(true);
  const menuItemUpdater = {
    DUPLICATE: setDuplicateDisabled,
    SVG_EDIT: setSvgEditDisabled,
    DECOMPOSE_PATH: setDecomposePathDisabled,
    GROUP: setGroupDisabled,
    UNGROUP: setUngroupDisabled,
    PHOTO_EDIT: setImageEditDisabled,
  };

  React.useEffect(() => {
    eventEmitter.on('ENABLE_MENU_ITEM', (items: string[]) => {
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        menuItemUpdater[item]?.(false);
      }
    });
    eventEmitter.on('DISABLE_MENU_ITEM', (items: string[]) => {
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        menuItemUpdater[item]?.(true);
      }
    });

    return () => {
      eventEmitter.removeListener('ENABLE_MENU_ITEM');
      eventEmitter.removeListener('DISABLE_MENU_ITEM');
    };
  });

  React.useEffect(() => {
    discover = Discover('top-bar-menu', (newDevices: IDeviceInfo[]) => {
      newDevices.sort((a, b) => (a.name >= b.name ? 1 : -1));
      if (newDevices.map((d) => d.name).join('') !== devices.map((d) => d.name).join('')) {
        setDevices(newDevices);
      }
    });
    return () => {
      discover.removeListener('top-bar-menu');
    };
  }, [devices]);

  const menuCms = i18n.lang.topbar.menu;
  const callback = (id: string, deviceSerial?: string) => {
    eventEmitter.emit('MENU_CLICK', null, {
      id,
      serial: deviceSerial,
    });
  };
  const openPage = (url: string) => browser.open(url);
  const hotkey = (action: string): JSX.Element => (
    <>
      <span className="action">{menuCms[action]}</span>
      <span className="hotkey">{hotkeys[action].representation}</span>
    </>
  );

  const deviceMenus = () => {
    const submenus = [];
    for (let i = 0; i < devices.length; i += 1) {
      const { model, name, serial } = devices[i];
      submenus.push(
        <SubMenu label={name} key={serial}>
          <MenuItem onClick={() => callback('DASHBOARD', serial)}>{menuCms.dashboard}</MenuItem>
          <MenuItem onClick={() => callback('MACHINE_INFO', serial)}>{menuCms.machine_info}</MenuItem>
          <MenuDivider />
          <MenuItem onClick={() => callback('CALIBRATE_BEAMBOX_CAMERA', serial)}>{menuCms.calibrate_beambox_camera}</MenuItem>
          {model === 'fbm1' ? <MenuItem onClick={() => callback('CALIBRATE_BEAMBOX_CAMERA_BORDERLESS', serial)}>{menuCms.calibrate_beambox_camera_borderless}</MenuItem> : null}
          {model === 'fbm1' ? <MenuItem onClick={() => callback('CALIBRATE_DIODE_MODULE', serial)}>{menuCms.calibrate_diode_module}</MenuItem> : null}
          <MenuDivider />
          <MenuItem onClick={() => callback('UPDATE_FIRMWARE', serial)}>{menuCms.update_firmware}</MenuItem>
          <SubMenu label={menuCms.download_log}>
            <MenuItem onClick={() => callback('LOG_NETWORK', serial)}>{menuCms.log.network}</MenuItem>
            <MenuItem onClick={() => callback('LOG_HARDWARE', serial)}>{menuCms.log.hardware}</MenuItem>
            <MenuItem onClick={() => callback('LOG_DISCOVER', serial)}>{menuCms.log.discover}</MenuItem>
            <MenuItem onClick={() => callback('LOG_USB', serial)}>{menuCms.log.usb}</MenuItem>
            <MenuItem onClick={() => callback('LOG_USBLIST', serial)}>{menuCms.log.usblist}</MenuItem>
            <MenuItem onClick={() => callback('LOG_CAMERA', serial)}>{menuCms.log.camera}</MenuItem>
            <MenuItem onClick={() => callback('LOG_CLOUD', serial)}>{menuCms.log.cloud}</MenuItem>
            <MenuItem onClick={() => callback('LOG_PLAYER', serial)}>{menuCms.log.player}</MenuItem>
            <MenuItem onClick={() => callback('LOG_ROBOT', serial)}>{menuCms.log.robot}</MenuItem>
          </SubMenu>
        </SubMenu>,
      );
    }
    return submenus;
  };

  return (
    <TopBarMenu menuButton={(
      <div className="menu-btn-container">
        <img className="icon" src="img/logo-line.svg" />
        <img className="icon-arrow" src="img/icon-arrow-d.svg" />
      </div>
    )}
    >
      <SubMenu label={menuCms.file}>
        <MenuItem onClick={() => callback('OPEN')}>{menuCms.open}</MenuItem>
        <MenuDivider />
        <MenuItem onClick={() => callback('SAVE_SCENE')}>{hotkey('save_scene')}</MenuItem>
        <MenuItem onClick={() => callback('SAVE_AS')}>{hotkey('save_as')}</MenuItem>
        <MenuDivider />
        <SubMenu label={menuCms.samples}>
          <MenuItem onClick={() => callback('IMPORT_EXAMPLE')}>{menuCms.import_hello_beamo}</MenuItem>
          <MenuItem onClick={() => callback('IMPORT_HELLO_BEAMBOX')}>{menuCms.import_hello_beambox}</MenuItem>
          <MenuItem onClick={() => callback('IMPORT_MATERIAL_TESTING_ENGRAVE')}>{menuCms.import_material_testing_engrave}</MenuItem>
          <MenuItem onClick={() => callback('IMPORT_MATERIAL_TESTING_OLD')}>{menuCms.import_material_testing_old}</MenuItem>
          <MenuItem onClick={() => callback('IMPORT_MATERIAL_TESTING_CUT')}>{menuCms.import_material_testing_cut}</MenuItem>
          <MenuItem onClick={() => callback('IMPORT_MATERIAL_TESTING_SIMPLECUT')}>{menuCms.import_material_testing_simple_cut}</MenuItem>
          <MenuItem onClick={() => callback('IMPORT_MATERIAL_TESTING_LINE')}>{menuCms.import_material_testing_line}</MenuItem>
          <MenuItem onClick={() => callback('IMPORT_ACRYLIC_FOCUS_PROBE')}>{menuCms.import_acrylic_focus_probe}</MenuItem>
        </SubMenu>
        <MenuDivider />
        <SubMenu label={menuCms.export_to}>
          <MenuItem onClick={() => callback('EXPORT_BVG')}>{menuCms.export_BVG}</MenuItem>
          <MenuItem onClick={() => callback('EXPORT_SVG')}>{menuCms.export_SVG}</MenuItem>
          <MenuItem onClick={() => callback('EXPORT_PNG')}>{menuCms.export_PNG}</MenuItem>
          <MenuItem onClick={() => callback('EXPORT_JPG')}>{menuCms.export_JPG}</MenuItem>
          <MenuItem onClick={() => callback('EXPORT_FLUX_TASK')}>{hotkey('export_flux_task')}</MenuItem>
        </SubMenu>
        <MenuDivider />
        <MenuItem onClick={() => callback('PREFERENCE')}>{hotkey('preferences')}</MenuItem>
      </SubMenu>
      <SubMenu label={menuCms.edit}>
        <MenuItem onClick={() => callback('UNDO')}>{hotkey('undo')}</MenuItem>
        <MenuItem onClick={() => callback('REDO')}>{hotkey('redo')}</MenuItem>
        <MenuDivider />
        <MenuItem onClick={() => callback('CUT')}>{hotkey('cut')}</MenuItem>
        <MenuItem onClick={() => callback('COPY')}>{hotkey('copy')}</MenuItem>
        <MenuItem onClick={() => callback('PASTE')}>{hotkey('paste')}</MenuItem>
        <MenuItem onClick={() => callback('PASTE_IN_PLACE')}>{hotkey('paste_in_place')}</MenuItem>
        <MenuItem disabled={duplicateDisabled} onClick={() => callback('DUPLICATE')}>{hotkey('duplicate')}</MenuItem>
        <MenuDivider />
        <MenuItem disabled={groupDisabled} onClick={() => callback('GROUP')}>{hotkey('group')}</MenuItem>
        <MenuItem disabled={ungroupDisabled} onClick={() => callback('UNGROUP')}>{hotkey('ungroup')}</MenuItem>
        <MenuDivider />
        <SubMenu label={menuCms.path}>
          <MenuItem onClick={() => callback('OFFSET')}>{menuCms.offset}</MenuItem>
          <MenuItem disabled={decomposePathDisabled} onClick={() => callback('DECOMPOSE_PATH')}>{menuCms.decompose_path}</MenuItem>
        </SubMenu>
        <SubMenu disabled={imageEditDisabled} label={menuCms.photo_edit}>
          <MenuItem onClick={() => callback('IMAGE_SHARPEN')}>{menuCms.image_sharpen}</MenuItem>
          <MenuItem onClick={() => callback('IMAGE_CROP')}>{menuCms.image_crop}</MenuItem>
          <MenuItem onClick={() => callback('IMAGE_INVERT')}>{menuCms.image_invert}</MenuItem>
          <MenuItem onClick={() => callback('IMAGE_STAMP')}>{menuCms.image_stamp}</MenuItem>
          <MenuItem onClick={() => callback('IMAGE_VECTORIZE')}>{menuCms.image_vectorize}</MenuItem>
          <MenuItem onClick={() => callback('IMAGE_CURVE')}>{menuCms.image_curve}</MenuItem>
        </SubMenu>
        <SubMenu disabled={svgEditDisabled} label={menuCms.svg_edit}>
          <MenuItem onClick={() => callback('DISASSEMBLE_USE')}>{menuCms.disassemble_use}</MenuItem>
        </SubMenu>
        <SubMenu label={menuCms.layer_setting}>
          <MenuItem onClick={() => callback('LAYER_COLOR_CONFIG')}>{menuCms.layer_color_config}</MenuItem>
        </SubMenu>
        <MenuDivider />
        <MenuItem onClick={() => callback('ALIGN_TO_EDGES')}>{menuCms.align_to_edges}</MenuItem>
        <MenuDivider />
        <SubMenu label={menuCms.optimization}>
          <MenuItem onClick={() => callback('SVG_NEST')}>{menuCms.arrangement_optimization}</MenuItem>
        </SubMenu>
        <MenuDivider />
        <MenuItem onClick={() => callback('DOCUMENT_SETTING')}>{menuCms.document_setting}</MenuItem>
        <MenuItem onClick={() => callback('CLEAR_SCENE')}>{hotkey('clear_scene')}</MenuItem>
      </SubMenu>
      <SubMenu label={menuCms.view}>
        <MenuItem className="rc-menu__item--type-checkbox" onClick={() => callback('ZOOM_IN')}>{hotkey('zoom_in')}</MenuItem>
        <MenuItem className="rc-menu__item--type-checkbox" onClick={() => callback('ZOOM_OUT')}>{hotkey('zoom_out')}</MenuItem>
        <MenuItem className="rc-menu__item--type-checkbox" onClick={() => callback('FITS_TO_WINDOW')}>{menuCms.fit_to_window}</MenuItem>
        <MenuItem
          type="checkbox"
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
        <MenuItem
          type="checkbox"
          onClick={() => {
            callback('ANTI_ALIASING');
            setIsUsingAntiAliasing(!isUsingAntiAliasing);
          }}
          checked={isUsingAntiAliasing}
        >
          {menuCms.anti_aliasing}
        </MenuItem>
      </SubMenu>
      <SubMenu label={menuCms.machines}>
        <MenuItem onClick={() => callback('ADD_NEW_MACHINE')}>{hotkey('add_new_machine')}</MenuItem>
        <MenuItem onClick={() => callback('NETWORK_TESTING')}>{menuCms.network_testing}</MenuItem>
        {deviceMenus()}
      </SubMenu>
      <SubMenu label={menuCms.help}>
        <MenuItem onClick={() => callback('ABOUT_BEAM_STUDIO')}>{menuCms.about_beam_studio}</MenuItem>
        <MenuItem onClick={() => callback('START_TUTORIAL')}>{menuCms.show_start_tutorial}</MenuItem>
        <MenuItem onClick={() => callback('START_UI_INTRO')}>{menuCms.show_ui_intro}</MenuItem>
        <MenuItem onClick={() => callback('START_GESTURE_INTRO')}>{menuCms.show_gesture_tutorial}</MenuItem>
        <MenuItem onClick={() => callback('QUESTIONNAIRE')}>{menuCms.questionnaire}</MenuItem>
        <MenuItem onClick={() => callback('CHANGE_LOGS')}>{menuCms.change_logs}</MenuItem>
        <MenuItem onClick={() => openPage(menuCms.link.help_center)}>
          {menuCms.help_center}
        </MenuItem>
        <MenuItem onClick={() => openPage(menuCms.link.contact_us)}>{menuCms.contact}</MenuItem>
        <MenuDivider />
        <MenuItem onClick={() => openPage(menuCms.link.forum)}>{menuCms.forum}</MenuItem>
        <MenuDivider />
        <MenuItem disabled={email === null} onClick={() => callback('MANAGE_ACCOUNT')}>{menuCms.manage_account}</MenuItem>
        {
          email == null
            ? (<MenuItem onClick={() => callback('SIGN_IN')}>{menuCms.sign_in}</MenuItem>)
            : (<MenuItem onClick={() => callback('SIGN_OUT')}>{`${menuCms.sign_out} (${email})`}</MenuItem>)
        }
      </SubMenu>
    </TopBarMenu>
  );
}
