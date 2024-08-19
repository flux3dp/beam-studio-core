import React from 'react'

const mockComponent = ({
  id,
  disabled,
  className,
  value,
  max,
  min,
  addonAfter,
  isInch,
  precision,
  underline,
  unit,
  fireOnChange,
  onBlur,
  onChange,
}: {
  id: string;
  disabled?: boolean;
  className?: string;
  value?: number;
  max?: number;
  min?: number;
  addonAfter?: string;
  isInch?: boolean;
  precision?: number;
  underline?: boolean;
  unit?: string;
  fireOnChange?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (value: number) => void;
}): JSX.Element =>
  (
    <div className={className}>
      UnitInput: {id}
      {addonAfter && <p>addonAfter: {addonAfter}</p>}
      {isInch && <p>isInch</p>}
      {precision && <p>precision: {precision}</p>}
      {underline && <p>underline</p>}
      {unit && <p>unit: {unit}</p>}
      {fireOnChange && <p>fireOnChange</p>}
      <input
        id={id}
        disabled={disabled}
        max={max}
        min={min}
        value={value}
        onBlur={onBlur}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )

export default mockComponent;
