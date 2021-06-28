/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-alert */
/* eslint-disable react/no-multi-comp */
import * as React from 'react';
import classNames from 'classnames';

import alert from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import autoSaveHelper from 'helpers/auto-save-helper';
import BeamboxConstant, { WorkAreaModel } from 'app/actions/beambox/constant';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import browser from 'implementations/browser';
import FontFuncs from 'app/actions/beambox/font-funcs';
import i18n from 'helpers/i18n';
import PathInput, { InputType } from 'app/widgets/PathInput';
import SelectView from 'app/widgets/Select';
import storage from 'implementations/storage';
import UnitInput from 'app/widgets/Unit-Input-v2';
import { IConfig } from 'interfaces/IAutosave';
import { IFont } from 'interfaces/IFont';
import { ILang } from 'interfaces/ILang';
import { StorageKey } from 'interfaces/IStorage';

interface ControlsProps {
  id?:string,
  label: string,
  url?: string,
  warningText?: string,
  children: JSX.Element | JSX.Element[],
}
const Controls = ({ label, url = '', warningText, children }: ControlsProps): JSX.Element => {
  const style = { width: 'calc(100% / 10 * 3 - 10px)' };
  const innerHtml = { __html: label };

  const warningIcon = () => {
    if (warningText) {
      return (<img src="img/warning.svg" title={warningText} />);
    }
    return null;
  };

  const renderIcon = () => {
    if (url) {
      return (
        <span className="info-icon-small">
          <img src="img/info.svg" onClick={() => { browser.open(url); }} />
        </span>
      );
    }
    return null;
  };

  return (
    <div className="row-fluid">
      <div className="span3 no-left-margin" style={style}>
        <label
          className="font2"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={innerHtml}
        />
        {renderIcon()}
      </div>
      <div className="span8 font3">
        {children}
        {warningIcon()}
      </div>
    </div>
  );
};

Controls.defaultProps = {
  url: '',
  warningText: null,
};

enum OptionValues {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
}

interface ISelectControlProps {
  id?: string,
  label: string,
  url?: string,
  onChange: (e) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: { value: any, label: string, selected: boolean }[],
}

const SelectControl = ({
  id, url, label, onChange, options,
}: ISelectControlProps) => (
  <Controls label={label} url={url}>
    <SelectView
      id={id}
      className="font3"
      options={options}
      onChange={onChange}
    />
  </Controls>
);

SelectControl.defaultProps = {
  id: null,
};

interface Props {
  supported_langs: { [key: string]: string };
}

interface State {
  lang?: ILang;
  editingAutosaveConfig?: IConfig;
  selectedModel: WorkAreaModel;
  warnings?: { [key: string]: string };
}

class SettingGeneral extends React.Component<Props, State> {
  private origLang: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private beamboxPreferenceChanges: { [key: string]: any };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private configChanges: { [key in StorageKey]: any };

  constructor(props: Props) {
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

  checkIPFormat = (e: React.FocusEvent): void => {
    const me = e.currentTarget as HTMLInputElement;
    const { lang } = this.state;
    const originalIP = this.getConfigEditingValue('poke-ip-addr');
    const ips = me.value.split(/[,;] ?/);
    const ipv4Pattern = /^\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/;

    for (let i = 0; i < ips.length; i += 1) {
      const ip = ips[i];
      if (ip !== '' && typeof ip === 'string' && ipv4Pattern.test(ip) === false) {
        me.value = originalIP;
        alert.popUp({
          id: 'wrong-ip-error',
          type: alertConstants.SHOW_POPUP_ERROR,
          message: `${lang.settings.wrong_ip_format}\n${ip}`,
        });
        return;
      }
    }

    this.configChanges['poke-ip-addr'] = me.value;
  };

  changeActiveLang = (e: React.ChangeEvent): void => {
    const target = e.currentTarget as HTMLInputElement;
    i18n.setActiveLang(target.value);
    this.setState({
      lang: i18n.lang,
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateConfigChange = (id: StorageKey, newVal: any): void => {
    let val = newVal;
    if (!Number.isNaN(Number(val))) {
      val = Number(val);
    }
    this.configChanges[id] = val;
    this.forceUpdate();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getConfigEditingValue = (key: StorageKey): any => {
    if (key in this.configChanges) {
      return this.configChanges[key];
    }
    return storage.get(key);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getBeamboxPreferenceEditingValue = (key: string): any => {
    if (key in this.beamboxPreferenceChanges) {
      return this.beamboxPreferenceChanges[key];
    }
    return BeamboxPreference.read(key);
  };

  removeDefaultMachine = (): void => {
    const { lang } = this.state;
    if (window.confirm(lang.settings.confirm_remove_default)) {
      this.forceUpdate();
    }
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  renderAutosaveBlock(): JSX.Element {
    const { lang, editingAutosaveConfig, warnings } = this.state;
    const isAutoSaveOn = editingAutosaveConfig.enabled;
    const autoSaveOptions = this.onOffOptionFactory(isAutoSaveOn);
    return (
      <div>
        <div className="subtitle">{lang.settings.groups.autosave}</div>
        <SelectControl
          label={lang.settings.autosave_enabled}
          options={autoSaveOptions}
          onChange={(e) => {
            const enabled = e.target.value === OptionValues.TRUE;
            editingAutosaveConfig.enabled = enabled;
            this.setState({ editingAutosaveConfig });
          }}
        />
        <Controls
          label={lang.settings.autosave_path}
          warningText={warnings.autosave_directory}
        >
          <PathInput
            buttonTitle={lang.general.choose_folder}
            className={classNames({ 'with-error': !!warnings.autosave_directory })}
            defaultValue={editingAutosaveConfig.directory}
            forceValidValue={false}
            getValue={(val: string, isValid: boolean) => {
              editingAutosaveConfig.directory = val;
              if (!isValid) {
                warnings.autosave_directory = lang.settings.autosave_path_not_correct;
              } else {
                delete warnings.autosave_directory;
              }
              this.setState({ editingAutosaveConfig, warnings });
            }}
            type={InputType.FOLDER}
          />
        </Controls>
        <Controls label={lang.settings.autosave_interval}>
          <UnitInput
            unit={lang.monitor.minute}
            min={1}
            max={60}
            decimal={0}
            defaultValue={editingAutosaveConfig.timeInterval}
            getValue={(val: number) => {
              editingAutosaveConfig.timeInterval = val;
              this.setState({ editingAutosaveConfig });
            }}
            className={{ half: true }}
          />
        </Controls>
        <Controls label={lang.settings.autosave_number}>
          <UnitInput
            min={1}
            max={10}
            decimal={0}
            defaultValue={editingAutosaveConfig.fileNumber}
            getValue={(val: number) => {
              editingAutosaveConfig.fileNumber = val;
              this.setState({ editingAutosaveConfig });
            }}
            className={{ half: true }}
          />
        </Controls>
      </div>
    );
  }

  render() {
    const { supported_langs: supportedLangs } = this.props;
    const { lang, selectedModel, warnings } = this.state;
    const pokeIP = storage.get('poke-ip-addr');
    const langOptions = [];

    Object.keys(supportedLangs).forEach((l) => {
      langOptions.push({
        value: l,
        label: supportedLangs[l],
        selected: l === i18n.getActiveLang(),
      });
    });

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

    const defaultUnitsOptions = [
      {
        value: 'mm',
        label: lang.menu.mm,
        selected: this.getConfigEditingValue('default-units') === 'mm',
      },
      {
        value: 'inches',
        label: lang.menu.inches,
        selected: this.getConfigEditingValue('default-units') === 'inches',
      },
    ];

    const defaultFont = storage.get('default-font') as IFont || {
      family: 'Arial',
      style: 'Regular',
    };
    const fontOptions = FontFuncs.availableFontFamilies.map((family: string) => {
      const fontName = FontFuncs.fontNameMap.get(family);
      const label = typeof fontName === 'string' ? fontName : family;
      return {
        value: family,
        label,
        selected: family === defaultFont.family,
      };
    });
    const onSelectFont = (family) => {
      const fonts = FontFuncs.requestFontsOfTheFontFamily(family);
      const newDefaultFont = fonts.filter((font) => font.style === 'Regular')[0] || fonts[0];
      storage.set('default-font', {
        family: newDefaultFont.family,
        postscriptName: newDefaultFont.postscriptName,
        style: newDefaultFont.style,
      });
      this.forceUpdate();
    };
    const fonts = FontFuncs.requestFontsOfTheFontFamily(defaultFont.family);
    const fontStyleOptions = fonts.map((font) => ({
      value: font.postscriptName,
      label: font.style,
      selected: font.style === defaultFont.style,
    }));
    const onSelectFontStyle = (postscriptName) => {
      const newDefaultFont = FontFuncs.getFontOfPostscriptName(postscriptName);
      storage.set('default-font', {
        family: newDefaultFont.family,
        postscriptName: newDefaultFont.postscriptName,
        style: newDefaultFont.style,
      });
      this.forceUpdate();
    };

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

    const defaultBeamboxModelOptions = [
      {
        value: 'fbm1',
        label: 'beamo',
        selected: selectedModel === 'fbm1',
      },
      {
        value: 'fbb1b',
        label: 'Beambox',
        selected: selectedModel === 'fbb1b',
      },
      {
        value: 'fbb1p',
        label: 'Beambox Pro',
        selected: selectedModel === 'fbb1p',
      },
    ];

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

    const cameraMovementSpeed = Math.min(
      BeamboxConstant.camera.movementSpeed.x,
      BeamboxConstant.camera.movementSpeed.y,
    );

    const isAllValid = !warnings || (Object.keys(warnings).length === 0);

    return (
      <div className="form general">
        <div className="subtitle">{lang.settings.groups.general}</div>
        <SelectControl
          label={lang.settings.language}
          id="select-lang"
          options={langOptions}
          onChange={this.changeActiveLang}
        />
        <SelectControl
          label={lang.settings.notifications}
          id='qa-set-notifications'
          options={notificationOptions}
          onChange={(e) => this.updateConfigChange('notification', e.target.value)}
        />

        <div className="subtitle">{lang.settings.groups.update}</div>
        <SelectControl
          label={lang.settings.check_updates}
          id='qa-set-groups-update'
          options={updateNotificationOptions}
          onChange={(e) => this.updateConfigChange('auto_check_update', e.target.value)}
        />

        <div className="subtitle">
          {lang.settings.groups.connection}
          <span className="info-icon-medium">
            <img
              src="img/info.svg"
              onClick={()=> { browser.open(lang.settings.help_center_urls.connection)}}
            />
          </span>
        </div>
        <Controls label={lang.settings.ip}>
          <input
            id="qa-settings-ip"
            type="text"
            autoComplete="false"
            defaultValue={pokeIP}
            onBlur={this.checkIPFormat}
          />
        </Controls>
        <SelectControl
          label={lang.settings.guess_poke}
          id='qa-set-guess-poke'
          options={guessingPokeOptions}
          onChange={(e) => this.updateConfigChange('guessing_poke', e.target.value)}
        />
        <SelectControl
          label={lang.settings.auto_connect}
          id='qa-set-auto-connect'
          options={autoConnectOptions}
          onChange={(e) => this.updateConfigChange('auto_connect', e.target.value)}
        />

        {this.renderAutosaveBlock()}

        <div className="subtitle">{lang.settings.groups.camera}</div>
        <Controls label={lang.settings.preview_movement_speed}>
          <UnitInput
            id='qa-set-groups-camera'
            unit={this.getConfigEditingValue('default-units') === 'inches' ? 'in/s' : 'mm/s'}
            min={3}
            max={300}
            decimal={this.getConfigEditingValue('default-units') === 'inches' ? 2 : 0}
            defaultValue={(this.getBeamboxPreferenceEditingValue('preview_movement_speed') || cameraMovementSpeed) / 60}
            getValue={(val) => this.updateBeamboxPreferenceChange('preview_movement_speed', val * 60)}
            className={{ half: true }}
          />
        </Controls>
        <Controls label={lang.settings.preview_movement_speed_hl}>
          <UnitInput
            id='qa-set-preview-movement-speed-hl'
            unit={this.getConfigEditingValue('default-units') === 'inches' ? 'in/s' : 'mm/s'}
            min={3}
            max={300}
            decimal={this.getConfigEditingValue('default-units') === 'inches' ? 2 : 0}
            defaultValue={(this.getBeamboxPreferenceEditingValue('preview_movement_speed_hl') || (cameraMovementSpeed * 0.6)) / 60}
            getValue={(val) => this.updateBeamboxPreferenceChange('preview_movement_speed_hl', val * 60)}
            className={{ half: true }}
          />
        </Controls>

        <div className="subtitle">{lang.settings.groups.editor}</div>
        <SelectControl
          label={lang.settings.default_units}
          id='qa-set-groups-editor'
          options={defaultUnitsOptions}
          onChange={(e) => this.updateConfigChange('default-units', e.target.value)}
        />
        <SelectControl
          label={lang.settings.default_font_family}
          id='qa-set-font-family'
          options={fontOptions}
          onChange={(e) => onSelectFont(e.target.value)}
        />
        <SelectControl
          label={lang.settings.default_font_style}
          id='qa-set-font-style'
          options={fontStyleOptions}
          onChange={(e) => onSelectFontStyle(e.target.value)}
        />
        <SelectControl
          label={lang.settings.default_beambox_model}
          id='qa-set-beambox-model'
          options={defaultBeamboxModelOptions}
          onChange={(e) => {
            this.updateBeamboxPreferenceChange('model', e.target.value);
            this.setState({ selectedModel: e.target.value });
          }}
        />
        <SelectControl
          label={lang.settings.guides}
          id="qa-set-guide"
          options={guideSelectionOptions}
          onChange={(e) => this.updateBeamboxPreferenceChange('show_guides', e.target.value)}
        />
        <Controls label={lang.settings.guides_origin}>
          <span className="font2" style={{ marginRight: '10px', lineHeight: '32px' }}>X</span>
          <UnitInput
            id='qa-set-settings-guides-originx'
            unit={this.getConfigEditingValue('default-units') === 'inches' ? 'in' : 'mm'}
            min={0}
            max={BeamboxConstant.dimension.getWidth(selectedModel) / 10}
            defaultValue={this.getBeamboxPreferenceEditingValue('guide_x0')}
            getValue={(val) => this.updateBeamboxPreferenceChange('guide_x0', val)}
            forceUsePropsUnit
            className={{ half: true }}
          />
          <span className="font2" style={{ marginRight: '10px', lineHeight: '32px' }}>Y</span>
          <UnitInput
            id='qa-set-settings-guides-originy'
            unit={this.getConfigEditingValue('default-units') === 'inches' ? 'in' : 'mm'}
            min={0}
            max={BeamboxConstant.dimension.getHeight(selectedModel) / 10}
            defaultValue={this.getBeamboxPreferenceEditingValue('guide_y0')}
            getValue={(val) => this.updateBeamboxPreferenceChange('guide_y0', val)}
            forceUsePropsUnit
            className={{ half: true }}
          />
        </Controls>
        <SelectControl
          label={lang.settings.image_downsampling}
          id='qa-set-downsampling'
          url={lang.settings.help_center_urls.image_downsampling}
          options={imageDownsamplingOptions}
          onChange={(e) => this.updateBeamboxPreferenceChange('image_downsampling', e.target.value)}
        />
        <SelectControl
          label={lang.settings.anti_aliasing}
          id='qa-set-anti_aliasing'
          url={lang.settings.help_center_urls.anti_aliasing}
          options={antiAliasingOptions}
          onChange={(e) => this.updateBeamboxPreferenceChange('anti-aliasing', e.target.value)}
        />
        <SelectControl
          label={lang.settings.continuous_drawing}
          id='qa-set-continuous-drawing'
          url={lang.settings.help_center_urls.continuous_drawing}
          options={continuousDrawingOptions}
          onChange={(e) => this.updateBeamboxPreferenceChange('continuous_drawing', e.target.value)}
        />
        <SelectControl
          label={lang.settings.simplify_clipper_path}
          id='qa-set-simplify-clipper-path'
          url={lang.settings.help_center_urls.simplify_clipper_path}
          options={simplifyClipperPath}
          onChange={(e) => this.updateBeamboxPreferenceChange('simplify_clipper_path', e.target.value)}
        />

        <div className="subtitle">{lang.settings.groups.engraving}</div>
        <SelectControl
          label={lang.settings.fast_gradient}
          id='qa-set-groups-engraving'
          url={lang.settings.help_center_urls.fast_gradient}
          options={fastGradientOptions}
          onChange={(e) => this.updateBeamboxPreferenceChange('fast_gradient', e.target.value)}
        />

        <div className="subtitle">{lang.settings.groups.path}</div>
        <SelectControl
          label={lang.settings.vector_speed_constraint}
          id='qa-set-vector-speed-constraint'
          url={lang.settings.help_center_urls.vector_speed_constraint}
          options={vectorSpeedConstraintOptions}
          onChange={(e) => this.updateBeamboxPreferenceChange('vector_speed_contraint', e.target.value)}
        />
        <Controls
          label={lang.settings.loop_compensation}
          url={lang.settings.help_center_urls.loop_compensation}
        >
          <UnitInput
            unit={this.getConfigEditingValue('default-units') === 'inches' ? 'in' : 'mm'}
            min={0}
            max={20}
            defaultValue={Number(this.getConfigEditingValue('loop_compensation') || '0') / 10}
            getValue={(val) => this.updateConfigChange('loop_compensation', Number(val) * 10)}
            forceUsePropsUnit
            className={{ half: true }}
            id = 'qa-set-loop-compensation'
          />
        </Controls>
        { i18n.getActiveLang() === 'zh-cn'
          ? (
            <div>
              <Controls label={lang.settings.blade_radius}>
                <UnitInput
                  unit={this.getConfigEditingValue('default-units') === 'inches' ? 'in' : 'mm'}
                  min={0}
                  max={30}
                  step={0.01}
                  defaultValue={this.getBeamboxPreferenceEditingValue('blade_radius') || 0}
                  getValue={(val) => this.updateBeamboxPreferenceChange('blade_radius', val)}
                  forceUsePropsUnit
                  className={{ half: true }}
                  id='qa-set-blade-radius'
                />
              </Controls>
              <SelectControl
                label={lang.settings.blade_precut_switch}
                id='qa-set-blade-precut-switch'
                options={precutSwitchOptions}
                onChange={(e) => this.updateBeamboxPreferenceChange('blade_precut', e.target.value)}
              />
              <Controls label={lang.settings.blade_precut_position}>
                <span className="font2" style={{ marginRight: '10px' }}>X</span>
                <UnitInput
                  unit={this.getConfigEditingValue('default-units') === 'inches' ? 'in' : 'mm'}
                  min={0}
                  max={BeamboxConstant.dimension.getWidth(selectedModel) / 10}
                  defaultValue={this.getBeamboxPreferenceEditingValue('precut_x') || 0}
                  getValue={(val) => this.updateBeamboxPreferenceChange('precut_x', val)}
                  forceUsePropsUnit
                  className={{ half: true }}
                  id = 'qa-set-blade-precut-positionx'
                />
                <span className="font2" style={{ marginRight: '10px' }}>Y</span>
                <UnitInput
                  unit={this.getConfigEditingValue('default-units') === 'inches' ? 'in' : 'mm'}
                  min={0}
                  max={BeamboxConstant.dimension.getHeight(selectedModel) / 10}
                  defaultValue={this.getBeamboxPreferenceEditingValue('precut_y') || 0}
                  getValue={(val) => this.updateBeamboxPreferenceChange('precut_y', val)}
                  forceUsePropsUnit
                  className={{ half: true }}
                  id='qa-set-blade-precut-positiony'
                />
              </Controls>
            </div>
          )
          : null}
        <div className="subtitle">{lang.settings.groups.mask}</div>
        <SelectControl
          label={lang.settings.mask}
          url={lang.settings.help_center_urls.mask}
          id="set-mask"
          options={maskOptions}
          onChange={(e) => this.updateBeamboxPreferenceChange('enable_mask', e.target.value)}
        />

        <div className="subtitle">{lang.settings.groups.text_to_path}</div>
        <SelectControl
          label={lang.settings.font_substitute}
          url={lang.settings.help_center_urls.font_substitute}
          id="font-substitue"
          options={fontSubstituteOptions}
          onChange={(e) => this.updateBeamboxPreferenceChange('font-substitute', e.target.value)}
        />

        <div className="subtitle">{lang.settings.groups.modules}</div>
        <SelectControl
          label={lang.settings.default_borderless_mode}
          url={lang.settings.help_center_urls.default_borderless_mode}
          id="default-open-bottom"
          options={borderlessModeOptions}
          onChange={(e) => this.updateBeamboxPreferenceChange('default-borderless', e.target.value)}
        />
        <SelectControl
          label={lang.settings.default_enable_autofocus_module}
          url={lang.settings.help_center_urls.default_enable_autofocus_module}
          id="default-autofocus"
          options={autofocusModuleOptions}
          onChange={(e) => this.updateBeamboxPreferenceChange('default-autofocus', e.target.value)}
        />
        <SelectControl
          label={lang.settings.default_enable_diode_module}
          url={lang.settings.help_center_urls.default_enable_diode_module}
          id="default-diode"
          options={diodeModuleOptions}
          onChange={(e) => this.updateBeamboxPreferenceChange('default-diode', e.target.value)}
        />
        <Controls label={lang.settings.diode_offset}>
          <span className="font2" style={{ marginRight: '10px', lineHeight: '32px' }}>X</span>
          <UnitInput
            unit={this.getConfigEditingValue('default-units') === 'inches' ? 'in' : 'mm'}
            min={0}
            max={BeamboxConstant.dimension.getWidth(selectedModel) / 10}
            defaultValue={this.getBeamboxPreferenceEditingValue('diode_offset_x') || 0}
            getValue={(val) => this.updateBeamboxPreferenceChange('diode_offset_x', val)}
            forceUsePropsUnit
            className={{ half: true }}
            id='qa-settings-diode-offsetx'
          />
          <span className="font2" style={{ marginRight: '10px', lineHeight: '32px' }}>Y</span>
          <UnitInput
            unit={this.getConfigEditingValue('default-units') === 'inches' ? 'in' : 'mm'}
            min={0}
            max={BeamboxConstant.dimension.getHeight(selectedModel) / 10}
            defaultValue={this.getBeamboxPreferenceEditingValue('diode_offset_y') || 0}
            getValue={(val) => this.updateBeamboxPreferenceChange('diode_offset_y', val)}
            forceUsePropsUnit
            className={{ half: true }}
            id='qa-settings-diode-offsety'
          />
        </Controls>

        <div className="subtitle">{lang.settings.groups.privacy}</div>
        <SelectControl
          label={lang.settings.share_with_flux}
          id="set-sentry"
          options={enableSentryOptions}
          onChange={(e) => this.updateConfigChange('enable-sentry', e.target.value)}
        />

        <div className="font5" onClick={this.resetBS}>
          <b>{lang.settings.reset_now}</b>
        </div>
        <div className="clearfix" />
        <div className={classNames('btn btn-done', { disabled: !isAllValid })} onClick={this.handleDone}>{lang.settings.done}</div>
        <div className="btn btn-cancel" onClick={this.handleCancel}>{lang.settings.cancel}</div>
      </div>
    );
  }
}

export default SettingGeneral;
