import React, { useEffect } from 'react';

import dialog from 'app/actions/dialog-caller';

// Empty page to show login dialog
const FluxIdLogin = () => {
  useEffect(() => {
    dialog.showLoginDialog(() => {
      location.hash = '#initialize/connect/select-connection-type';
    });
  }, []);
  return <div className="top-bar" />;
}

export default () => FluxIdLogin;
