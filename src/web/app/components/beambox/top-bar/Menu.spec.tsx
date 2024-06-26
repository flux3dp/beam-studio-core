/* eslint-disable import/first */
import React from 'react';
import { fireEvent, render } from '@testing-library/react';

const read = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read,
}));

const open = jest.fn();
jest.mock('implementations/browser', () => ({
  open,
}));

const mockDiscoverRemoveListener = jest.fn();
jest.mock('helpers/api/discover', () => () => ({
  removeListener: mockDiscoverRemoveListener,
}));

const emit = jest.fn();
const on = jest.fn();
const removeListener = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: () => ({
    emit,
    on,
    removeListener,
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
        import_material_printing_test: 'Material Printing Test',
        import_ador_laser_example: 'Example of Ador Laser',
        import_ador_printing_example_single: 'Example of Ador Printing - Single Color',
        import_ador_printing_example_full: 'Example of Ador Printing - Full Color',
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
        decompose_path: 'Decompose',
        optimization: 'Optimize',
        object: 'Object',
        layer_setting: 'Layer',
        layer_color_config: 'Color Settings',
        image_sharpen: 'Sharpen',
        image_crop: 'Crop',
        image_invert: 'Invert',
        image_stamp: 'Bevel',
        image_vectorize: 'Trace',
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
        show_gesture_tutorial: 'show_gesture_tutorial',
        questionnaire: 'Feedback Questionnaire',
        change_logs: 'Change Logs',
        contact: 'Contact Us',
        design_market: 'Design Market',
        tutorial: 'Start Delta Family Printing Tutorial',
        forum: 'Community Forum',
        software_update: 'Software Update',
        bug_report: 'Bug Report',
        dashboard: 'Dashboard',
        machine_info: 'Machine Info',
        network_testing: 'Test Network Settings',
        commands: 'Commands',
        update_firmware: 'Update Firmware',
        using_beam_studio_api: 'Using Beam Studio API',
        set_as_default: 'Set as Default',
        calibrate_beambox_camera: 'Calibrate Camera',
        calibrate_beambox_camera_borderless: 'Calibrate Camera (Open Bottom)',
        calibrate_diode_module: 'Calibrate Diode Laser Module',
        manage_account: 'Manage My Account',
        sign_in: 'Sign In',
        sign_out: 'Sign Out',
        account: 'Account',
        my_account: 'My Account',
        download_log: 'Download Logs',
        download_log_canceled: 'Log download canceled',
        download_log_error: 'Unknown error occurred, please try it again later',
        keyboard_shortcuts: 'Keyboard Shortcuts',
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
          design_market: 'https://designs.flux3dp.com/',
          forum: 'https://www.facebook.com/groups/flux.laser/',
          downloads: 'https://flux3dp.com/downloads/',
          beam_studio_api: 'https://github.com/flux3dp/beam-studio/wiki/Beam-Studio-Easy-API',
          shortcuts: 'https://support.flux3dp.com/hc/en-us/articles/10003978157455',
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

window.os = 'MacOS';

import Menu from './Menu';

describe('should render correctly', () => {
  test('open the browser and reach the correct page', () => {
    read.mockReturnValue(true);
    const { container, getByText } = render(<Menu email={undefined} />);
    expect(container).toMatchSnapshot();

    fireEvent.click(container.querySelector('div.menu-btn-container'));
    expect(container).toMatchSnapshot();

    fireEvent.click(getByText('Help'));
    expect(container).toMatchSnapshot();

    fireEvent.click(getByText('Help Center'));
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenNthCalledWith(1, 'https://helpcenter.flux3dp.com/');
  });

  test('test checkbox menu item', () => {
    read.mockReturnValue(false);
    const { container, getByText } = render(<Menu email={undefined} />);
    expect(container).toMatchSnapshot();

    fireEvent.click(container.querySelector('div.menu-btn-container'));
    fireEvent.click(getByText('View'));
    expect(container).toMatchSnapshot();

    fireEvent.click(getByText('Show Rulers'));
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenNthCalledWith(1, 'MENU_CLICK', null, {
      id: 'SHOW_RULERS',
    });
    expect(container).toMatchSnapshot();
  });

  test('already signed in', () => {
    read.mockReturnValue(true);
    const { container, getByText } = render(<Menu email="tester@flux3dp.com" />);
    fireEvent.click(container.querySelector('div.menu-btn-container'));
    fireEvent.click(getByText('Account'));
    expect(container).toMatchSnapshot();
  });
});
