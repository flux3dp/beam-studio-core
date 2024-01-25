import React, { createContext, Dispatch, SetStateAction, useMemo, useState } from 'react';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import constant, { WorkareaMap } from 'app/actions/beambox/constant';
import LayerModule from 'app/constants/layer-module/layer-modules';
import layerModuleHelper from 'helpers/layer-module/layer-module-helper';
import moduleBoundary from 'app/constants/layer-module/module-boundary';
import storage from 'implementations/storage';
import { DEFAULT_CONTROLLER_INCH, DEFAULT_CONTROLLER_MM } from 'app/constants/boxgen-constants';
import { IController } from 'interfaces/IBoxgen';

interface BoxgenContextType {
  onClose: () => void;
  boxData: IController;
  setBoxData: Dispatch<SetStateAction<IController>>;
  zoomKey: number;
  setZoomKey: Dispatch<SetStateAction<number>>;
  resetKey: number;
  setResetKey: Dispatch<SetStateAction<number>>;
  workarea: { value: string; label: string; canvasWidth: number; canvasHeight: number };
  lengthUnit: { unit: 'mm' | 'inch'; unitRatio: number; decimal: number };
}

export const BoxgenContext = createContext<BoxgenContextType>({
  onClose: () => {},
  boxData: DEFAULT_CONTROLLER_MM,
  setBoxData: () => {},
  zoomKey: 0,
  setZoomKey: () => {},
  resetKey: 0,
  setResetKey: () => {},
  workarea: { value: 'fbm1', label: 'beamo', canvasWidth: 300, canvasHeight: 210 },
  lengthUnit: { unit: 'mm', unitRatio: 1, decimal: 0 },
});

interface BoxgenProviderProps {
  onClose: () => void;
  children: React.ReactNode;
}

export function BoxgenProvider({ onClose, children }: BoxgenProviderProps): JSX.Element {
  const workareaValue = BeamboxPreference.read('workarea') || 'fbm1';
  const workarea = useMemo(() => {
    const currentWorkarea = WorkareaMap.get(workareaValue);
    if (currentWorkarea.label === 'Ador') {
      const laserModule = layerModuleHelper.getDefaultLaserModule();
      const boundary = moduleBoundary[laserModule] as {
        top: number;
        left: number;
        right: number;
        bottom: number;
      };
      return {
        value: workareaValue,
        label: `${currentWorkarea.label} ${
          laserModule === LayerModule.LASER_10W_DIODE ? '10W' : '20W'
        }`,
        canvasWidth: currentWorkarea.width / constant.dpmm - boundary.left - boundary.right,
        canvasHeight: currentWorkarea.height / constant.dpmm - boundary.top - boundary.bottom,
      };
    }
    return {
      value: workareaValue,
      label: currentWorkarea.label,
      canvasWidth: currentWorkarea.width / constant.dpmm,
      canvasHeight: currentWorkarea.height / constant.dpmm,
    };
  }, [workareaValue]);

  const unit = storage.get('default-units') || 'mm';
  const isMM = unit === 'mm';
  const lengthUnit = isMM
    ? { unit: 'mm' as const, unitRatio: 1, decimal: 0 }
    : { unit: 'inch' as const, unitRatio: 25.4, decimal: 3 };

  const [boxData, setBoxData] = useState(isMM ? DEFAULT_CONTROLLER_MM : DEFAULT_CONTROLLER_INCH);
  const [zoomKey, setZoomKey] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  return (
    <BoxgenContext.Provider
      value={{
        onClose,
        boxData,
        setBoxData,
        zoomKey,
        setZoomKey,
        resetKey,
        setResetKey,
        workarea,
        lengthUnit,
      }}
    >
      {children}
    </BoxgenContext.Provider>
  );
}
