import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import PolygonOptions from './PolygonOptions';

jest.mock('app/views/beambox/Right-Panels/Options-Blocks/InFillBlock', () => () => <div>DummyInFillBlock</div>);

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      right_panel: {
        object_panel: {
          option_panel: {
            sides: 'Sides',
          },
        },
      },
    },
  },
}));

window.polygonAddSides = jest.fn();
window.polygonDecreaseSides = jest.fn();

test('should render correctly', () => {
  const { container, rerender } = render(
    <PolygonOptions
      elem={document.getElementById('flux')}
      polygonSides={0}
    />
  );
  expect(container).toMatchSnapshot();

  rerender(
    <PolygonOptions
      elem={document.getElementById('flux')}
      polygonSides={5}
    />
  );

  expect(container).toMatchSnapshot();

  const input = container.querySelector('input');
  fireEvent.change(input, { target: { value: 8 } });
  fireEvent.blur(input);

  expect(container).toMatchSnapshot();
  expect(window.polygonAddSides).toHaveBeenCalledTimes(3);
  expect(window.polygonDecreaseSides).not.toHaveBeenCalled();

  jest.resetAllMocks();

  fireEvent.change(input, { target: { value: 5 } });
  fireEvent.blur(input);
  expect(container).toMatchSnapshot();
  expect(window.polygonAddSides).not.toHaveBeenCalled();
  expect(window.polygonDecreaseSides).toHaveBeenCalledTimes(3);

  jest.resetAllMocks();

  fireEvent.change(input, { target: { value: 5 } });
  fireEvent.blur(input);
  expect(window.polygonAddSides).not.toHaveBeenCalled();
  expect(window.polygonDecreaseSides).not.toHaveBeenCalled();
});
