function socialAuth(result: boolean): void {
  if (result) {
    if (window.opener.location.hash === '#/initialize/connect/flux-id-login') {
      window.opener.location.hash = '#initialize/connect/select-connection-type';
    } else {
      window.opener.dispatchEvent(new CustomEvent('DISMISS_FLUX_LOGIN'));
    }
    window.close();
  }
}

export default socialAuth;
