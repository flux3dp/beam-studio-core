/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import classNames from 'classnames';

import AutoSave from 'app/components/settings/AutoSave';
import autoSaveHelper from 'helpers/auto-save-helper';
import BeamboxConstant, { WorkAreaModel } from 'app/actions/beambox/constant';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import Camera from 'app/components/settings/Camera';
import Connection from 'app/components/settings/Connection';
import Editor from 'app/components/settings/Editor';
import Engraving from 'app/components/settings/Engraving';
import General from 'app/components/settings/General';
import i18n from 'helpers/i18n';
import Mask from 'app/components/settings/Mask';
import Module from 'app/components/settings/Module';
import Path from 'app/components/settings/Path';
import Privacy from 'app/components/settings/Privacy';
import settings from 'app/app-settings';
import storage from 'implementations/storage';
import TextToPath from 'app/components/settings/TextToPath';
import Update from 'app/components/settings/Update';
import { IConfig } from 'interfaces/IAutosave';
import { ILang } from 'interfaces/ILang';
import { StorageKey } from 'interfaces/IStorage';

enum OptionValues {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
}

interface State {
  lang?: ILang;
  editingAutosaveConfig?: IConfig;
  selectedModel: WorkAreaModel;
  warnings?: { [key: string]: string };
}

class Settings extends React.PureComponent<null, State> {
  private origLang: string;

  private beamboxPreferenceChanges: { [key: string]: any };

  private configChanges: { [key in StorageKey]: any };

  constructor(props) {
    super(props);
    this.state = {
      lang: i18n.lang,
      editingAutosaveConfig: autoSaveHelper.getConfig(),
      selectedModel: BeamboxPreference.read('model') || 'fbm1',
      warnings: {},
    };
    this.origLang = i18n.getActiveLang();
    this.beamboxPreferenceChanges = {};
    this.configChanges = {} as any;
  }

  changeActiveLang = (e: React.ChangeEvent): void => {
    const target = e.currentTarget as HTMLInputElement;
    i18n.setActiveLang(target.value);
    this.setState({
      lang: i18n.lang,
    });
  };

  updateConfigChange = (id: StorageKey, newVal: any): void => {
    let val = newVal;
    if (!Number.isNaN(Number(val))) {
      val = Number(val);
    }
    this.configChanges[id] = val;
    this.forceUpdate();
  };

  getConfigEditingValue = (key: StorageKey): any => {
    if (key in this.configChanges) {
      return this.configChanges[key];
    }
    return storage.get(key);
  };

  updateBeamboxPreferenceChange = (item_key: string, newVal: any): void => {
    let val = newVal;
    if (val === OptionValues.TRUE) {
      val = true;
    } else if (val === OptionValues.FALSE) {
      val = false;
    }
    this.beamboxPreferenceChanges[item_key] = val;
    this.forceUpdate();
  };

  getBeamboxPreferenceEditingValue = (key: string): any => {
    if (key in this.beamboxPreferenceChanges) {
      return this.beamboxPreferenceChanges[key];
    }
    return BeamboxPreference.read(key);
  };

  resetBS = (): void => {
    const { lang } = this.state;
    if (window.confirm(lang.settings.confirm_reset)) {
      storage.clearAllExceptIP();
      localStorage.clear();
      autoSaveHelper.useDefaultConfig();
      window.location.hash = '#';
      window.location.reload();
    }
  };

  handleDone = (): void => {
    const { editingAutosaveConfig } = this.state;
    let keys = Object.keys(this.configChanges);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i] as StorageKey;
      storage.set(key, this.configChanges[key]);
    }
    keys = Object.keys(this.beamboxPreferenceChanges);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      BeamboxPreference.write(key, this.beamboxPreferenceChanges[key]);
    }
    autoSaveHelper.setConfig(editingAutosaveConfig);
    window.location.hash = '#studio/beambox';
    window.location.reload();
  };

  handleCancel = (): void => {
    i18n.setActiveLang(this.origLang);
    window.location.hash = '#studio/beambox';
    window.location.reload();
  };

  onOffOptionFactory = (
    isOnSelected: boolean, onValue?, offValue?, onLabel?: string, offLabel?: string,
  ): { value: any, label: string, selected: boolean, }[] => {
    const { lang } = this.state;

    return [
      {
        value: onValue !== undefined ? onValue : OptionValues.TRUE,
        label: onLabel || lang.settings.on,
        selected: isOnSelected,
      },
      {
        value: offValue !== undefined ? offValue : OptionValues.FALSE,
        label: offLabel || lang.settings.off,
        selected: !isOnSelected,
      },
    ];
  };

  render() {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { supported_langs } = settings.i18n;
    const {
      lang,
      selectedModel,
      editingAutosaveConfig,
      warnings,
    } = this.state;

    const isNotificationOn = this.getConfigEditingValue('notification') === 1;
    const notificationOptions = this.onOffOptionFactory(
      isNotificationOn, 1, 0, lang.settings.notification_on, lang.settings.notification_off,
    );

    const isAutoCheckUpdateOn = this.getConfigEditingValue('auto_check_update') !== 0;
    const updateNotificationOptions = this.onOffOptionFactory(
      isAutoCheckUpdateOn, 1, 0, lang.settings.notification_on, lang.settings.notification_off,
    );

    const isGuessingPokeOn = this.getConfigEditingValue('guessing_poke') !== 0;
    const guessingPokeOptions = this.onOffOptionFactory(isGuessingPokeOn, 1, 0);

    const isAutoConnectOn = this.getConfigEditingValue('auto_connect') !== 0;
    const autoConnectOptions = this.onOffOptionFactory(isAutoConnectOn, 1, 0);

    const isGuideOpened = this.getBeamboxPreferenceEditingValue('show_guides') !== false;
    const guideSelectionOptions = this.onOffOptionFactory(isGuideOpened);

    const isDownsamplingOn = this.getBeamboxPreferenceEditingValue('image_downsampling') !== false;
    const imageDownsamplingOptions = this.onOffOptionFactory(
      isDownsamplingOn,
      OptionValues.TRUE,
      OptionValues.FALSE,
      lang.settings.low,
      lang.settings.high,
    );

    const isAntiAliasingOn = this.getBeamboxPreferenceEditingValue('anti-aliasing') !== false;
    const antiAliasingOptions = this.onOffOptionFactory(isAntiAliasingOn);

    const isContinuousDrawingOn = this.getBeamboxPreferenceEditingValue('continuous_drawing');
    const continuousDrawingOptions = this.onOffOptionFactory(isContinuousDrawingOn);

    const isSimplifyClipperPathOn = this.getBeamboxPreferenceEditingValue('simplify_clipper_path');
    const simplifyClipperPath = this.onOffOptionFactory(isSimplifyClipperPathOn);

    const isFastGradientOn = this.getBeamboxPreferenceEditingValue('fast_gradient') !== false;
    const fastGradientOptions = this.onOffOptionFactory(isFastGradientOn);

    const isVectorSpeedConstrainOn = this.getBeamboxPreferenceEditingValue('vector_speed_contraint') !== false;
    const vectorSpeedConstraintOptions = this.onOffOptionFactory(isVectorSpeedConstrainOn);

    const isPrecutSwitchOn = this.getBeamboxPreferenceEditingValue('blade_precut') === true;
    const precutSwitchOptions = this.onOffOptionFactory(isPrecutSwitchOn);

    const isMaskEnabled = this.getBeamboxPreferenceEditingValue('enable_mask');
    const maskOptions = this.onOffOptionFactory(isMaskEnabled);

    const isFontSubstitutionOn = this.getBeamboxPreferenceEditingValue('font-substitute') !== false;
    const fontSubstituteOptions = this.onOffOptionFactory(isFontSubstitutionOn);

    const isDefaultBorderlessOn = this.getBeamboxPreferenceEditingValue('default-borderless');
    const borderlessModeOptions = this.onOffOptionFactory(isDefaultBorderlessOn);

    const isDefaultAutofocusOn = this.getBeamboxPreferenceEditingValue('default-autofocus');
    const autofocusModuleOptions = this.onOffOptionFactory(isDefaultAutofocusOn);

    const isDefaultDiodeOn = this.getBeamboxPreferenceEditingValue('default-diode');
    const diodeModuleOptions = this.onOffOptionFactory(isDefaultDiodeOn);

    const isSentryEnabled = this.getConfigEditingValue('enable-sentry') === 1;
    const enableSentryOptions = this.onOffOptionFactory(isSentryEnabled, 1, 0);

    const autoSaveOptions = this.onOffOptionFactory(editingAutosaveConfig.enabled);

    const cameraMovementSpeed = Math.min(
      BeamboxConstant.camera.movementSpeed.x,
      BeamboxConstant.camera.movementSpeed.y,
    );

    const isAllValid = !warnings || (Object.keys(warnings).length === 0);

    return (
      <div className="studio-container settings-studio">
        <div className="settings-gradient-overlay" />
        <div className="form general">
          <General
            isWeb={window.FLUX.version === 'web'}
            supportedLangs={supported_langs}
            notificationOptions={notificationOptions}
            changeActiveLang={this.changeActiveLang}
            updateConfigChange={this.updateConfigChange}
          />
          <Update
            isWeb={window.FLUX.version === 'web'}
            updateNotificationOptions={updateNotificationOptions}
            updateConfigChange={this.updateConfigChange}
          />
          <Connection
            originalIP={this.getConfigEditingValue('poke-ip-addr')}
            guessingPokeOptions={guessingPokeOptions}
            autoConnectOptions={autoConnectOptions}
            updateConfigChange={this.updateConfigChange}
          />
          <AutoSave
            isWeb={window.FLUX.version === 'web'}
            autoSaveOptions={autoSaveOptions}
            editingAutosaveConfig={editingAutosaveConfig}
            warnings={warnings}
            updateState={(state) => this.setState(state)}
          />
          <Camera
            speed={{
              unit: this.getConfigEditingValue('default-units') === 'inches' ? 'in/s' : 'mm/s',
              decimal: this.getConfigEditingValue('default-units') === 'inches' ? 2 : 0,
              defaultValue: (this.getBeamboxPreferenceEditingValue('preview_movement_speed') || cameraMovementSpeed) / 60,
              getValue: (val) => this.updateBeamboxPreferenceChange('preview_movement_speed', val * 60),
            }}
            speedHL={{
              unit: this.getConfigEditingValue('default-units') === 'inches' ? 'in/s' : 'mm/s',
              decimal: this.getConfigEditingValue('default-units') === 'inches' ? 2 : 0,
              defaultValue: (this.getBeamboxPreferenceEditingValue('preview_movement_speed_hl') || (cameraMovementSpeed * 0.6)) / 60,
              getValue: (val) => this.updateBeamboxPreferenceChange('preview_movement_speed_hl', val * 60),
            }}
          />
          <Editor
            defaultUnit={this.getConfigEditingValue('default-units')}
            x0={this.getBeamboxPreferenceEditingValue('guide_x0')}
            y0={this.getBeamboxPreferenceEditingValue('guide_y0')}
            selectedModel={selectedModel}
            guideSelectionOptions={guideSelectionOptions}
            imageDownsamplingOptions={imageDownsamplingOptions}
            antiAliasingOptions={antiAliasingOptions}
            continuousDrawingOptions={continuousDrawingOptions}
            simplifyClipperPath={simplifyClipperPath}
            updateConfigChange={this.updateConfigChange}
            updateBeamboxPreferenceChange={this.updateBeamboxPreferenceChange}
            updateModel={(newModel) => this.setState({ selectedModel: newModel })}
          />
          <Engraving
            fastGradientOptions={fastGradientOptions}
            updateBeamboxPreferenceChange={this.updateBeamboxPreferenceChange}
          />
          <Path
            selectedModel={selectedModel}
            defaultUnit={this.getConfigEditingValue('default-units')}
            vectorSpeedConstraintOptions={vectorSpeedConstraintOptions}
            precutSwitchOptions={precutSwitchOptions}
            loopCompensation={this.getConfigEditingValue('loop_compensation')}
            bladeRadius={this.getBeamboxPreferenceEditingValue('blade_radius')}
            precutX={this.getBeamboxPreferenceEditingValue('precut_x')}
            precutY={this.getBeamboxPreferenceEditingValue('precut_y')}
            updateConfigChange={this.updateConfigChange}
            updateBeamboxPreferenceChange={this.updateBeamboxPreferenceChange}
          />
          <Mask
            maskOptions={maskOptions}
            updateBeamboxPreferenceChange={this.updateBeamboxPreferenceChange}
          />
          <TextToPath
            fontSubstituteOptions={fontSubstituteOptions}
            updateBeamboxPreferenceChange={this.updateBeamboxPreferenceChange}
          />
          <Module
            defaultUnit={this.getConfigEditingValue('default-units')}
            selectedModel={selectedModel}
            diodeOffsetX={this.getBeamboxPreferenceEditingValue('diode_offset_x')}
            diodeOffsetY={this.getBeamboxPreferenceEditingValue('diode_offset_y')}
            borderlessModeOptions={borderlessModeOptions}
            autofocusModuleOptions={autofocusModuleOptions}
            diodeModuleOptions={diodeModuleOptions}
            updateBeamboxPreferenceChange={this.updateBeamboxPreferenceChange}
          />
          <Privacy
            enableSentryOptions={enableSentryOptions}
            updateConfigChange={this.updateConfigChange}
          />

          <div className="font5" onClick={this.resetBS}>
            <b>{lang.settings.reset_now}</b>
          </div>
          <div className="clearfix" />
          <div className={classNames('btn btn-done', { disabled: !isAllValid })} onClick={this.handleDone}>{lang.settings.done}</div>
          <div className="btn btn-cancel" onClick={this.handleCancel}>{lang.settings.cancel}</div>
        </div>
      </div>
    );
  }
}

export default Settings;
