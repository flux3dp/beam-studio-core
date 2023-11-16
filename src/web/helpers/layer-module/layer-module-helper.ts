import beamboxPreference from 'app/actions/beambox/beambox-preference';
import LayerModule from 'app/constants/layer-module/layer-modules';

const LaserModuleSet = new Set([
  LayerModule.LASER_10W_DIODE,
  LayerModule.LASER_20W_DIODE,
]);

const getDefaultLaserModule = (): LayerModule => {
  const value = beamboxPreference.read('default-laser-module') as LayerModule;
  if (LaserModuleSet.has(value)) return value;
  return LayerModule.LASER_20W_DIODE;
}

export default {
  getDefaultLaserModule,
};
