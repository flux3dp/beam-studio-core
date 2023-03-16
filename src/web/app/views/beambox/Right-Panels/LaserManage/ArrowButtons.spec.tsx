import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import ArrowButtons from './ArrowButtons';
import Context from './Context';

jest.mock('app/views/beambox/Right-Panels/LaserManage/Context', () => React.createContext({}));

const mockDispatch = jest.fn();

describe('test ArrowButtons', () => {
  it('should render correctly', () => {
    const { container } = render(<ArrowButtons />);
    expect(container).toMatchSnapshot();
  });

  test('event should be called correctly', () => {
    const { container } = render(
      <Context.Provider value={{ state: {} as any, dispatch: mockDispatch }}>
        <ArrowButtons />
      </Context.Provider>
    );
    expect(mockDispatch).not.toBeCalled();
    const addBtn = container.querySelectorAll('.btn')[0];
    fireEvent.click(addBtn);
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenNthCalledWith(1, { type: 'add-preset' });

    const removeBtn = container.querySelectorAll('.btn')[1];
    fireEvent.click(removeBtn);
    expect(mockDispatch).toBeCalledTimes(2);
    expect(mockDispatch).toHaveBeenNthCalledWith(2, { type: 'remove-preset' });
  });
});
