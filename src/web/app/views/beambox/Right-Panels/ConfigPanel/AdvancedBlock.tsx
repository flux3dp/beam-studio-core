import React, { memo, useContext, useEffect, useMemo } from 'react';
import { Collapse, ConfigProvider } from 'antd';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import LayerModule from 'app/constants/layer-module/layer-modules';
import useForceUpdate from 'helpers/use-force-update';
import useI18n from 'helpers/useI18n';
import useWorkarea from 'helpers/hooks/useWorkarea';
import { getSupportInfo } from 'app/constants/add-on';

import AutoFocus from './AutoFocus';
import ConfigPanelContext from './ConfigPanelContext';
import Diode from './Diode';
import FocusBlock from './FocusBlock';
import SingleColorBlock from './SingleColorBlock';
import styles from './AdvancedBlock.module.scss';

const AdvancedBlock = ({
  type = 'default',
}: {
  type?: 'default' | 'panel-item' | 'modal';
}): JSX.Element => {
  const { state } = useContext(ConfigPanelContext);
  const forceUpdate = useForceUpdate();
  const lang = useI18n().beambox.right_panel.laser_panel;
  const workarea = useWorkarea();
  const supportInfo = useMemo(() => getSupportInfo(workarea), [workarea]);

  useEffect(() => {
    const canvasEvents = eventEmitterFactory.createEventEmitter('canvas');
    canvasEvents.on('document-settings-saved', forceUpdate);
    return () => {
      canvasEvents.off('document-settings-saved', forceUpdate);
    };
  }, [forceUpdate]);

  const contents = [];
  if (state.module.value !== LayerModule.PRINTER) {
    if (supportInfo.lowerFocus) {
      contents.push(<FocusBlock type={type} key="focus-block" />);
    } else if (supportInfo.autoFocus && beamboxPreference.read('enable-autofocus')) {
      contents.push(<AutoFocus key="auto-focus" />);
    }

    if (supportInfo.hybridLaser && beamboxPreference.read('enable-diode')) {
      contents.push(<Diode key="diode" />);
    }
  } else {
    contents.push(<SingleColorBlock key="single-color-block" />);
  }

  if (contents.length === 0) return null;
  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            contentPadding: 0,
            headerPadding: '0 20px',
          },
        },
        token: {
          padding: 0,
          paddingSM: 0,
        },
      }}
    >
      <Collapse
        className={styles.container}
        ghost
        defaultActiveKey={[]}
        items={[
          {
            key: '1',
            label: lang.advanced,
            children: <div className={styles.panel}>{contents}</div>,
          },
        ]}
      />
    </ConfigProvider>
  );
};

export default memo(AdvancedBlock);
