import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import BackgroundRemovalPanel from './BackgroundRemovalPanel';

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    photo_edit_panel: {
      cancel: 'Cancel',
      apply: 'Apply',
    },
    right_panel: {
      object_panel: {
        actions_panel: {
          ai_bg_removal: 'AI Background Removal',
        },
      },
    },
  },
}));

const mockOnApply = jest.fn();
const mockOnCancel = jest.fn();
const mockOnClose = jest.fn();

describe('test BackgroundRemovalPanel', () => {
  it('should render correctly', () => {
    const { baseElement } = render(<BackgroundRemovalPanel
      originalUrl="originalUrl"
      resultUrl="resultUrl"
      onApply={mockOnApply}
      onCancel={mockOnCancel}
      onClose={mockOnClose}
    />);
    expect(baseElement).toMatchSnapshot();
    expect(baseElement.querySelectorAll('img')[0].getAttribute('src')).toBe('originalUrl');
    expect(baseElement.querySelectorAll('img')[1].getAttribute('src')).toBe('resultUrl');
  });

  test('buttons should work', () => {
    const { getByText } = render(<BackgroundRemovalPanel
      originalUrl="originalUrl"
      resultUrl="resultUrl"
      onApply={mockOnApply}
      onCancel={mockOnCancel}
      onClose={mockOnClose}
    />);
    fireEvent.click(getByText('Cancel'));
    expect(mockOnCancel).toBeCalledTimes(1);
    expect(mockOnClose).toBeCalledTimes(1);
    fireEvent.click(getByText('Apply'));
    expect(mockOnApply).toBeCalledTimes(1);
    expect(mockOnClose).toBeCalledTimes(2);
  });
});
