import * as React from 'react';
import { Modal } from 'antd';
import UnitInput from 'app/widgets/Unit-Input-v2';
import ValidationTextInput from 'app/widgets/Validation-Text-Input';
import i18n from 'helpers/i18n';
import { useState } from 'react';
import { ColorConfig } from 'app/constants/color-constants';

const LANG = i18n.lang.beambox.layer_color_config_panel;

interface Props {
  displayAddPanel: boolean;
  setDisplayAddPanel: (value: boolean) => void;
  handleAddConfig: (config: ColorConfig) => void;
}

const AddColorConfigModal = (props: Props): JSX.Element => {
  const { displayAddPanel, setDisplayAddPanel, handleAddConfig } = props;

  const [newColor, setNewColor] = useState('#FFFFFF');
  let newPower = 50;
  let newSpeed = 10;
  let newRepeat = 1;

  return (
    <Modal
      open={displayAddPanel}
      title={LANG.add_config}
      okText={LANG.add}
      onOk={() => handleAddConfig({
        color: newColor,
        power: newPower,
        speed: newSpeed,
        repeat: newRepeat,
      })}
      onCancel={() => setDisplayAddPanel(false)}
    >
      <div className="add-config-panel">
        <div className="input-column">
          <div className="color-block" style={{ backgroundColor: newColor }} />
          <div className="name color">
            {`${LANG.color} :`}
          </div>
          <ValidationTextInput
            defaultValue={newColor}
            validation={(val) => val}
            getValue={(val) => { setNewColor(val); }}
          />
        </div>
        <div className="input-column">
          <div className="name">
            {`${LANG.power} :`}
          </div>
          <UnitInput
            className={{ power: true }}
            min={1}
            max={100}
            unit="%"
            defaultValue={newPower}
            getValue={(val) => { newPower = val; }}
            decimal={1}
          />
        </div>
        <div className="input-column">
          <div className="name">
            {`${LANG.speed} :`}
          </div>
          <UnitInput
            className={{ speed: true }}
            min={3}
            max={300}
            unit="mm/s"
            defaultValue={newSpeed}
            getValue={(val) => { newSpeed = val; }}
            decimal={1}
          />
        </div>
        <div className="input-column">
          <div className="name">
            {`${LANG.repeat} :`}
          </div>
          <UnitInput
            className={{ repeat: true }}
            min={1}
            max={10}
            unit=""
            defaultValue={newRepeat}
            getValue={(val) => { newRepeat = val; }}
            decimal={0}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddColorConfigModal;
