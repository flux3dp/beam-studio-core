import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Divider, Form, Input, InputRef, Modal, Result, Space } from 'antd';

import alert from 'app/actions/alert-caller';
import browser from 'implementations/browser';
import i18n from 'helpers/i18n';
import storage from 'implementations/storage';
import { externalLinkFBSignIn, externalLinkGoogleSignIn, fluxIDEvents, signIn, signOut } from 'helpers/api/flux-id';

let LANG = i18n.lang.flux_id_login;
const updateLang = () => {
  LANG = i18n.lang.flux_id_login;
};

interface Props {
  silent: boolean;
  onClose: () => void;
}

const FluxIdLogin = ({ silent, onClose }: Props): JSX.Element => {
  updateLang();

  const emailInput = useRef<InputRef>(null);
  const passwordInput = useRef<InputRef>(null);
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
      <div className={classNames('button', 'facebook')} onClick={externalLinkFBSignIn}>
        Continue with Facebook
      </div>
      <div className={classNames('button', 'google')} onClick={externalLinkGoogleSignIn}>
        Continue with Google
      </div>
    </div>
  );

  const handleLogin = async () => {
    const email = emailInput.current.input.value;
    const password = passwordInput.current.input.value;
    const rememberMe = rememberMeCheckbox.current.checked;
    await signOut();
    const res = await signIn({
      email,
      password,
      expires_session: !rememberMe,
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
      if (!silent) {
        alert.popUp({
          message: <Result status="success" title={LANG.login_success} />,
        });
      }
      onClose();
    }
  };

  return (
    <Modal open centered title={LANG.login} footer={null} onCancel={onClose} width={400}>
      <div className="flux-login">
        {renderOAuthContent()}
        <Divider>or</Divider>
        <Form className="login-inputs">
          <Form.Item name="email-input">
            <Input
              ref={emailInput}
              onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
              placeholder={LANG.email}
            />
          </Form.Item>
          <Form.Item name="password-input">
            <Input.Password
              ref={passwordInput}
              onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
              placeholder={LANG.password}
            />
          </Form.Item>
          <div className="options">
            <div
              className="remember-me"
              onClick={() => setIsRememberMeChecked(!isRememberMeChecked)}
            >
              <input
                ref={rememberMeCheckbox}
                type="checkbox"
                checked={isRememberMeChecked}
                onChange={() => {}}
              />
              <div>{LANG.remember_me}</div>
            </div>
            <div className="forget-password" onClick={() => browser.open(LANG.lost_password_url)}>
              {LANG.forget_password}
            </div>
          </div>
        </Form>
        <Space className="footer" direction="vertical">
          <Button block type="primary" onClick={handleLogin}>
            {LANG.login}
          </Button>
          <Button block type="default" onClick={() => browser.open(LANG.signup_url)}>
            {LANG.register}
          </Button>
          <div className="skip" onClick={() => onClose()}>
            {LANG.work_offline}
          </div>
        </Space>
      </div>
    </Modal>
  );
};

export default FluxIdLogin;
