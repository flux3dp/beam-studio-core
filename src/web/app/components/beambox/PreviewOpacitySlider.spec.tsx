/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import { CanvasContext } from 'app/contexts/CanvasContext';

import PreviewOpacitySlider from './PreviewOpacitySlider';

jest.mock('helpers/useI18n', () => () => ({
  editor: {
    opacity: 'Preview Opacity',
  },
}));

jest.mock('app/contexts/CanvasContext', () => ({
  CanvasContext: React.createContext({ isPathPreviewing: false }),
}));

jest.mock('antd', () => ({
  Tooltip: ({ title, children }: any) => (
    <div>
      Mock Antd Tooltip<p>title: {title}</p>
      {children}
    </div>
  ),
  Slider: ({ className, min, max, step, value, onChange }: any) => (
    <div className={className}>
      Mock Antd Slider
      <p>min: {min}</p>
      <p>max: {max}</p>
      <p>step: {step}</p>
      <p>value: {value}</p>
      <button type="button" onClick={() => onChange(0.25)}>
        onChange
      </button>
    </div>
  ),
}));

describe('test PreviewOpacitySlider', () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<image id="background_image" style="pointer-events:none; opacity: 1;"/>';
  });

  it('should render correctly with preview image', async () => {
    const { container, getByText } = render(<PreviewOpacitySlider />);
    const bgImage = document.getElementById('background_image');
    expect(bgImage).toHaveStyle({ opacity: 1 });
    expect(container).toMatchSnapshot();

    fireEvent.click(getByText('onChange'));
    expect(bgImage).toHaveStyle({ opacity: 0.25 });
    expect(container).toMatchSnapshot();
  });

  it('should render correctly without background image', () => {
    document.body.innerHTML = '';
    const { container } = render(<PreviewOpacitySlider />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render correctly when isPreviewing', () => {
    const bgImage: HTMLElement = document.getElementById('background_image');
    bgImage.style.opacity = '0.5';
    const { container } = render(
      <CanvasContext.Provider value={{ isPreviewing: true } as any}>
        <PreviewOpacitySlider />
      </CanvasContext.Provider>
    );
    expect(container).toBeEmptyDOMElement();
    expect(bgImage).toHaveStyle({ opacity: 1 });
  });

  it('should render correctly when isPathPreviewing', () => {
    const { container } = render(
      <CanvasContext.Provider value={{ isPathPreviewing: true } as any}>
        <PreviewOpacitySlider />
      </CanvasContext.Provider>
    );
    expect(container).toBeEmptyDOMElement();
  });
});
