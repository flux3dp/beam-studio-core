import classNames from 'classnames';
import JsBarcode, { type Options } from 'jsbarcode';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import S from './Barcode.module.scss';

export type Renderer = 'canvas' | 'image' | 'svg';

export type Format =
  | 'CODE39'
  | 'CODE128'
  | 'CODE128A'
  | 'CODE128B'
  | 'CODE128C'
  | 'EAN13'
  | 'EAN8'
  | 'EAN5'
  | 'EAN2'
  | 'UPC'
  | 'UPCE'
  | 'ITF14'
  | 'ITF'
  | 'MSI'
  | 'MSI10'
  | 'MSI11'
  | 'MSI1010'
  | 'MSI1110'
  | 'pharmacode'
  | 'codabar'
  | 'GenericBarcode';

export const formats: Format[] = [
  'CODE39',
  'CODE128',
  'CODE128A',
  'CODE128B',
  'CODE128C',
  'EAN13',
  'EAN8',
  'EAN5',
  'EAN2',
  'UPC',
  'UPCE',
  'ITF14',
  'ITF',
  'MSI',
  'MSI10',
  'MSI11',
  'MSI1010',
  'MSI1110',
  'pharmacode',
  'codabar',
  'GenericBarcode',
];

export const defaultOptions: Options = {
  format: 'CODE128',
  width: 2,
  height: 100,
  displayValue: true,
  fontOptions: '',
  font: 'Noto Sans',
  textAlign: 'center',
  textPosition: 'bottom',
  textMargin: 2,
  fontSize: 20,
  background: '#ffffff',
  lineColor: '#000000',
  margin: 10,
  ean128: false,
};

export interface BarcodeProps {
  renderer?: Renderer;
  value: string;
  options?: Options;
  style?: React.CSSProperties;
  className?: string;
}

export function Barcode({
  style,
  className,
  value,
  options = defaultOptions,
  renderer = 'svg',
}: Readonly<BarcodeProps>): React.JSX.Element {
  const containerRef = useRef(null);
  const [error, setError] = useState<string | null>(null);

  const renderBarcode = useCallback(() => {
    if (containerRef.current) {
      try {
        JsBarcode(containerRef.current, value, options);
        setError(null);
      } catch {
        setError('The value is invalid for the selected format.');
      }
    }
  }, [value, options]);

  useEffect(() => {
    renderBarcode();
  }, [renderBarcode]);

  const contentClasses = classNames(className, S[error ? 'hidden' : 'visible']);
  const errorClasses = classNames(className, S[error ? 'visible' : 'hidden'], S['error-span']);

  const renderBarcodeElement = () => {
    switch (renderer) {
      case 'canvas':
        return <canvas id="barcode" ref={containerRef} style={style} className={contentClasses} />;
      case 'image':
        return (
          <img
            id="barcode"
            ref={containerRef}
            alt="barcode"
            style={style}
            className={contentClasses}
          />
        );
      case 'svg':
      default:
        return (
          <svg
            id="barcode"
            ref={containerRef}
            className={classNames(contentClasses, S['barcode-svg'])}
          />
        );
    }
  };

  return (
    <div id="barcode-container" className={S.container} style={style}>
      {renderBarcodeElement()}
      <span className={errorClasses}>{error}</span>
    </div>
  );
}
