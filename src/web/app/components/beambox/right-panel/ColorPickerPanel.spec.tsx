import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';

import ColorPickerPanel from './ColorPickerPanel';

const create = jest.fn();
jest.mock('@simonwep/pickr', () => ({
  create: (...args) => create(...args),
}));

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    photo_edit_panel: {
      okay: 'okay',
      cancel: 'cancel',
    },
  },
}));

const mockOn = jest.fn();
const onNewColor = jest.fn();
const onClose = jest.fn();

describe('test ColorPickerPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const mockColor = {
      toHEXA: () => ({
        toString: () => '#FFFFFF',
      }),
    };
    create.mockReturnValue({
      on: mockOn,
    });
    const { container, getByText } = render(
      <ColorPickerPanel
        originalColor="#000000"
        top={100}
        left={300}
        onNewColor={onNewColor}
        onClose={onClose}
      />
    );
    expect(container).toMatchSnapshot();
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenNthCalledWith(1, {
      el: '.pickr',
      appClass: 'app',
      theme: 'monolith',
      inline: true,
      default: '#000000',
      swatches: [],
      components: {
        preview: false,
        opacity: false,
        hue: true,
        interaction: {
          input: false,
          cancel: false,
          save: false,
        },
      },
    });

    expect(mockOn).toHaveBeenCalledTimes(1);
    act(() => {
      mockOn.mock.calls[0][1](mockColor);
    });
    fireEvent.click(getByText('okay'));
    expect(onNewColor).toHaveBeenCalledTimes(1);
    expect(onNewColor).toHaveBeenNthCalledWith(1, '#FFFFFF');
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(getByText('cancel'));
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.click(container.querySelector('div.background'));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  test('when is printing', () => {
    const { container, getByText } = render(
      <ColorPickerPanel
        originalColor="#000000"
        top={100}
        left={300}
        onNewColor={onNewColor}
        onClose={onClose}
        isPrinting
      />
    );
    expect(container).toMatchSnapshot();
    fireEvent.click(container.querySelectorAll('div.block')[0]);
    fireEvent.click(getByText('okay'));
    expect(onNewColor).toHaveBeenCalledTimes(1);
    expect(onNewColor).toHaveBeenNthCalledWith(1, '#9FE3FF');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('when allow none', () => {
    const { container, getByText } = render(
      <ColorPickerPanel
        originalColor="#000000"
        top={100}
        left={300}
        onNewColor={onNewColor}
        onClose={onClose}
        allowNone
      />
    );
    expect(container).toMatchSnapshot();
    fireEvent.click(container.querySelectorAll('div.block.none')[0]);
    fireEvent.click(getByText('okay'));
    expect(onNewColor).toHaveBeenCalledTimes(1);
    expect(onNewColor).toHaveBeenNthCalledWith(1, 'none');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
