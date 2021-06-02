import * as React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';

import ButtonGroup from './ButtonGroup';

describe('should render correctly', () => {
  test('no buttons', () => {
    expect(toJson(shallow(<ButtonGroup
      className="flux"
      buttons={[]}
    />))).toMatchSnapshot();
  });

  test('has buttons', () => {
    expect(toJson(shallow(<ButtonGroup
      className="flux"
      buttons={[{
        type: 'link',
        dataAttrs: {
          abc: 123,
        },
        className: 'btn-test',
        right: true,
        label: 'BTN-LABEL',
        href: 'https://flux3dp.com/',
        onClick: jest.fn(),
      }, {
        type: 'icon',
        className: '',
        right: false,
        label: 'icon-label',
        title: 'flux3dp',
        onClick: jest.fn(),
      }, {
        label: 'button-label',
        title: 'flux3dp',
        onClick: jest.fn(),
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseLeave: jest.fn(),
      }]}
    />))).toMatchSnapshot();
  });
});
