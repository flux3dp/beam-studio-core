import * as React from 'react';

import ButtonGroup from 'app/widgets/ButtonGroup';
import i18n from 'helpers/i18n';
import KeyCodeConstants from 'app/constants/keycode-constants';

const lang = i18n.lang;

interface Props {
  defaultDpiValue: number;
  onSubmit: (dpi: number) => void;
  onCancel: () => void;
}

const DxfDpiSelector = ({ defaultDpiValue, onSubmit, onCancel }: Props): JSX.Element => {
  const submitValue = () => {
    const dpi = Number($('#dpi-input').val());
    onSubmit(dpi);
  };
  const handleKeyDown = (e) => {
    if (e.keyCode === KeyCodeConstants.KEY_RETURN) {
      submitValue();
    }
  };
  const clearInputValue = () => {
    $('#dpi-input').val('');
  };

  const buttons = [
    {
      key: 'cancel',
      label: lang.alert.cancel,
      right: true,
      onClick: () => onCancel(),
    },
    {
      key: 'ok',
      className: 'btn-default primary',
      label: lang.alert.ok,
      right: true,
      onClick: () => submitValue(),
    },
  ];
  return (
    <div className="dxf-dpi-selector">
      <div className="caption">
        {lang.message.please_enter_dpi}
        <br />
        1, 2.54, 25.4, 72, 96 etc.
      </div>
      <div className="message" style={{ textAlign: 'center' }}>
        <input
          id="dpi-input"
          defaultValue={defaultDpiValue}
          onClick={clearInputValue}
          onKeyDown={handleKeyDown}
          style={{
            padding: '3px 10px',
            width: '120px',
            textAlign: 'left',
          }}
        />
      </div>

      <ButtonGroup buttons={buttons} />
    </div>
  );
};

export default DxfDpiSelector;
