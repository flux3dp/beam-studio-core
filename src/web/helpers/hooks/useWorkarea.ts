import { useEffect, useState } from 'react';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';

const useWorkarea = (): string => {
  const [workarea, setWorkarea] = useState(beamboxPreference.read('workarea'));

  const onWorkareaChange = () => {
    setWorkarea(beamboxPreference.read('workarea'));
  };

  useEffect(() => {
    beamboxStore.onUpdateWorkArea(onWorkareaChange);
    return () => {
      beamboxStore.removeUpdateWorkAreaListener(onWorkareaChange);
    };
  }, []);

  return workarea
};

export default useWorkarea;
