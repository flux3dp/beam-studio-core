import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';

import alert from 'app/actions/alert-caller';
import browser from 'implementations/browser';
import i18n from 'helpers/i18n';
import Modal from 'app/widgets/Modal';
import ShowablePasswordInput from 'app/widgets/ShowablePasswordInput';
import storage from 'implementations/storage';
import {
  externalLinkFBSignIn,
  externalLinkGoogleSignIn,
  fluxIDEvents,
  signIn,
  signOut,
} from 'helpers/api/flux-id';

let LANG = i18n.lang.flux_id_login;
const updateLang = () => {
  LANG = i18n.lang.flux_id_login;
};

interface Props {
  onClose: () => void;
}

const FluxIdLogin = ({ onClose }: Props): JSX.Element => {
  updateLang();

  const emailInput = useRef(null);
  const passwordInput = useRef(null);
  const rememberMeCheckbox = useRef(null);
  const [isRememberMeChecked, setIsRememberMeChecked] = useState(!!storage.get('keep-flux-id-login'));

  useEffect(() => {
    const checkbox = rememberMeCheckbox.current;
    fluxIDEvents.on('oauth-logged-in', onClose);
    return () => {
      fluxIDEvents.removeListener('oauth-logged-in', onClose);
      const isChecked = checkbox.checked;
      storage.set('keep-flux-id-login', isChecked);
    };
  });

  const renderOAuthContent = () => (
    <div className="oauth">
      <div className={classNames('button facebook')} onClick={externalLinkFBSignIn}>
        Continue with Facebook
      </div>
      <div className={classNames('button google')} onClick={externalLinkGoogleSignIn}>
        Continue with Google
      </div>
    </div>
  );

  const renderSeperator = () => <div className="sep">or</div>;

  const renderLoginInputs = () => {
    const lostPasswordUrl = LANG.lost_password_url;
    return (
      <div className="login-inputs">
        <input
          id="email-input"
          type="text"
          placeholder={LANG.email}
          ref={emailInput}
          onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
        />
        <ShowablePasswordInput
          id="password-input"
          ref={passwordInput}
          placeholder={LANG.password}
        />
        <div className="options">
          <div className="remember-me" onClick={() => setIsRememberMeChecked(!isRememberMeChecked)}>
            <input ref={rememberMeCheckbox} type="checkbox" checked={isRememberMeChecked} onChange={() => { }} />
            <div>{LANG.remember_me}</div>
          </div>
          <div className="forget-password" onClick={() => browser.open(lostPasswordUrl)}>{LANG.forget_password}</div>
        </div>
      </div>
    );
  };

  const handleLogin = async () => {
    const email = emailInput.current.value;
    const password = passwordInput.current.value;
    await signOut();
    const res = await signIn({
      email,
      password,
    });
    if (res.error) {
      return;
    }
    if (res.status === 'error') {
      if (res.info === 'USER_NOT_FOUND') {
        alert.popUpError({ message: LANG.incorrect });
      } else if (res.info === 'NOT_VERIFIED') {
        alert.popUpError({ message: LANG.not_verified });
      } else {
        alert.popUpError({ message: res.message });
      }
      return;
    }
    if (res.status === 'ok') {
      // eslint-disable-next-line no-console
      console.log('Log in succeeded', res);
      alert.popUp({ message: LANG.login_success });
      onClose();
    }
  };

  const renderFooterButtons = () => {
    const signupUrl = LANG.signup_url;
    return (
      <div className="footer">
        <div className={classNames('button', 'primary')} onClick={handleLogin}>{LANG.login}</div>
        <div className={classNames('button')} onClick={() => browser.open(signupUrl)}>{LANG.register}</div>
        <div className="skip" onClick={() => onClose()}>{LANG.work_offline}</div>
      </div>
    );
  };

  return (
    <Modal>
      <div className="flux-login">
        <div className="title">{LANG.login}</div>
        {/* <div className='sub-title'>{LANG.unlock_shape_library}</div> */}
        {renderOAuthContent()}
        {renderSeperator()}
        {renderLoginInputs()}
        {renderFooterButtons()}
      </div>
    </Modal>
  );
};

export default FluxIdLogin;
