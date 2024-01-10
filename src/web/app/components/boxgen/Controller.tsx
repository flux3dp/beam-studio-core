import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Divider,
  Form,
  InputNumber,
  Radio,
  Select,
  Slider,
  Space,
  Switch,
  Tooltip,
} from 'antd';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { sprintf } from 'sprintf-js';

import useI18n from 'helpers/useI18n';
import { BoxgenContext } from 'app/contexts/BoxgenContext';
import { IController } from 'interfaces/IBoxgen';
import {
  SCREW_LENGTH_INCH,
  SCREW_LENGTH_MM,
  SCREW_SIZE_INCH,
  SCREW_SIZE_MM,
  SHEET_THICKNESS_INCH,
  SHEET_THICKNESS_MM,
} from 'app/constants/boxgen-constants';

import styles from './Controller.module.scss';

const LengthInputItem = ({
  className,
  label,
  name,
  hidden,
  min = 0,
  max,
  step = 1,
  additionalDecimal = 0,
}: {
  className?: string;
  label: string;
  name: string;
  hidden?: boolean;
  min?: number;
  max?: number;
  step?: number;
  additionalDecimal?: number;
}) => {
  const { lengthUnit } = useContext(BoxgenContext);
  const { unit, unitRatio, decimal } = lengthUnit;
  return (
    <Form.Item className={className} label={label} name={name} hidden={hidden}>
      <InputNumber
        className={styles['number-input']}
        type="number"
        min={min}
        max={max}
        addonAfter={unit}
        step={step * unitRatio}
        formatter={(v, { userTyping, input }) =>
          userTyping ? input : ((v as number) / unitRatio).toFixed(decimal + additionalDecimal)
        }
        parser={(v) => Number(v) * unitRatio}
      />
    </Form.Item>
  );
};

const Controller = (): JSX.Element => {
  const lang = useI18n().boxgen;

  const { boxData, setBoxData, workarea, lengthUnit } = useContext(BoxgenContext);
  const workareaLimit = Math.min(workarea.canvasWidth, workarea.canvasHeight);
  const { unit, unitRatio, decimal } = lengthUnit;
  const isMM = unit === 'mm';

  const [customThickness, setCustomThickness] = useState(0);
  const [thicknessOptions, setOptions] = useState([]);

  const screwSizes = isMM ? SCREW_SIZE_MM : SCREW_SIZE_INCH;
  const screwLens = isMM ? SCREW_LENGTH_MM : SCREW_LENGTH_INCH;
  useEffect(() => {
    setOptions(isMM ? SHEET_THICKNESS_MM : SHEET_THICKNESS_INCH);
  }, [isMM]);
  const maxTSlotCount = useMemo(
    () => Math.max(1, Math.floor(Math.max(boxData.width, boxData.height, boxData.depth) / 30)),
    [boxData]
  );
  const maxTeethLength = useMemo(
    () => Math.max(boxData.width, boxData.height, boxData.depth) - boxData.sheetThickness * 2 - 5,
    [boxData]
  );

  const [form] = Form.useForm();

  const onValuesChange = (): void => {
    const fields: IController = form.getFieldsValue(true);
    let { teethLength } = fields;
    if (fields.joint === 't-slot') {
      teethLength =
        Math.min(fields.width, fields.height, fields.depth) / (fields.tSlotCount * 2 + 1);
      form.setFieldValue('teethLength', teethLength);
    } else if (fields.joint === 'edge') {
      teethLength = Math.max(fields.width, fields.height, fields.depth);
    } else {
      teethLength = Math.min(teethLength, maxTeethLength);
      form.setFieldValue('teethLength', teethLength);
    }
    const innerSizeInflation: number =
      fields.volume === 'inner' ? Number(fields.sheetThickness) * 2 : 0;
    const newData = {
      ...fields,
      width: fields.width + innerSizeInflation,
      height: fields.height + innerSizeInflation,
      depth: fields.depth + innerSizeInflation,
      teethLength,
    };
    setBoxData(newData);
  };

  const addThicknessOptions = () => {
    if (customThickness <= 0 || thicknessOptions.some((option) => option.value === customThickness))
      return;
    setOptions([
      ...thicknessOptions,
      {
        label: `${+(customThickness / unitRatio).toFixed(decimal)} ${unit}`,
        value: customThickness,
      },
    ]);
  };

  return (
    <div className={styles.controller}>
      <div className={styles.workarea}>
        <Tooltip
          title={sprintf(lang.max_dimension_tooltip, `${workareaLimit}mm`)}
          placement="bottomLeft"
          arrow={{ pointAtCenter: true }}
        >
          <QuestionCircleOutlined className={styles.icon} />
        </Tooltip>
        <span>
          {lang.workarea} : {workarea.label} ( {workarea.canvasWidth}x{workarea.canvasHeight}mm
          <sup>2</sup> )
        </span>
      </div>
      <Form
        className={styles.form}
        form={form}
        labelCol={{ span: 6 }}
        onValuesChange={onValuesChange}
        initialValues={boxData}
      >
        <Form.Item label={lang.volume} name="volume">
          <Radio.Group>
            <Radio.Button value="outer">{lang.outer}</Radio.Button>
            <Radio.Button value="inner">{lang.inner}</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label={lang.cover} name="cover" valuePropName="checked">
          <Switch />
        </Form.Item>
        <LengthInputItem
          className={styles['small-margin']}
          label={lang.width}
          min={0}
          max={workareaLimit}
          name="width"
        />
        <LengthInputItem
          className={styles['small-margin']}
          label={lang.height}
          min={0}
          max={workareaLimit}
          name="height"
        />
        <LengthInputItem label={lang.depth} min={0} max={workareaLimit} name="depth" />
        <Form.Item label={lang.thickness} name="sheetThickness">
          <Select
            options={thicknessOptions}
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider className={styles.divider} />
                <Space
                  className={styles['thickness-editor']}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <InputNumber<number>
                    type="number"
                    defaultValue={customThickness}
                    addonAfter={unit}
                    min={0}
                    step={unitRatio}
                    formatter={(v, { userTyping, input }) =>
                      userTyping ? input : (v / unitRatio).toFixed(decimal)
                    }
                    parser={(v) => +v * unitRatio}
                    onChange={setCustomThickness}
                    onPressEnter={addThicknessOptions}
                  />
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    disabled={
                      customThickness <= 0 ||
                      thicknessOptions.some((option) => option.value === customThickness)
                    }
                    onClick={addThicknessOptions}
                  >
                    {lang.add_option}
                  </Button>
                </Space>
              </>
            )}
          />
        </Form.Item>
        <Form.Item label={lang.joints} name="joint">
          <Select>
            <Select.Option value="edge">{lang.edge}</Select.Option>
            <Select.Option value="finger">{lang.finger}</Select.Option>
            <Select.Option value="t-slot">{lang.tSlot}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          className={styles['teeth-length']}
          label={lang.finger}
          name="teethLength"
          hidden={boxData.joint !== 'finger'}
        >
          <Form.Item className={styles['no-margin']} name="teethLength">
            <Slider
              min={1}
              max={maxTeethLength}
              step={0.1 * unitRatio}
              tooltip={{
                formatter: (val: number) => (val / unitRatio).toFixed(decimal + 1),
              }}
            />
          </Form.Item>
          <LengthInputItem
            className={styles['no-margin']}
            label=""
            name="teethLength"
            hidden={boxData.joint !== 'finger'}
            min={1}
            max={maxTeethLength}
            step={0.1}
            additionalDecimal={1}
          />
        </Form.Item>

        <Form.Item label={lang.tCount} name="tSlotCount" hidden={boxData.joint !== 't-slot'}>
          <Slider min={1} max={maxTSlotCount} step={1} />
        </Form.Item>
        <Form.Item label={lang.tDiameter} name="tSlotDiameter" hidden={boxData.joint !== 't-slot'}>
          <Select options={screwSizes} />
        </Form.Item>
        <Form.Item label={lang.tLength} name="tSlotLength" hidden={boxData.joint !== 't-slot'}>
          <Select options={screwLens} />
        </Form.Item>
      </Form>
    </div>
  );
};

export default Controller;
