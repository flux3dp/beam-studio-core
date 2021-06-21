/* eslint-disable import/first */
import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('app/contexts/Monitor-Context', () => ({
  MonitorContext: React.createContext(null),
}));

import FileItem from './FileItem';

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('fileInfo has NO blob', () => {
    const onHighlightItem = jest.fn();
    const onSelectFile = jest.fn();
    const onDeleteFile = jest.fn();
    FileItem.contextType = React.createContext({
      onHighlightItem,
      onSelectFile,
      onDeleteFile,
    });
    const wrapper = mount(<FileItem
      fileName="abc.txt"
      fileInfo={{
        author: 'flux',
      }}
      isSelected
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div.file').simulate('click');
    expect(onHighlightItem).toHaveBeenCalledTimes(1);
    expect(onHighlightItem).toHaveBeenNthCalledWith(1, {
      name: 'abc.txt',
      type: 'FILE',
    });

    wrapper.find('div.file').simulate('doubleclick');
    expect(onSelectFile).toHaveBeenCalledTimes(1);
    expect(onSelectFile).toHaveBeenNthCalledWith(1, 'abc.txt', {
      author: 'flux',
    });

    wrapper.find('i.fa-times-circle-o').simulate('click');
    expect(onDeleteFile).toHaveBeenCalledTimes(1);

    const shouldComponentUpdate = wrapper.instance().shouldComponentUpdate({
      fileName: 'abc.txt',
      fileInfo: {
        author: 'flux',
      },
      isSelected: true,
    }, {
      fileName: 'abc.txt',
      fileInfo: {
        author: 'flux',
      },
      isSelected: true,
    });
    expect(shouldComponentUpdate).toBeTruthy();
  });

  test('fileInfo has blob', () => {
    global.URL.createObjectURL = jest.fn().mockReturnValue('xxx.yyy.zzz');
    FileItem.contextType = React.createContext({
      onHighlightItem: jest.fn(),
      onSelectFile: jest.fn(),
      onDeleteFile: jest.fn(),
    });
    const fileInfoBlob = new Blob();
    const wrapper = mount(<FileItem
      fileName="abcdefghijklm.txt"
      fileInfo={{
        author: 'flux',
        2: fileInfoBlob,
      }}
      isSelected={false}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(global.URL.createObjectURL).toHaveBeenNthCalledWith(1, fileInfoBlob);
    expect(wrapper.instance().imgSrc).toBe('xxx.yyy.zzz');

    global.URL.revokeObjectURL = jest.fn();
    wrapper.instance().revokeImgURL();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(global.URL.revokeObjectURL).toHaveBeenNthCalledWith(1, 'xxx.yyy.zzz');
    expect(wrapper.instance().imgSrc).toBeNull();
  });
});
