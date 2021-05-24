import storage from 'implementations/storage';

const DEFAULT_PREFERENCE = {
  should_remind_calibrate_camera: true,
  mouse_input_device: (window.os === 'MacOS') ? 'TOUCHPAD' : 'MOUSE',
  model: 'fbb1b',
  show_guides: false,
  guide_x0: 0,
  guide_y0: 0,
  engrave_dpi: 'medium', // low, medium, high
};

class BeamboxPreference {
  constructor() {
    // set default preference if key or even beambox-preference doesn't exist
    let pref: any = storage.get('beambox-preference');
    pref = pref === '' ? {} : pref;
    const fullPref = Object.assign(DEFAULT_PREFERENCE, pref);
    storage.set('beambox-preference', fullPref);
  }

  // eslint-disable-next-line class-methods-use-this
  read(key) {
    return storage.get('beambox-preference')[key];
  }

  // eslint-disable-next-line class-methods-use-this
  write(key, value) {
    const pref = storage.get('beambox-preference');
    pref[key] = value;
    storage.set('beambox-preference', pref);
  }
}

const instance = new BeamboxPreference();
export default instance;
