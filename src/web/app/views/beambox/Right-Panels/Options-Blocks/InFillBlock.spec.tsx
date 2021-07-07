/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

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

const getSVGAsync = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync,
}));

const isElemFillable = jest.fn();
const calcElemFilledInfo = jest.fn();
const setElemsUnfill = jest.fn();
const setElemsFill = jest.fn();
getSVGAsync.mockImplementation((callback) => {
  callback({
    Canvas: {
      isElemFillable,
      calcElemFilledInfo,
      setElemsUnfill,
      setElemsFill,
    },
  });
});

import InFillBlock from './InFillBlock';

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
    const wrapper = shallow(
      <InFillBlock
        elem={document.getElementById('flux')}
      />,
    );

    expect(toJson(wrapper)).toMatchSnapshot();
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
    const wrapper = shallow(
      <InFillBlock
        elem={document.getElementById('flux')}
      />,
    );

    expect(toJson(wrapper)).toMatchSnapshot();

    const setState = jest.spyOn(wrapper.instance(), 'setState');
    wrapper.find('div.onoffswitch').simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(setElemsUnfill).not.toHaveBeenCalled();
    expect(setElemsFill).toHaveBeenCalledTimes(1);
    expect(setElemsFill).toHaveBeenNthCalledWith(1, [document.getElementById('flux')]);
    expect(setState).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenNthCalledWith(1, {
      isAnyFilled: true,
      isAllFilled: true,
    });

    wrapper.find('div.onoffswitch').simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(setElemsUnfill).toHaveBeenCalledTimes(1);
    expect(setElemsUnfill).toHaveBeenNthCalledWith(1, [document.getElementById('flux')]);
    expect(setElemsFill).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledTimes(2);
    expect(setState).toHaveBeenNthCalledWith(2, {
      isAnyFilled: false,
      isAllFilled: false,
    });
  });
});
