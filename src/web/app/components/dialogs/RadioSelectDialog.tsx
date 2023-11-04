import React, { useState } from 'react';
import { Modal, Radio, Space } from 'antd';

import useI18n from 'helpers/useI18n';

interface Props<T = string> {
  title: string;
  options: { label: string; value: T }[];
  defaultValue: T;
  onOk: (val: T) => void;
  onCancel: () => void;
}

function RadioSelectDialog<T = string>({
  title,
  options,
  defaultValue,
  onOk,
  onCancel,
}: Props<T>): JSX.Element {
  const [value, setValue] = useState(defaultValue);
  const handleOk = () => onOk(value);

  return (
    <Modal title={title} open centered maskClosable={false} onOk={handleOk} onCancel={onCancel}>
      <Radio.Group onChange={(e) => setValue(e.target.value)} value={value}>
        <Space direction="vertical">
          {options.map((option) => (
            <Radio key={option.label} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    </Modal>
  );
}

export default RadioSelectDialog;
