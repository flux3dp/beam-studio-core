import { ThemeConfig } from 'antd';

export const iconButtonTheme: ThemeConfig = {
  components: {
    Button: {
      // button size
      controlHeight: 24,
      // icon size
      fontSize: 24,
      lineHeight: 1,
      // icon color
      colorText: '#494949',
      colorTextDisabled: '#CECECE',
      // border
      lineWidth: 0,
    },
  },
};

export const textButtonTheme: ThemeConfig = {
  components: {
    Button: {
      // button size
      controlHeight: 30,
      // icon size
      fontSize: 24,
      lineHeight: 1,
      // icon and text color
      colorText: '#333333',
      colorTextDisabled: '#B9B9B9',
      // margin between icon and text
      marginXS: 4,
    },
  },
};

export const sliderTheme: ThemeConfig = {
  token: {
    // track background
    colorFillTertiary: '#E0E0DF',
    // track background when hovered
    colorFillSecondary: '#E0E0DF',
  },
};

export const selectTheme: ThemeConfig = {
  components: {
    Select: {
      controlHeight: 24,
      colorBgContainer: 'transparent',
      colorBgContainerDisabled: 'transparent',
      borderRadius: 0,
      // box shadow
      controlOutline: 'transparent',
    },
  },
};
