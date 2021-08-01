/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import SegmentedControl from './SegmentedControl';

describe('test SegmentedControl', () => {
  test('enabled', () => {
    const onChanged = jest.fn();
    const wrapper = shallow(<SegmentedControl
      isDisabled={false}
      selectedIndexes={[0]}
      onChanged={onChanged}
      segments={[
        {
          imgSrc: 'img/right-panel/icon-nodetype-0.svg',
          title: 'tCorner',
          value: 0,
        },
        {
          imgSrc: 'img/right-panel/icon-nodetype-1.svg',
          title: 'tSmooth',
          value: 1,
        },
        {
          imgSrc: 'img/right-panel/icon-nodetype-2.svg',
          title: 'tSymmetry',
          value: 2,
        },
      ]}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div[title="tSmooth"]').simulate('click');
    expect(onChanged).toHaveBeenCalledTimes(1);
    expect(onChanged).toHaveBeenNthCalledWith(1, 1);
  });

  test('disabled', () => {
    const onChanged = jest.fn();
    const wrapper = shallow(<SegmentedControl
      isDisabled
      selectedIndexes={[0]}
      onChanged={onChanged}
      segments={[
        {
          imgSrc: 'img/right-panel/icon-nodetype-0.svg',
          title: 'tCorner',
          value: 0,
        },
        {
          imgSrc: 'img/right-panel/icon-nodetype-1.svg',
          title: 'tSmooth',
          value: 1,
        },
        {
          imgSrc: 'img/right-panel/icon-nodetype-2.svg',
          title: 'tSymmetry',
          value: 2,
        },
      ]}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div[title="tSmooth"]').simulate('click');
    expect(onChanged).not.toHaveBeenCalled();
  });

  test('click on selected index', () => {
    const onChanged = jest.fn();
    const wrapper = shallow(<SegmentedControl
      isDisabled={false}
      selectedIndexes={[0]}
      onChanged={onChanged}
      segments={[
        {
          imgSrc: 'img/right-panel/icon-nodetype-0.svg',
          title: 'tCorner',
          value: 0,
        },
        {
          imgSrc: 'img/right-panel/icon-nodetype-1.svg',
          title: 'tSmooth',
          value: 1,
        },
        {
          imgSrc: 'img/right-panel/icon-nodetype-2.svg',
          title: 'tSymmetry',
          value: 2,
        },
      ]}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div[title="tCorner"]').simulate('click');
    expect(onChanged).not.toHaveBeenCalled();
  });

  test('multiple selected indexes', () => {
    const onChanged = jest.fn();
    const wrapper = shallow(<SegmentedControl
      isDisabled={false}
      selectedIndexes={[0, 1, 2]}
      onChanged={onChanged}
      segments={[
        {
          imgSrc: 'img/right-panel/icon-nodetype-0.svg',
          title: 'tCorner',
          value: 0,
        },
        {
          imgSrc: 'img/right-panel/icon-nodetype-1.svg',
          title: 'tSmooth',
          value: 1,
        },
        {
          imgSrc: 'img/right-panel/icon-nodetype-2.svg',
          title: 'tSymmetry',
          value: 2,
        },
      ]}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
