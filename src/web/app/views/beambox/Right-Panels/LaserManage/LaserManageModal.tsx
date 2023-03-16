import React, { useCallback, useReducer } from 'react';
import { Modal, Row } from 'antd';

import alertCaller from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import storage from 'implementations/storage';
import useI18n from 'helpers/useI18n';
import { updateDefaultPresetData } from 'helpers/presets/preset-helper';

import ArrowButtons from './ArrowButtons';
import Context, { getInitState, reducer } from './Context';
import CustomConfigs from './CustomConfigs';
import Footer from './Footer';
import Inputs from './Inputs';
import PresetsList from './PresetsList';

interface Props {
  selectedItem: string;
  onClose: () => void;
  onSave: () => void;
}

const LaserManageModal = ({ selectedItem, onClose, onSave }: Props): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, null, () => getInitState(selectedItem));
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  const handleDelete = useCallback(() => dispatch({ type: 'delete' }), [dispatch]);
  const handleReset = () => {
    alertCaller.popUp({
      buttonType: alertConstants.YES_NO,
      message: t.sure_to_reset,
      onYes: () => {
        storage.removeAt('defaultLaserConfigsInUse');
        updateDefaultPresetData();
        dispatch({ type: 'reset' });
      },
    });
  };
  const handleSave = () => {
    const { configs, dataChanges, presetsInUse } = state;
    for (let i = 0; i < configs.length; i += 1) {
      if (dataChanges[configs[i].name]) configs[i] = { ...configs[i], ...dataChanges[configs[i].name] };
    }
    storage.set('customizedLaserConfigs', configs);
    storage.set('defaultLaserConfigsInUse', presetsInUse);
    onSave();
    onClose();
  };

  const footer = <Footer onClose={onClose} onDelete={handleDelete} onReset={handleReset} onSave={handleSave} />;

  return (
    <Modal
      open
      centered
      footer={footer}
      title={t.more}
      onCancel={onClose}
    >
      <Context.Provider value={{ state, dispatch }}>
        <div className="more-config-panel">
          <Row>
            <PresetsList />
            <ArrowButtons />
            <CustomConfigs />
          </Row>
          <Inputs />
        </div>
      </Context.Provider>
    </Modal>
  );
};

export default LaserManageModal;
