/* eslint-disable import/first */
import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import SidePanel from './SidePanel';

const useWorkarea = jest.fn();
jest.mock('helpers/hooks/useWorkarea', () => () => useWorkarea());

describe('side panel test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly when enabled', () => {
    useWorkarea.mockReturnValue('fbm1');
    const handleStartHere = jest.fn();
    const togglePathPreview = jest.fn();
    const { container } = render(
      <SidePanel
        size="100 x 100 mm"
        estTime="60 s"
        lightTime="30 s"
        rapidTime="10 s"
        cutDist="50 mm"
        rapidDist="30 mm"
        currentPosition="50, 50 mm"
        handleStartHere={handleStartHere}
        isStartHereEnabled
        togglePathPreview={togglePathPreview}
      />
    );
    expect(container).toMatchSnapshot();

    const buttons = container.querySelectorAll('div.btn-default');
    fireEvent.click(buttons[0]);
    expect(handleStartHere).toHaveBeenCalledTimes(1);

    fireEvent.click(buttons[1]);
    expect(togglePathPreview).toHaveBeenCalledTimes(1);
  });

  it('should render correctly when disabled', () => {
    useWorkarea.mockReturnValue('fbm1');
    const handleStartHere = jest.fn();
    const togglePathPreview = jest.fn();
    const { container } = render(
      <SidePanel
        size="100 x 100 mm"
        estTime="60 s"
        lightTime="30 s"
        rapidTime="10 s"
        cutDist="50 mm"
        rapidDist="30 mm"
        currentPosition="50, 50 mm"
        handleStartHere={handleStartHere}
        isStartHereEnabled={false}
        togglePathPreview={togglePathPreview}
      />
    );
    expect(container).toMatchSnapshot();

    const buttons = container.querySelectorAll('div.btn-default');
    fireEvent.click(buttons[0]);
    expect(handleStartHere).toHaveBeenCalledTimes(0);

    fireEvent.click(buttons[1]);
    expect(togglePathPreview).toHaveBeenCalledTimes(1);
  });

  it('should render correctly with Promark', () => {
    useWorkarea.mockReturnValue('fpm1');
    const handleStartHere = jest.fn();
    const togglePathPreview = jest.fn();
    const { container } = render(
      <SidePanel
        size="100 x 100 mm"
        estTime="60 s"
        lightTime="30 s"
        rapidTime="10 s"
        cutDist="50 mm"
        rapidDist="30 mm"
        currentPosition="50, 50 mm"
        handleStartHere={handleStartHere}
        isStartHereEnabled
        togglePathPreview={togglePathPreview}
      />
    );
    expect(container).toMatchSnapshot();

    const button = container.querySelector('div.btn-default');
    fireEvent.click(button);
    expect(togglePathPreview).toHaveBeenCalledTimes(1);
  });
});
