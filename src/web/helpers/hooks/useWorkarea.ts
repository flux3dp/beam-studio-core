import { useEffect, useState } from 'react';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import eventEmitterFactory from 'helpers/eventEmitterFactory';

const eventEmitter = eventEmitterFactory.createEventEmitter('document-panel');
const useWorkarea = (): string => {
  const [workarea, setWorkarea] = useState(beamboxPreference.read('workarea'));

  useEffect(() => {
    eventEmitter.on('workarea-change', setWorkarea);
    return () => {
      eventEmitter.off('workarea-change', setWorkarea);
    };
  }, []);

  return workarea;
};

export default useWorkarea;
