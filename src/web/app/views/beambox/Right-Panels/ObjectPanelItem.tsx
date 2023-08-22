import classNames from 'classnames';
import Icon from '@ant-design/icons';
import React, { useContext, useMemo } from 'react';
import { Button, Divider, Mask, Popover } from 'antd-mobile';

import ObjectPanelIcons from 'app/icons/object-panel/ObjectPanelIcons';
import storage from 'implementations/storage';
import units from 'helpers/units';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { ObjectPanelContext } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';

import styles from './ObjectPanelItem.module.scss';

let svgEditor;
getSVGAsync((globalSVG) => {
  svgEditor = globalSVG.Editor;
});

interface Props {
  id: string;
  content: JSX.Element;
  label?: string | JSX.Element;
  onClick?: () => void;
  disabled?: boolean;
}
const ObjectPanelItem = ({ id, content, label, onClick, disabled }: Props): JSX.Element => {
  const context = useContext(ObjectPanelContext);
  const { activeKey, updateActiveKey } = context;
  if (disabled) {
    return null;
  }
  return (
    <div
      id={id}
      className={classNames(styles['object-panel-item'], {
        [styles.active]: activeKey === id,
      })}
      onClick={() => {
        updateActiveKey(id);
        onClick?.();
      }}
    >
      <div className={styles.main}>{content}</div>
      {label && <div className={styles.label}>{label}</div>}
    </div>
  );
};

interface NumberItemProps {
  id: string;
  value: number;
  updateValue?: (val: number) => void;
  label?: string | JSX.Element;
  unit?: string;
  decimal?: number;
}
const ObjectPanelNumber = ({
  id,
  label,
  value,
  updateValue,
  unit = 'mm',
  decimal,
}: NumberItemProps): JSX.Element => {
  const context = useContext(ObjectPanelContext);
  const { activeKey, updateActiveKey } = context;
  const isActive = activeKey === id;
  const shouldConvert2Inch = useMemo(
    () => unit === 'mm' && storage.get('default-units') === 'inches',
    [unit]
  );
  // for unit conversion
  const fakeUnit = shouldConvert2Inch ? 'inch' : 'mm';
  const defaultPrecision = shouldConvert2Inch ? 4 : 2;
  const precision = decimal === undefined ? defaultPrecision : decimal;
  const valueInUnit = (+units.convertUnit(value, fakeUnit, 'mm').toFixed(precision)).toString();
  const [displayValue, setDisplayValue] = React.useState(valueInUnit);
  const onChange = (newValue: string) => {
    setDisplayValue(newValue);
    updateValue(units.convertUnit(+newValue || 0, 'mm', fakeUnit));
  };
  React.useEffect(() => {
    if (+displayValue !== +valueInUnit) {
      setDisplayValue(valueInUnit);
    } else if (!isActive && !displayValue) {
      setDisplayValue('0');
    }
  }, [displayValue, valueInUnit, isActive]);
  const isKeyDisabled = (key: string) => {
    if (key === '.') {
      return displayValue.includes('.') || precision === 0;
    }
    return displayValue.split('.')[1]?.length >= precision;
  };
  const NumberKeyboard = () => (
    <>
      <div className={styles['input-keys']}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((key) => (
          <Button
            key={key}
            shape="rounded"
            disabled={isKeyDisabled(key)}
            onClick={() => onChange(displayValue + key)}
          >
            {key}
          </Button>
        ))}
        <Button
          shape="rounded"
          onClick={() => onChange(displayValue.substring(0, displayValue.length - 1))}
        >
          <Icon className={styles.icon} component={ObjectPanelIcons.Delete} />
        </Button>
      </div>
      <div className={styles['step-buttons']}>
        <Button shape="rounded" onClick={() => onChange((+displayValue - 1).toString())}>
          <Icon className={styles.icon} component={ObjectPanelIcons.Minus} />
        </Button>
        <Button shape="rounded" onClick={() => onChange((+displayValue + 1).toString())}>
          <Icon className={styles.icon} component={ObjectPanelIcons.Plus} />
        </Button>
      </div>
    </>
  );
  return (
    <>
      <Mask
        visible={isActive}
        onMaskClick={() => {
          svgEditor.updateContextPanel();
          updateActiveKey(null);
        }}
        color="transparent"
      />
      <Popover
        className={styles['number-keyboard']}
        visible={isActive}
        content={<NumberKeyboard />}
      >
        <ObjectPanelItem
          id={id}
          label={label}
          content={
            <Button className={styles['number-item']} shape="rounded" size="mini" fill="outline">
              {displayValue}
              {unit === 'degree' && <>&deg;</>}
            </Button>
          }
        />
      </Popover>
    </>
  );
};

interface ActionListProps {
  id: string;
  actions: {
    icon: JSX.Element;
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }[];
  content: JSX.Element;
  label?: string;
  disabled?: boolean;
}
const ObjectPanelActionList = ({
  id,
  actions,
  content,
  label,
  disabled,
}: ActionListProps): JSX.Element => {
  const context = useContext(ObjectPanelContext);
  const { activeKey, updateActiveKey } = context;
  const isActive = activeKey === id;
  const [activeAction, setActiveAction] = React.useState<string[]>([]);
  const ActionList = () => (
    <div>
      {actions.map((action) => (
        <div
          className={classNames(styles.action, {
            [styles.disabled]: action.disabled,
            [styles.active]: activeAction.includes(action.label),
          })}
          onClick={() => {
            if (!action.disabled) {
              setActiveAction([...activeAction, action.label]);
              setTimeout(
                () =>
                  setActiveAction((value) => {
                    const idx = value.indexOf(action.label);
                    if (idx !== -1) {
                      value.splice(idx, 1);
                    }
                    return [...value];
                  }),
                1000
              );
              action.onClick();
            }
          }}
        >
          {action.icon}
          <span className={styles.label}>{action.label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Mask visible={isActive} onMaskClick={() => updateActiveKey(null)} color="transparent" />
      <Popover className={styles['action-list']} visible={isActive} content={<ActionList />}>
        <ObjectPanelItem id={id} content={content} label={label} disabled={disabled} />
      </Popover>
    </>
  );
};

const ObjectPanelDivider = (): JSX.Element => (
  <Divider className={styles.divider} direction="vertical" />
);

export default {
  ActionList: ObjectPanelActionList,
  Divider: ObjectPanelDivider,
  Item: ObjectPanelItem,
  Number: ObjectPanelNumber,
};
