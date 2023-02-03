import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import ColorPickerPanel from './ColorPickerPanel';

const create = jest.fn();
jest.mock('@simonwep/pickr', () => ({
  create: (...args) => create(...args),
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      photo_edit_panel: {
        cancel: 'Cancel',
        okay: 'Okay',
      },
    },
  },
}));

test('should render correctly', () => {
  create.mockReturnValue({
    getColor: () => ({
      toHEXA: () => ({
        toString: () => '#FFFFFF',
      }),
    }),
  });

  const onNewColor = jest.fn();
  const onClose = jest.fn();

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
    theme: 'monolith',
    inline: true,
    default: '#000000',
    swatches: [],
    components: {
      preview: true,
      opacity: false,
      hue: true,
      interaction: {
        input: false,
        cancel: false,
        save: false,
      },
    },
  });

  fireEvent.click(getByText('Okay'));
  expect(onNewColor).toHaveBeenCalledTimes(1);
  expect(onNewColor).toHaveBeenNthCalledWith(1, '#FFFFFF');
  expect(onClose).toHaveBeenCalledTimes(1);

  fireEvent.click(getByText('Cancel'));
  expect(onClose).toHaveBeenCalledTimes(2);

  fireEvent.click(container.querySelector('div.modal-background'));
  expect(onClose).toHaveBeenCalledTimes(3);
});
