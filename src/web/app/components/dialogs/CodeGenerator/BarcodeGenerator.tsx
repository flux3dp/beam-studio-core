/* eslint-disable @typescript-eslint/no-shadow */
import React, { useState } from 'react';
import {
  Button,
  Cascader,
  CascaderProps,
  Checkbox,
  ConfigProvider,
  Flex,
  Form,
  Input,
  InputNumber,
  Radio,
  Space,
} from 'antd';

import fontFuncs from 'app/actions/beambox/font-funcs';
import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  ItalicOutlined,
} from '@ant-design/icons';
import { Barcode, defaultOptions, formats } from './Barcode';
import styles from './BarcodeGenerator.module.scss';

type DefaultOptionType = CascaderProps['options'][number];

interface Props {
  isInvert: boolean;
  setIsInvert: (isInvert: boolean) => void;
}

const fontFamilies = fontFuncs.requestAvailableFontFamilies(true);

export default function BarcodeGenerator({ isInvert, setIsInvert }: Props): JSX.Element {
  const [value, setValue] = useState('1234');
  const [options, setOptions] = useState(defaultOptions);
  const formatOptions = formats.map((format) => ({ label: format, value: format }));
  const fontOptions = fontFamilies.map((family: string) => {
    const fontName = fontFuncs.fontNameMap.get(family);
    const label = typeof fontName === 'string' ? fontName : family;

    return {
      value: family,
      label,
    };
  });

  const filter = (inputValue: string, path: Array<DefaultOptionType>) =>
    path.some(
      ({ label }) => (label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    );

  return (
    <>
      <Barcode
        style={{ marginBottom: 20, borderRadius: 10, border: '1px solid #d9d9d9' }}
        value={value}
        options={options}
        renderer="svg"
      />
      <ConfigProvider theme={{ components: { Form: { itemMarginBottom: 12 } } }}>
        <Form>
          <Space.Compact style={{ width: '100%', marginBottom: 20 }}>
            <Input
              value={value}
              onKeyDown={(e) => e.stopPropagation()}
              onChange={(e) => setValue(e.target.value)}
            />
            <ConfigProvider theme={{ token: { colorBgContainer: '#FAFAFA' } }}>
              <Cascader
                value={[options.format]}
                options={formatOptions}
                allowClear={false}
                showSearch={{ filter }}
                onKeyDown={(e) => e.stopPropagation()}
                onChange={(format) => setOptions({ ...options, format })}
              />
            </ConfigProvider>
          </Space.Compact>

          <Flex justify="center" gap={32}>
            <Flex vertical>
              <Form.Item label="Bar Width" className={styles['flex-child']}>
                <InputNumber
                  style={{ width: '100%' }}
                  max={4}
                  min={1}
                  value={options.width}
                  onKeyDown={(e) => e.stopPropagation()}
                  onChange={(width) => setOptions({ ...options, width })}
                />
              </Form.Item>
              <Form.Item label="Bar Height" className={styles['flex-child']}>
                <InputNumber
                  style={{ width: '100%' }}
                  max={300}
                  min={1}
                  value={options.height}
                  onKeyDown={(e) => e.stopPropagation()}
                  onChange={(height) => setOptions({ ...options, height })}
                />
              </Form.Item>
              <Form.Item label="Text Margin" className={styles['flex-child']}>
                <InputNumber
                  style={{ width: '100%' }}
                  max={100}
                  value={options.textMargin}
                  onKeyDown={(e) => e.stopPropagation()}
                  onChange={(textMargin) => setOptions({ ...options, textMargin })}
                />
              </Form.Item>

              <Form.Item className={styles['flex-child']}>
                <Checkbox
                  onChange={(e) => setOptions({ ...options, displayValue: !e.target.checked })}
                >
                  Hide Text
                </Checkbox>
              </Form.Item>
              {/* <Form.Item className={styles['flex-child']}>
                <Checkbox
                  checked={isInvert}
                  onChange={() => {
                    const [black, white] = ['#000000', '#ffffff'];

                    setIsInvert(!isInvert);
                    setOptions({
                      ...options,
                      background: !isInvert ? black : white,
                      lineColor: !isInvert ? white : black,
                    });
                  }}
                >
                  Invert Color
                </Checkbox>
              </Form.Item> */}
            </Flex>

            <Flex vertical>
              <Form.Item label="Font" className={styles['flex-child']}>
                <Cascader
                  value={[options.font]}
                  options={fontOptions}
                  allowClear={false}
                  showSearch={{ filter }}
                  onKeyDown={(e) => e.stopPropagation()}
                  onChange={(font) => setOptions({ ...options, font })}
                />
              </Form.Item>
              <Form.Item label="Font Size" className={styles['flex-child']}>
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  value={options.fontSize}
                  onKeyDown={(e) => e.stopPropagation()}
                  onChange={(fontSize) => setOptions({ ...options, fontSize })}
                />
              </Form.Item>

              <Flex justify="space-between">
                <Form.Item>
                  <Radio.Group
                    optionType="button"
                    value={options.textAlign}
                    options={[
                      { label: <AlignLeftOutlined />, value: 'left' },
                      { label: <AlignCenterOutlined />, value: 'center' },
                      { label: <AlignRightOutlined />, value: 'right' },
                    ]}
                    onChange={(e) => setOptions({ ...options, textAlign: e.target.value })}
                  />
                </Form.Item>

                <Flex gap={4}>
                  <Form.Item>
                    <Button
                      defaultChecked={options.fontOptions.includes('bold')}
                      className={
                        options.fontOptions.includes('bold') ? styles['check-text-option'] : ''
                      }
                      icon={<BoldOutlined />}
                      onClick={() => {
                        const { fontOptions } = options;

                        setOptions({
                          ...options,
                          fontOptions: !options.fontOptions.includes('bold')
                            ? `bold ${fontOptions}`
                            : fontOptions.replace('bold', '').trim(),
                        });
                      }}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      defaultChecked={options.fontOptions.includes('italic')}
                      className={
                        options.fontOptions.includes('italic') ? styles['check-text-option'] : ''
                      }
                      icon={<ItalicOutlined />}
                      onClick={() => {
                        const { fontOptions } = options;

                        setOptions({
                          ...options,
                          fontOptions: !options.fontOptions.includes('italic')
                            ? `${fontOptions} italic`
                            : fontOptions.replace('italic', '').trim(),
                        });
                      }}
                    />
                  </Form.Item>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Form>
      </ConfigProvider>
    </>
  );
}
