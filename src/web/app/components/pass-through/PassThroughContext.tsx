import React, { createContext, Dispatch, SetStateAction, useMemo, useState } from 'react';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import { GuideLine } from 'interfaces/IPassThrough';
import { getWorkarea, WorkArea, WorkAreaModel } from 'app/constants/workarea-constants';

import sliceWorkarea from './sliceWorkarea';

interface Context {
  workarea: WorkAreaModel;
  workareaObj: WorkArea;
  passThroughHeight: number;
  setPassThroughHeight: Dispatch<SetStateAction<number>>;
  referenceLayer: boolean;
  setReferenceLayer: Dispatch<SetStateAction<boolean>>;
  guideLine: GuideLine;
  setGuideLine: Dispatch<SetStateAction<GuideLine>>;
  handleExport: () => Promise<void>;
}

export const PassThroughContext = createContext<Context>({
  workarea: 'ado1',
  workareaObj: getWorkarea('ado1'),
  passThroughHeight: 120,
  setPassThroughHeight: () => {},
  referenceLayer: false,
  setReferenceLayer: () => {},
  guideLine: { show: false, x: 0, width: 40 },
  setGuideLine: () => {},
  handleExport: async () => {},
});

interface Props {
  children: React.ReactNode;
}

export function PassThroughProvider({ children }: Props): JSX.Element {
  const workarea: WorkAreaModel = useMemo(() => beamboxPreference.read('workarea'), []);
  const workareaObj = useMemo(() => getWorkarea(workarea), [workarea]);
  const [guideLine, setGuideLine] = useState<GuideLine>({ show: false, x: 0, width: 40 });
  const [passThroughHeight, setPassThroughHeight] = useState(
    workareaObj.passThroughMaxHeight ?? workareaObj.height
  );
  const [referenceLayer, setReferenceLayer] = useState(false);
  const handleExport = async () => sliceWorkarea(passThroughHeight, { refLayers: referenceLayer, guideLine });

  return (
    <PassThroughContext.Provider
      value={{
        workarea,
        workareaObj,
        passThroughHeight,
        setPassThroughHeight,
        referenceLayer,
        setReferenceLayer,
        guideLine,
        setGuideLine,
        handleExport,
      }}
    >
      {children}
    </PassThroughContext.Provider>
  );
}
