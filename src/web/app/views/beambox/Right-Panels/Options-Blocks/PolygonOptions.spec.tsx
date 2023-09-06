import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import { ObjectPanelContextProvider } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';

import PolygonOptions from './PolygonOptions';

jest.mock('app/views/beambox/Right-Panels/Options-Blocks/InFillBlock', () => () => <div>DummyInFillBlock</div>);

const useIsMobile = jest.fn();
jest.mock('helpers/system-helper', () => ({
  useIsMobile: () => useIsMobile(),
}));

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

window.polygonAddSides = jest.fn(() => {
  const sides = +document.getElementById('flux').getAttribute('sides');
  document.getElementById('flux').setAttribute('sides', (sides + 1).toString());
});
window.polygonDecreaseSides = jest.fn(() => {
  const sides = +document.getElementById('flux').getAttribute('sides');
  document.getElementById('flux').setAttribute('sides', Math.max((sides - 1),3).toString());
});

describe('test PolygonOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render correctly', () => {
    const { container, rerender } = render(
      <PolygonOptions
        elem={document.getElementById('flux')}
        polygonSides={0}
      />
    );
    expect(container).toMatchSnapshot();

    const elem = document.createElement('polygon');
    elem.setAttribute('id', 'flux');
    elem.setAttribute('sides', '5');
    document.body.appendChild(elem);
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

    jest.clearAllMocks();

    fireEvent.change(input, { target: { value: 5 } });
    fireEvent.blur(input);
    expect(container).toMatchSnapshot();
    expect(window.polygonAddSides).not.toHaveBeenCalled();
    expect(window.polygonDecreaseSides).toHaveBeenCalledTimes(3);

    jest.clearAllMocks();

    fireEvent.change(input, { target: { value: 5 } });
    fireEvent.blur(input);
    expect(window.polygonAddSides).not.toHaveBeenCalled();
    expect(window.polygonDecreaseSides).not.toHaveBeenCalled();
  });

  test('should render correctly in mobile', async() => {
    useIsMobile.mockReturnValue(true)
    const { baseElement, container, getByText, rerender } = render(
      <PolygonOptions
        elem={document.getElementById('flux')}
        polygonSides={0}
      />
    );
    expect(container).toMatchSnapshot();

    const elem = document.createElement('polygon');
    elem.setAttribute('id', 'flux');
    elem.setAttribute('sides', '5');
    document.body.appendChild(elem);
    rerender(
      <ObjectPanelContextProvider>
        <PolygonOptions
          elem={document.getElementById('flux')}
          polygonSides={5}
        />
      </ObjectPanelContextProvider>
    );
    expect(container).toMatchSnapshot();

    const objectPanelItem = baseElement.querySelector('div.object-panel-item');
    const displayBtn = baseElement.querySelector('button.number-item');
    expect(displayBtn).toHaveTextContent('5');
    expect(objectPanelItem).not.toHaveClass('active');
    fireEvent.click(objectPanelItem);
    await waitFor(() => expect(baseElement.querySelector('.adm-mask')).toBeVisible());
    expect(objectPanelItem).toHaveClass('active');
    expect(getByText('.').parentElement).toHaveClass('adm-button-disabled');
    expect(window.polygonAddSides).not.toHaveBeenCalled();
    expect(window.polygonDecreaseSides).not.toHaveBeenCalled();

    fireEvent.click(baseElement.querySelectorAll('.input-keys button')[11]);
    expect(window.polygonAddSides).not.toHaveBeenCalled();
    expect(window.polygonDecreaseSides).toHaveBeenCalledTimes(5);
    expect(expect(displayBtn).toHaveTextContent('3'));
  });
})
