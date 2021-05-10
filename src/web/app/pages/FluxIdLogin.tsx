import dialog from 'app/actions/dialog-caller';
import React, { useEffect } from 'react';

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
