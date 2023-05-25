import { useState } from 'react';

const useForceUpdate = (): () => void => {
  const [, setVal] = useState(0);
  return () => setVal((v) => v + 1);
};

export default useForceUpdate;
