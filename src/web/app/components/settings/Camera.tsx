import React, { useMemo } from 'react';

import i18n from 'helpers/i18n';
import SelectControl from 'app/components/settings/SelectControl';
import { OptionValues } from 'app/constants/enums';
import { PreviewSpeedLevel } from 'app/actions/beambox/constant';

interface Props {
  enableCustomPreviewHeightOptions: { value: OptionValues; label: string; selected: boolean }[];
  getBeamboxPreferenceEditingValue: (key: string) => any;
  updateBeamboxPreferenceChange: (key: string, newVal: any) => void;
}

function Camera({
  enableCustomPreviewHeightOptions,
  getBeamboxPreferenceEditingValue,
  updateBeamboxPreferenceChange,
}: Props): JSX.Element {
  const { lang } = i18n;
  const previewSpeedLevel = getBeamboxPreferenceEditingValue('preview_movement_speed_level') || 1;
  console.log('previewSpeedLevel', previewSpeedLevel);
  const options = useMemo(
    () => [
      {
        value: PreviewSpeedLevel.SLOW,
        label: lang.settings.slow,
        selected: previewSpeedLevel === PreviewSpeedLevel.SLOW,
      },
      {
        value: PreviewSpeedLevel.MEDIUM,
        label: lang.settings.medium,
        selected: previewSpeedLevel === PreviewSpeedLevel.MEDIUM,
      },
      {
        value: PreviewSpeedLevel.FAST,
        label: lang.settings.fast,
        selected: previewSpeedLevel === PreviewSpeedLevel.FAST,
      },
    ],
    [lang, previewSpeedLevel]
  );
  return (
    <>
      <div className="subtitle">{lang.settings.groups.camera}</div>
      <SelectControl
        id="set-camera-preview-speed-level"
        label={lang.settings.preview_movement_speed}
        options={options}
        onChange={(e) =>
          updateBeamboxPreferenceChange(
            'preview_movement_speed_level',
            parseInt(e.target.value, 10)
          )
        }
      />
      <SelectControl
        id="set-enable-custom-preview-height"
        label={lang.settings.custom_preview_height}
        options={enableCustomPreviewHeightOptions}
        onChange={(e) =>
          updateBeamboxPreferenceChange('enable-custom-preview-height', e.target.value)
        }
      />
    </>
  );
}

export default Camera;
