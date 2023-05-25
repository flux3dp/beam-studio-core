import React from 'react';
import { render } from '@testing-library/react';

import AddOnBlock from './AddOnBlock';

jest.mock('./AutoFocus', () => () => <div>DummyAutoFocus</div>);
jest.mock('./Diode', () => () => <div>DummyDiode</div>);

const mockRead = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (key: string) => mockRead(key),
}));

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        add_on: 'add_on',
      },
    },
  },
}));

describe('test AddOnBlock', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render nothing if both autofocus and diode are disabled', () => {
    mockRead.mockReturnValueOnce('fbm1').mockReturnValueOnce(false).mockReturnValueOnce(false);
    const { container } = render(<AddOnBlock />);
    expect(mockRead).toBeCalledTimes(3);
    expect(mockRead).toHaveBeenNthCalledWith(1, 'workarea');
    expect(mockRead).toHaveBeenNthCalledWith(2, 'enable-autofocus');
    expect(mockRead).toHaveBeenNthCalledWith(3, 'enable-diode');
    expect(container).toBeEmptyDOMElement();
  });

  it('should render autofocus if autofocus is enabled', () => {
    mockRead.mockReturnValueOnce('fbm1').mockReturnValueOnce(true).mockReturnValueOnce(false);
    const { getByText, queryByText } = render(<AddOnBlock />);
    expect(getByText('DummyAutoFocus')).toBeInTheDocument();
    expect(queryByText('DummyDiode')).not.toBeInTheDocument();
  });

  it('should render diode if diode is enabled', () => {
    mockRead.mockReturnValueOnce('fbm1').mockReturnValueOnce(false).mockReturnValueOnce(true);
    const { getByText, queryByText } = render(<AddOnBlock />);
    expect(queryByText('DummyAutoFocus')).not.toBeInTheDocument();
    expect(getByText('DummyDiode')).toBeInTheDocument();
  });

  it('should render both when both enabled', () => {
    mockRead.mockReturnValueOnce('fbm1').mockReturnValueOnce(true).mockReturnValueOnce(true);
    const { getByText } = render(<AddOnBlock />);
    expect(getByText('DummyAutoFocus')).toBeInTheDocument();
    expect(getByText('DummyDiode')).toBeInTheDocument();
  });

  it('should be empty if workarea is not supported', () => {
    mockRead.mockReturnValueOnce('fbb1b').mockReturnValueOnce(true).mockReturnValueOnce(true);
    const { container } = render(<AddOnBlock />);
    expect(container).toBeEmptyDOMElement();
  });
});
