/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IMenu {
  getApplicationMenu(): any;
  setApplicationMenu(menu: any): void;
  appendMenuItem(menu: any, options: MenuItemOptions): void;
  createTitleBar(options: {
    backgroundColor: any,
    icon?: string,
    shadow?: boolean,
  }): any;
}

export interface MenuItemOptions {
  id?: string;
  label?: string;
  type?: 'separator';
  click?: () => void;
}
