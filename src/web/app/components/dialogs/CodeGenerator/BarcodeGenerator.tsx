import React, { useMemo, useState } from 'react';
import {
  Cascader,
  Checkbox,
  ColorPicker,
  Form,
  Input,
  Modal,
  QRCode,
  QRCodeProps,
  Radio,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import JsBarcode from 'jsbarcode';

import ISVGCanvas from 'interfaces/ISVGCanvas';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import importSvgString from 'app/svgedit/operations/import/importSvgString';
import browser from 'implementations/browser';
import useI18n from 'helpers/useI18n';

import { Barcode, defaultOptions, formats } from './Barcode';

interface Props {
  onClose?: () => void;
}

let svgCanvas: ISVGCanvas;

getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

export default function BarcodeGenerator({ onClose }: Props): JSX.Element {
  const [value, setValue] = React.useState('1234');
  const [options, setOptions] = React.useState(defaultOptions);
  const formatOptions = formats.map((format) => ({ label: format, value: format }));

  return (
    <>
      <Barcode value={value} options={options} renderer="svg" />
      <Form>
        <Form.Item label="Value">
          <Input
            value={value}
            onKeyDown={(e) => e.stopPropagation()}
            onChange={(e) => setValue(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Format">
          <Cascader
            value={[options.format]}
            options={formatOptions}
            onChange={(format) => setOptions({ ...options, format })}
          />
        </Form.Item>
        <Form.Item label="Width">
          <Input
            value={options.width}
            onKeyDown={(e) => e.stopPropagation()}
            onChange={(e) => setOptions({ ...options, width: Math.min(4, Number(e.target.value)) })}
          />
        </Form.Item>
        <Form.Item label="Height">
          <Input
            value={options.height}
            onKeyDown={(e) => e.stopPropagation()}
            onChange={(e) =>
              setOptions({ ...options, height: Math.min(150, Number(e.target.value)) })
            }
          />
        </Form.Item>
        {/* <Form.Item label="Margin">
          <Input
            value={options.margin}
            onKeyDown={(e) => e.stopPropagation()}
            onChange={(e) => setOptions({ ...options, margin: Number(e.target.value) })}
          />
        </Form.Item> */}
        <Form.Item label="Background">
          <ColorPicker
            value={options.background}
            onChange={(color) => setOptions({ ...options, background: color.toHexString() })}
          />
        </Form.Item>
        <Form.Item label="Line Color">
          <ColorPicker
            value={options.lineColor}
            onChange={(color) => setOptions({ ...options, lineColor: color.toHexString() })}
          />
        </Form.Item>
        <Form.Item label="Show Text">
          <Radio.Group
            value={options.displayValue}
            optionType="button"
            buttonStyle="solid"
            options={[
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ]}
            onChange={(e) => setOptions({ ...options, displayValue: e.target.value })}
          />
        </Form.Item>
      </Form>
    </>
  );
}
