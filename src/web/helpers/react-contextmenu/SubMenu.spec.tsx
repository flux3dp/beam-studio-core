import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';

import SubMenu from './SubMenu';

describe('SubMenu tests', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<SubMenu title="foo" />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render correctly when disabled', () => {
    const wrapper = shallow(<SubMenu title="foo" disabled />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render correctly after onMouseEnter', () => {
    const wrapper = mount(<SubMenu title="foo" hoverDelay={0} />);
    wrapper.find('.react-contextmenu-submenu').simulate('mouseEnter');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render correctly after onMouseEnter when disabled', () => {
    const wrapper = mount(<SubMenu title="foo" hoverDelay={0} disabled />);
    wrapper.simulate('mouseenter');
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
