import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import RectOptions from './RectOptions';

jest.mock('app/views/beambox/Right-Panels/Options-Blocks/InFillBlock', () => () => <div>DummyInFillBlock</div>);

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      right_panel: {
        object_panel: {
          option_panel: {
            rounded_corner: 'Rounded corner',
          },
        },
      },
    },
  },
}));

const get = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => get(...args),
}));

const changeSelectedAttribute = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) => {
    callback({
      Canvas: {
        changeSelectedAttribute: (...args) => changeSelectedAttribute(...args),
      },
    });
  },
}));

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('unit is inches', () => {
    get.mockReturnValue('inches');
    const updateDimensionValues = jest.fn();
    const { container } = render(
      <RectOptions
        elem={document.getElementById('flux')}
        rx={0}
        updateDimensionValues={updateDimensionValues}
      />
    );

    expect(container).toMatchSnapshot();
    fireEvent.change(container.querySelector('input'), { target: { value: 1 } });
    fireEvent.blur(container.querySelector('input'));

    expect(changeSelectedAttribute).toHaveBeenCalledTimes(1);
    expect(changeSelectedAttribute).toHaveBeenNthCalledWith(1, 'rx', 254, [document.getElementById('flux')]);
    expect(updateDimensionValues).toHaveBeenCalledTimes(1);
    expect(updateDimensionValues).toHaveBeenNthCalledWith(1, { rx: 254 });
  });

  test('unit is not inches', () => {
    get.mockReturnValue(null);

    const { container } = render(
      <RectOptions
        elem={document.getElementById('flux')}
        rx={10}
        updateDimensionValues={jest.fn()}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
