import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import FloatingPanel from './FloatingPanel';

const mockOnClose = jest.fn();

const mockProps = {
  className: 'mock-class',
  anchors: [0, 40, 100],
  title: 'mock-title',
  fixedContent: <div>fixed</div>,
  children: <div>children</div>,
  onClose: mockOnClose,
};

const MockComponent = () => {
  const [close, setClose] = React.useState(false);
  return (
    <div>
      <button onClick={() => setClose(true)}>Close</button>
      <FloatingPanel {...mockProps} forceClose={close} />
    </div>
  );
};

async function mockDrag(el: Element, startY: number, endY: number) {
  fireEvent.mouseDown(el, {
    clientY: startY,
    buttons: 1,
  });
  fireEvent.mouseMove(el, {
    clientY: endY,
    buttons: 1,
  });
  fireEvent.mouseUp(el);
}

describe('test FloatingPanel', () => {
  beforeEach(() => {
    mockOnClose.mockReset();
  });

  it('should render correctly', () => {
    const { container } = render(<FloatingPanel {...mockProps} />);
    expect(container).toMatchSnapshot();
  });

  it('should behave correctly when changing height', async () => {
    const { container } = render(<FloatingPanel {...mockProps} />);
    const panelEl = container.querySelector('.adm-floating-panel') as HTMLElement;
    // antd init height = first anchor
    expect(panelEl.style.transform).toBe(`translateY(calc(100% + (0px)))`);
    expect(panelEl.style.height).toBe(`0px`);
    // update height = second anchor
    await waitFor(() => expect(panelEl.style.transform).toBe(`translateY(calc(100% + (-40px)))`));
    expect(Math.round(Number(panelEl.style.height.slice(0, -2)))).toBe(40);
    const draggableBar = container.querySelector('.adm-floating-panel .adm-floating-panel-header');
    mockDrag(draggableBar, 0, -80);
    await waitFor(() => expect(panelEl.style.transform).toBe(`translateY(calc(100% + (-100px)))`));
    expect(Math.round(Number(panelEl.style.height.slice(0, -2)))).toBe(100);
    expect(mockOnClose).not.toBeCalled();
    mockDrag(draggableBar, 0, +100);
    await waitFor(() => expect(panelEl.style.transform).toBe(`translateY(calc(100% + (0px)))`));
    expect(Math.round(Number(panelEl.style.height.slice(0, -2)))).toBe(-0);
    await waitFor(() => expect(mockOnClose).toBeCalledTimes(1));
  });

  it('should close when close is true', async () => {
    const { container } = render(<MockComponent />);
    const panelEl = container.querySelector('.adm-floating-panel') as HTMLElement;
    await waitFor(() => expect(panelEl.style.transform).toBe(`translateY(calc(100% + (-40px)))`));
    expect(mockOnClose).not.toBeCalled();
    const btn = container.querySelector('button');
    fireEvent.click(btn);
    await waitFor(() => expect(panelEl.style.transform).toBe(`translateY(calc(100% + (0px)))`));
    await waitFor(() => expect(mockOnClose).toBeCalledTimes(1));
  });

  it('should close when clicking close button', async () => {
    const { container } = render(<FloatingPanel {...mockProps} />);
    const panelEl = container.querySelector('.adm-floating-panel') as HTMLElement;
    await waitFor(() => expect(panelEl.style.transform).toBe(`translateY(calc(100% + (-40px)))`));
    expect(mockOnClose).not.toBeCalled();
    const close = container.querySelector('.close-icon');
    fireEvent.click(close);
    await waitFor(() => expect(panelEl.style.transform).toBe(`translateY(calc(100% + (0px)))`));
    await waitFor(() => expect(mockOnClose).toBeCalledTimes(1));
  });
});
