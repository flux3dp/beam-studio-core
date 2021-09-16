import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    general: {
      choose_folder: 'Choose Folder',
    },
    monitor: {
      minute: 'm',
    },
    settings: {
      autosave_enabled: 'Auto Save',
      autosave_path: 'Auto Save Location',
      autosave_interval: 'Save Every',
      autosave_number: 'Number of Auto Save',
      autosave_path_not_correct: 'Specified path not found.',
      help_center_urls: {
        fast_gradient: 'https://support.flux3dp.com/hc/en-us/articles/360004496235',
      },
      groups: {
        autosave: 'Auto Save',
      },
    },
  },
}));

// eslint-disable-next-line import/first
import AutoSave from './AutoSave';

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('initially no warning', () => {
    const updateState = jest.fn();
    const wrapper = shallow(<AutoSave
      isWeb={false}
      autoSaveOptions={[
        {
          value: 'TRUE',
          label: 'On',
          selected: false,
        },
        {
          value: 'FALSE',
          label: 'Off',
          selected: true,
        },
      ]}
      editingAutosaveConfig={{
        enabled: false,
        directory: '/MyDocuments',
        timeInterval: 10,
        fileNumber: 5,
      }}
      warnings={{}}
      updateState={updateState}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('SelectControl').simulate('change', {
      target: {
        value: 'TRUE',
      },
    });
    expect(updateState).toHaveBeenCalledTimes(1);
    expect(updateState).toHaveBeenNthCalledWith(1, {
      editingAutosaveConfig: {
        enabled: true,
        directory: '/MyDocuments',
        timeInterval: 10,
        fileNumber: 5,
      },
    });

    wrapper.find('PathInput').props().getValue('/FolderNotExist', false);
    expect(updateState).toHaveBeenCalledTimes(2);
    expect(updateState).toHaveBeenNthCalledWith(2, {
      editingAutosaveConfig: {
        enabled: false,
        directory: '/FolderNotExist',
        timeInterval: 10,
        fileNumber: 5,
      },
      warnings: {
        autosave_directory: 'Specified path not found.',
      },
    });

    wrapper.find('UnitInput').at(0).props().getValue(5);
    expect(updateState).toHaveBeenCalledTimes(3);
    expect(updateState).toHaveBeenNthCalledWith(3, {
      editingAutosaveConfig: {
        enabled: false,
        directory: '/MyDocuments',
        timeInterval: 5,
        fileNumber: 5,
      },
    });

    wrapper.find('UnitInput').at(1).props().getValue(10);
    expect(updateState).toHaveBeenCalledTimes(4);
    expect(updateState).toHaveBeenNthCalledWith(4, {
      editingAutosaveConfig: {
        enabled: false,
        directory: '/MyDocuments',
        timeInterval: 10,
        fileNumber: 10,
      },
    });
  });

  test('initially with warning', () => {
    const updateState = jest.fn();
    const wrapper = shallow(<AutoSave
      isWeb={false}
      autoSaveOptions={[
        {
          value: 'TRUE',
          label: 'On',
          selected: false,
        },
        {
          value: 'FALSE',
          label: 'Off',
          selected: true,
        },
      ]}
      editingAutosaveConfig={{
        enabled: false,
        directory: '/FolderNotExist',
        timeInterval: 10,
        fileNumber: 5,
      }}
      warnings={{
        autosave_directory: 'Specified path not found.',
      }}
      updateState={updateState}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('PathInput').props().getValue('/MyDocuments', true);
    expect(updateState).toHaveBeenCalledTimes(1);
    expect(updateState).toHaveBeenNthCalledWith(1, {
      editingAutosaveConfig: {
        enabled: false,
        directory: '/MyDocuments',
        timeInterval: 10,
        fileNumber: 5,
      },
      warnings: {
      },
    });
  });

  test('hide in web', () => {
    const updateState = jest.fn();
    const wrapper = shallow(<AutoSave
      isWeb
      autoSaveOptions={[
        {
          value: 'TRUE',
          label: 'On',
          selected: false,
        },
        {
          value: 'FALSE',
          label: 'Off',
          selected: true,
        },
      ]}
      editingAutosaveConfig={{
        enabled: false,
        directory: '/MyDocuments',
        timeInterval: 10,
        fileNumber: 5,
      }}
      warnings={{}}
      updateState={updateState}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
