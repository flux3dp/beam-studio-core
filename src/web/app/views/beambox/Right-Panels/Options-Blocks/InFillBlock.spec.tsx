import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import InFillBlock from './InFillBlock';

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      right_panel: {
        object_panel: {
          option_panel: {
            fill: 'Infill',
          },
        },
      },
    },
  },
}));

const isElemFillable = jest.fn();
const calcElemFilledInfo = jest.fn();
const setElemsUnfill = jest.fn();
const setElemsFill = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) => {
    callback({
      Canvas: {
        isElemFillable: (...args) => isElemFillable(...args),
        calcElemFilledInfo: (...args) => calcElemFilledInfo(...args),
        setElemsUnfill: (...args) => setElemsUnfill(...args),
        setElemsFill: (...args) => setElemsFill(...args),
      },
    });
  },
}));

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('is not fillable', () => {
    isElemFillable.mockReturnValue(false);
    calcElemFilledInfo.mockReturnValue({
      isAnyFilled: true,
      isAllFilled: false,
    });
    document.body.innerHTML = '<div id="flux" />';
    const { container } = render(
      <InFillBlock
        elem={document.getElementById('flux')}
      />,
    );

    expect(container).toMatchSnapshot();
    expect(isElemFillable).toHaveBeenCalledTimes(1);
    expect(isElemFillable).toHaveBeenNthCalledWith(1, document.getElementById('flux'));
    expect(calcElemFilledInfo).toHaveBeenCalledTimes(1);
    expect(calcElemFilledInfo).toHaveBeenNthCalledWith(1, document.getElementById('flux'));
  });

  test('is fillable', () => {
    isElemFillable.mockReturnValue(true);
    calcElemFilledInfo.mockReturnValue({
      isAnyFilled: false,
      isAllFilled: false,
    });
    document.body.innerHTML = '<div id="flux" />';
    const { container } = render(
      <InFillBlock
        elem={document.getElementById('flux')}
      />,
    );

    expect(container).toMatchSnapshot();

    const switchBtn = container.querySelector('div.onoffswitch');
    fireEvent.click(switchBtn);
    expect(container).toMatchSnapshot();
    expect(setElemsUnfill).not.toHaveBeenCalled();
    expect(setElemsFill).toHaveBeenCalledTimes(1);
    expect(setElemsFill).toHaveBeenNthCalledWith(1, [document.getElementById('flux')]);

    fireEvent.click(switchBtn);
    expect(container).toMatchSnapshot();
    expect(setElemsUnfill).toHaveBeenCalledTimes(1);
    expect(setElemsUnfill).toHaveBeenNthCalledWith(1, [document.getElementById('flux')]);
    expect(setElemsFill).toHaveBeenCalledTimes(1);
  });
});
