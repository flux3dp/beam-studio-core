/* eslint-disable import/first */
import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

const read = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read,
}));

const open = jest.fn();
jest.mock('implementations/browser', () => ({
  open,
}));

const emit = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: () => ({
    emit,
  }),
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    topbar: {
      menu: {
        preferences: 'Preferences',
        hide: 'Hide Beam Studio',
        hideothers: 'Hide Others',
        service: 'Services',
        quit: 'Quit',
        window: 'Window',
        minimize: 'Minimize',
        close: 'Close Window',
        file: 'File',
        edit: 'Edit',
        help: 'Help',
        open: 'Open',
        recent: 'Open Recent',
        samples: 'Examples',
        import_hello_beamo: 'Example of beamo',
        import_hello_beambox: 'Example of beambox',
        import_material_testing_old: 'Material Engraving Test - Classic',
        import_material_testing_simple_cut: 'Material Cutting Test - Simple',
        import_material_testing_cut: 'Material Cutting Test',
        import_material_testing_engrave: 'Material Engraving Test',
        import_material_testing_line: 'Material Line Test',
        import_acrylic_focus_probe: 'Acrylic Focus Probe - 3mm',
        export_to: 'Export To...',
        export_flux_task: 'FLUX task',
        export_BVG: 'BVG',
        export_SVG: 'SVG',
        export_PNG: 'PNG',
        export_JPG: 'JPG',
        save_scene: 'Save',
        save_as: 'Save As...',
        about_beam_studio: 'About Beam Studio',
        undo: 'Undo',
        redo: 'Redo',
        cut: 'Cut',
        copy: 'Copy',
        paste: 'Paste',
        paste_in_place: 'Paste in Place',
        group: 'Group',
        ungroup: 'Ungroup',
        delete: 'Delete',
        duplicate: 'Duplicate',
        offset: 'Offset',
        scale: 'Scale',
        rotate: 'Rotate',
        reset: 'Reset',
        align_center: 'Align Center',
        photo_edit: 'Image',
        svg_edit: 'SVG',
        path: 'Path',
        decompose_path: 'Decompose Discrete Path',
        optimization: 'Optimize',
        object: 'Object',
        layer_setting: 'Layer',
        layer_color_config: 'Color Settings',
        image_sharpen: 'Sharpen',
        image_crop: 'Crop',
        image_invert: 'Invert Color',
        image_stamp: 'Generate Chamfer',
        image_vectorize: 'Vectorize',
        image_curve: 'Curve',
        arrangement_optimization: 'Arrangement',
        align_to_edges: 'Snap To Vertices',
        document_setting: 'Document Settings',
        clear_scene: 'Clear Scene',
        machines: 'Machines',
        add_new_machine: 'Machine Setup',
        help_center: 'Help Center',
        show_start_tutorial: 'Show Start Tutorial',
        show_ui_intro: 'Show Interface Introduction',
        questionnaire: 'Feedback Questionnaire',
        change_logs: 'Change Logs',
        contact: 'Contact Us',
        tutorial: 'Start Delta Family Printing Tutorial',
        forum: 'Community Forum',
        software_update: 'Software Update',
        bug_report: 'Bug Report',
        dev_tool: 'Debug Tool',
        dashboard: 'Dashboard',
        machine_info: 'Machine Info',
        network_testing: 'Test Network Settings',
        toolhead_info: 'Toolhead Info',
        change_material: 'Change Printing Material',
        run_leveling: 'Run Auto Leveling',
        commands: 'Commands',
        update_firmware: 'Update Firmware',
        update_delta: 'Machine Firmware',
        update_toolhead: 'Toolhead Firmware',
        using_beam_studio_api: 'Using Beam Studio API',
        set_as_default: 'Set as Default',
        calibrate_origin: 'Calibrate Origin ( Home )',
        calibrate_beambox_camera: 'Calibrate Camera',
        calibrate_beambox_camera_borderless: 'Calibrate Camera (Open Bottom)',
        calibrate_diode_module: 'Calibrate Diode Module',
        movement_test: 'Run Movement Test',
        turn_on_laser: 'Turn On Scanning Laser',
        auto_leveling_clean: 'Run Auto Leveling with Clean Data',
        set_toolhead_temperature: 'Set Toolhead Temperature',
        manage_account: 'Manage My Account',
        sign_in: 'Sign In',
        sign_out: 'Sign Out',
        account: 'Account',
        my_account: 'My Account',
        download_log: 'Download Logs',
        download_log_canceled: 'Log download canceled',
        download_log_error: 'Unknown error occurred, please try it again later',
        log: {
          network: 'Network',
          hardware: 'Hardware',
          discover: 'Discover',
          usb: 'USB',
          usblist: 'USB List',
          camera: 'Camera',
          cloud: 'Cloud',
          player: 'Player',
          robot: 'Robot',
        },
        link: {
          help_center: 'https://helpcenter.flux3dp.com/',
          contact_us: 'https://flux3dp.zendesk.com/hc/en-us/requests/new',
          forum: 'https://www.facebook.com/groups/flux.laser/',
          downloads: 'https://flux3dp.com/downloads/',
          beam_studio_api: 'https://github.com/flux3dp/beam-studio/wiki/Beam-Studio-Easy-API',
        },
        view: 'View',
        zoom_in: 'Zoom In',
        zoom_out: 'Zoom Out',
        fit_to_window: 'Fit to Window Size',
        zoom_with_window: 'Auto Fit to Window Size',
        borderless_mode: 'Borderless Mode',
        show_grids: 'Show Grids',
        show_rulers: 'Show Rulers',
        show_layer_color: 'Use Layer Color',
        anti_aliasing: 'Anti-Aliasing',
        disassemble_use: 'Disassemble',
      },
    },
  },
}));

import Menu from './Menu';

describe('should render correctly', () => {
  test('open the browser and reach the correct page', () => {
    read.mockReturnValue(true);
    const wrapper = mount(<Menu />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('img').simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div.rc-menu__item').at(4).simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('li.rc-menu__item').at(5).simulate('click');
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenNthCalledWith(1, 'https://helpcenter.flux3dp.com/');
  });

  test('test checkbox menu item', () => {
    read.mockReturnValue(false);
    const wrapper = mount(<Menu />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('img').simulate('click');
    wrapper.find('div.rc-menu__item').at(2).simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('li.rc-menu__item--type-checkbox').at(1).simulate('click');
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenNthCalledWith(1, 'MENU_CLICK', null, {
      id: 'SHOW_RULERS',
    });
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
