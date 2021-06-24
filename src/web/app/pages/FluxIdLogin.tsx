import React, { useEffect } from 'react';

import dialog from 'app/actions/dialog-caller';

// Empty page to show login dialog
function FluxIdLogin(): JSX.Element {
  useEffect(() => {
    dialog.showLoginDialog(() => {
      window.location.hash = '#initialize/connect/select-connection-type';
    });
  }, []);
  return <div className="top-bar" />;
};

export default FluxIdLogin;
