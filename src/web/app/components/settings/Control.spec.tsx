import * as React from 'react';
import toJson from 'enzyme-to-json';
import { mount, shallow } from 'enzyme';
import { render } from '@testing-library/react';

const open = jest.fn();
jest.mock('implementations/browser', () => ({
  open,
}));

const useIsMobile = jest.fn();
jest.mock('helpers/system-helper', () => ({
  useIsMobile: () => useIsMobile(),
}));

// eslint-disable-next-line import/first
import Control from './Control';

describe('test Control', () => {
  it('should render correctly', () => {
    expect(
      toJson(
        shallow(
          <Control label="Flux">
            <div>Hello World</div>
          </Control>
        )
      )
    ).toMatchSnapshot();

    const wrapper = mount(
      <Control label="Flux" url="https://www.flux3dp.com" warningText="Warning!!">
        <div>Hello World</div>
      </Control>
    );
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('img').at(0).simulate('click');
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenNthCalledWith(1, 'https://www.flux3dp.com');
  });

  it('should render correctly in mobile', () => {
    useIsMobile.mockReturnValue(true);
    const { container } = render(
      <Control label="Flux">
        <div>Hello World</div>
      </Control>
    );
    expect(container).toMatchSnapshot();
  });
});
