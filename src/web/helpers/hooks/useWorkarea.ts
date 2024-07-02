import { useEffect, useState } from 'react';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import eventEmitterFactory from 'helpers/eventEmitterFactory';

const canvasEvents = eventEmitterFactory.createEventEmitter('canvas');
const useWorkarea = (): string => {
  const [workarea, setWorkarea] = useState(beamboxPreference.read('workarea'));

  useEffect(() => {
    const handler = () => {
      setWorkarea(beamboxPreference.read('workarea'));
    };
    canvasEvents.on('model-changed', handler);
    return () => {
      canvasEvents.off('model-changed', handler);
    };
  }, []);

  return workarea;
};

export default useWorkarea;
