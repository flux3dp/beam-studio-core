import { useEffect } from 'react';

import shortcuts from 'helpers/shortcuts';

const useNewShortcutsScope = (): void => {
  useEffect(() => {
    const exit = shortcuts.enterScope();
    return () => exit();
  }, []);
};

export default useNewShortcutsScope;
