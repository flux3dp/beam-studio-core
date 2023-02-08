/* eslint-disable import/first */
import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import PathEditPanel from './PathEditPanel';

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      right_panel: {
        object_panel: {
          path_edit_panel: {
            node_type: 'NODE TYPE',
          },
        },
      },
    },
  },
}));

const setSelectedNodeType = jest.fn();
const mockSetSharp = jest.fn();
const mockSetRound = jest.fn();
const mockDisconnectNode = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) => callback({
    Edit: {
      path: {
        path: {
          setSelectedNodeType: (...args) => setSelectedNodeType(...args),
          selected_pts: [2],
          nodePoints: [
            {
              index: 0,
              linkType: 0,
              isSharp: () => true,
              isRound: () => false,
              prev: 'mock-p2',
              next: 'mock-p1'
            },
            {
              index: 1,
              linkType: 0,
              isSharp: () => true,
              isRound: () => false,
              prev: 'mock-p0',
              next: 'mock-p2'
            },
            {
              index: 2,
              linkType: 0,
              isSharp: () => true,
              isRound: () => false,
              prev: 'mock-p1',
              next: 'mock-p0'
            },
          ],
        },
      },
    },
    Canvas: {
      pathActions: {
        setSharp: (...args) => mockSetSharp(...args),
        setRound: (...args) => mockSetRound(...args),
        disconnectNode: (...args) => mockDisconnectNode(...args),
      }
    }
  }),
}));

test('should render correctly', () => {
  const { container, getByText, getByTitle } = render(<PathEditPanel />);
  expect(container).toMatchSnapshot();

  expect(setSelectedNodeType).not.toBeCalled();
  fireEvent.click(getByTitle('tSmooth'));
  expect(setSelectedNodeType).toBeCalledTimes(1);
  expect(setSelectedNodeType).toHaveBeenLastCalledWith(1);

  expect(mockSetRound).not.toBeCalled();
  fireEvent.click(getByText('Round'));
  expect(mockSetRound).toBeCalledTimes(1);

  expect(mockSetSharp).not.toBeCalled();
  fireEvent.click(getByText('Sharp'));
  expect(mockSetRound).toBeCalledTimes(1);

  expect(mockDisconnectNode).not.toBeCalled();
  fireEvent.click(getByText('Disconnect'));
  expect(mockDisconnectNode).toBeCalledTimes(1);
});
