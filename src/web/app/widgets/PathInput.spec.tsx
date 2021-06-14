/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const mockShowOpenDialog = jest.fn();
jest.mock('implementations/dialog', () => ({
  showOpenDialog: mockShowOpenDialog,
}));

const mockExists = jest.fn();
const mockIsFile = jest.fn();
const mockIsDirectory = jest.fn();
jest.mock('implementations/fileSystem', () => ({
  exists: mockExists,
  isFile: mockIsFile,
  isDirectory: mockIsDirectory,
}));

import PathInput from './PathInput';

describe('test PathInput', () => {
  test('should render correctly', async () => {
    const mockGetValue = jest.fn();
    const wrapper = shallow(<PathInput
      buttonTitle="Choose Folder"
      className="with-error"
      defaultValue="defaultFolder"
      forceValidValue={false}
      getValue={mockGetValue}
      type={1}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    await mockShowOpenDialog.mockResolvedValue({
      filePaths: [],
      canceled: true,
    });
    wrapper.find('div.dialog-btn').simulate('click');
    await (() => expect(mockShowOpenDialog).toHaveBeenCalledTimes(1));
    await (() => expect(mockShowOpenDialog).toHaveBeenNthCalledWith(1, {
      properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
      defaultPath: 'defaultFolder',
    }));
    await (() => expect(mockGetValue).not.toHaveBeenCalled());
    await expect(toJson(wrapper)).toMatchSnapshot();

    await mockShowOpenDialog.mockResolvedValue({
      filePaths: ['myDocuments'],
      canceled: false,
    });
    mockExists.mockReturnValue(false);
    wrapper.find('div.dialog-btn').simulate('click');
    await (() => expect(mockShowOpenDialog).toHaveBeenCalledTimes(2));
    await (() => expect(mockShowOpenDialog).toHaveBeenNthCalledWith(2, {
      properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
      defaultPath: 'defaultFolder',
    }));
    await (() => expect(mockExists).toHaveBeenCalledTimes(1));
    await (() => expect(mockExists).toHaveBeenNthCalledWith(1, 'myDocuments'));
    await (() => expect(mockGetValue).toHaveBeenCalledTimes(1));
    await (() => expect(mockGetValue).toHaveBeenNthCalledWith(1, 'myDocuments', false));
    await expect(toJson(wrapper)).toMatchSnapshot();
  });
});
