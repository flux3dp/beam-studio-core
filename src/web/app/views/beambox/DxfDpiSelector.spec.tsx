/* eslint-disable import/first */
import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import DxfDpiSelector from './DxfDpiSelector';

jest.mock('helpers/i18n', () => ({
  lang: {
    alert: {
      cancel: 'Cancel',
      ok: 'OK',
    },
    message: {
      please_enter_dpi: 'Please enter the Unit of your file',
    },
  },
}));

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('submit through input', () => {
    document.body.innerHTML = `
      <input id="dpi-input" value="25.4" >
    `;
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    const { container } = render(
      <DxfDpiSelector defaultDpiValue={100} onSubmit={onSubmit} onCancel={onCancel} />
    );
    expect(container).toMatchSnapshot();

    const input = container.querySelector('input#dpi-input');
    fireEvent.keyDown(input, {
      keyCode: 14,
    });
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.keyDown(input, {
      keyCode: 13,
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenNthCalledWith(1, 25.4);

    fireEvent.click(input);
    expect($('#dpi-input').val()).toBe('');
  });

  test('submit through buttons', () => {
    document.body.innerHTML = `
    <select id="dpi-input">
      <option>1</option>
      <option>2.54</option>
      <option selected="selected">25.4</option>
      <option>72</option>
      <option>96</option>
    </select>
  `;
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    const { container } = render(
      <DxfDpiSelector defaultDpiValue={100} onSubmit={onSubmit} onCancel={onCancel} />
    );

    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[1]);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenNthCalledWith(1, 25.4);

    fireEvent.click(buttons[0]);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
