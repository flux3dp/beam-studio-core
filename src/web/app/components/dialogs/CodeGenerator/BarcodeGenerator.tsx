/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useState } from 'react';
import {
  Button,
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
import useI18n from 'helpers/useI18n';
import Select from 'app/widgets/AntdSelect';
import fontHelper from 'helpers/fonts/fontHelper';
import FluxIcons from 'app/icons/flux/FluxIcons';
import { Barcode, defaultOptions, formats } from './Barcode';
import styles from './BarcodeGenerator.module.scss';

interface Props {
  isInvert: boolean;
  setIsInvert: (isInvert: boolean) => void;
  text: string;
  setText: (text: string) => void;
}

const fontFamilies = fontFuncs.requestAvailableFontFamilies();
// copied from src/web/app/views/beambox/Right-Panels/Options-Blocks/TextOptions.tsx
const renderOption = (option) => {
  const src = fontHelper.getWebFontPreviewUrl(option.value);
  if (src) {
    return (
      <div className={styles['family-option']}>
        <div className={styles['img-container']}>
          <img src={src} alt={option.label} draggable="false" />
        </div>
        {src.includes('monotype') && <FluxIcons.FluxPlus />}
      </div>
    );
  }
  return <div style={{ fontFamily: `'${option.value}'`, maxHeight: 24 }}>{option.label}</div>;
};
// end of copied code

export default function BarcodeGenerator({
  isInvert,
  setIsInvert,
  text,
  setText,
}: Props): JSX.Element {
  const { barcode_generator: t } = useI18n();
  const [options, setOptions] = useState(defaultOptions);
  const [validFontStyles, setValidFontStyles] = useState([]);
  const formatOptions = formats.map((value) => ({ label: value, value }));
  const fontOptions = fontFamilies.map((family: string) => {
    const fontName = fontFuncs.fontNameMap.get(family);
    const label = renderOption({
      value: family,
      label: typeof fontName === 'string' ? fontName : family,
    });

    return { value: family, label };
  });

  useEffect(() => {
    const fontStyles = fontFuncs
      .requestFontsOfTheFontFamily(options.font)
      .map(({ style }) => style);

    setValidFontStyles(fontStyles);
  }, [options.font]);

  return (
    <>
      <Barcode
        style={{ marginBottom: 20, borderRadius: 10, border: '1px solid #d9d9d9' }}
        value={text}
        options={options}
        renderer="svg"
      />
      <ConfigProvider theme={{ components: { Form: { itemMarginBottom: 12 } } }}>
        <Form>
          <Space.Compact style={{ width: '100%', marginBottom: 20 }}>
            <Input
              value={text}
              onKeyDown={(e) => e.stopPropagation()}
              onChange={(e) => setText(e.target.value)}
            />
            <ConfigProvider theme={{ token: { colorBgContainer: '#FAFAFA' } }}>
              <Select
                value={[options.format]}
                options={formatOptions}
                allowClear={false}
                onKeyDown={(e) => e.stopPropagation()}
                onChange={(format) => setOptions({ ...options, format })}
                showSearch
              />
            </ConfigProvider>
          </Space.Compact>

          <Flex justify="center" gap={32}>
            <Flex vertical>
              <Form.Item label={t.bar_width} className={styles['flex-child']}>
                <InputNumber
                  style={{ width: '100%' }}
                  max={4}
                  min={1}
                  value={options.width}
                  onKeyDown={(e) => e.stopPropagation()}
                  onChange={(width) => setOptions({ ...options, width })}
                />
              </Form.Item>
              <Form.Item label={t.bar_height} className={styles['flex-child']}>
                <InputNumber
                  style={{ width: '100%' }}
                  max={300}
                  min={1}
                  value={options.height}
                  onKeyDown={(e) => e.stopPropagation()}
                  onChange={(height) => setOptions({ ...options, height })}
                />
              </Form.Item>
              <Form.Item label={t.text_margin} className={styles['flex-child']}>
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
                  {t.hide_text}
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
                  {t.invert_color}
                </Checkbox>
              </Form.Item> */}
            </Flex>

            <Flex vertical>
              <Form.Item label={t.font} className={styles['flex-child']}>
                <Select
                  value={[options.font]}
                  options={fontOptions}
                  allowClear={false}
                  showSearch
                  filterOption={(input: string, option?: { label: JSX.Element; value: string }) => {
                    if (option?.value) {
                      const searchKey = input.toLowerCase();

                      if (option.value.toLowerCase().includes(searchKey)) {
                        return true;
                      }

                      const fontName = fontFuncs.fontNameMap.get(option.value) || '';

                      if (fontName.toLowerCase().includes(searchKey)) {
                        return true;
                      }
                    }

                    return false;
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  onChange={(font) => setOptions({ ...options, font, fontOptions: '' })}
                />
              </Form.Item>
              <Form.Item label={t.font_size} className={styles['flex-child']}>
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={100}
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
                            ? `${fontOptions} bold`
                            : fontOptions.replace('bold', '').trim(),
                        });
                      }}
                      disabled={!validFontStyles.some((style) => /bold/i.test(style))}
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
                      disabled={!validFontStyles.some((style) => /italic/i.test(style))}
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
