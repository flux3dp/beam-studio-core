import React, { useEffect } from 'react';

import dialog from 'app/actions/dialog-caller';
import storage from 'implementations/storage';

// Empty page to show login dialog
function FluxIdLogin(): JSX.Element {
  useEffect(() => {
    dialog.clearAllDialogComponents();
    dialog.showLoginDialog(() => {
      const isReady = storage.get('printer-is-ready');
      window.location.hash = isReady ? '#studio/beambox' : '#initialize/connect/select-connection-type';
    });
  }, []);
  return <div className="top-bar" />;
}

export default FluxIdLogin;
