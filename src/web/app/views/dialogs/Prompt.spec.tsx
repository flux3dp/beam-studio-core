import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Prompt from './Prompt';

jest.mock('helpers/i18n', () => ({
  lang: {
    alert: {
      ok2: 'OK',
      cancel: 'Cancel',
    },
  },
}));

const onYes = jest.fn();
const onCancel = jest.fn();
const onClose = jest.fn();

describe('test Prompt', () => {
  test('should render correctly', () => {
    const { baseElement, getByText } = render(
      <Prompt
        caption="New Preset Name"
        defaultValue=""
        onYes={onYes}
        onCancel={onCancel}
        onClose={onClose}
      />
    );
    expect(baseElement).toMatchSnapshot();

    expect(onYes).not.toBeCalled();
    expect(onClose).not.toBeCalled();
    baseElement.querySelector('input').value = 'value';
    fireEvent.click(getByText('OK'));
    expect(onYes).toBeCalledTimes(1);
    expect(onYes).toHaveBeenLastCalledWith('value');
    expect(onClose).toBeCalledTimes(1);

    expect(onCancel).not.toBeCalled();
    fireEvent.click(getByText('Cancel'));
    expect(onCancel).toBeCalledTimes(1);
    expect(onClose).toBeCalledTimes(2);
  });
});
