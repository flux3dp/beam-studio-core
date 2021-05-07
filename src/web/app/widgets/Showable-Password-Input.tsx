import React, { forwardRef, useState } from 'react';
import classNames from 'classnames';

interface Props {
  divClassName?: string;
  placeholder: string;
  id: string;
}

// eslint-disable-next-line max-len
const ShowablePasswordInput = forwardRef<HTMLInputElement, Props>(({ divClassName, placeholder, id }: Props, ref: any) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className={classNames('showable-password-input', divClassName)}>
      <input
        id={id}
        ref={ref}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.stopPropagation()}
      />
      <img
        src={visible ? 'img/right-panel/icon-eyeclose.svg' : 'img/right-panel/icon-eyeopen.svg'}
        onClick={() => setVisible(!visible)}
      />
    </div>
  );
});

export default ShowablePasswordInput;
