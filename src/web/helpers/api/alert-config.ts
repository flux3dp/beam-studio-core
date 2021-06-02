import storage from 'implementations/storage';

type AlertConfigKey =
  'skip-interface-tutorial' |
  'skip_os_version_warning' |
  'skip_check_thumbnail_warning' |
  'skip_camera_cable_alert' |
  'skip_dxf_version_warning' |
  'skip_dxf_oversize_warning' |
  'skip_path_speed_warning' |
  'skip_path_speed_constraint_warning' |
  'skip_svg_version_warning' |
  'skip_image_path_warning';

export default {
  read: (key: AlertConfigKey) => {
    const config = storage.get('alert-config') || {};
    return config[key];
  },
  write: (key: AlertConfigKey, value: any): void => {
    const config = storage.get('alert-config') || {};
    config[key] = value;
    storage.set('alert-config', config);
  },
};
