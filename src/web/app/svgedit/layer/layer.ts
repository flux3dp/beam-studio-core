import history from 'web/app/svgedit/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import { getLayerName } from 'helpers/layer/layer-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { ICommand } from 'interfaces/IHistory';

let svgedit;
getSVGAsync((globalSVG) => {
  svgedit = globalSVG.Edit;
});

class Layer {
  private element: SVGGElement;

  private _color: string;

  private _isLocked: boolean;

  private _isVisible: boolean;

  private _isFullColor: boolean;

  private _name: string;

  constructor(element: SVGGElement) {
    this.element = element;
    this.getInitialData();
  }

  getInitialData = (): void => {
    this._color = this.element.getAttribute('data-color') || '#333333';
    this._isLocked = this.element.getAttribute('data-lock') === 'true';
    this._isVisible = this.element.getAttribute('display') !== 'none';
    this._isFullColor = this.element.getAttribute('data-fullcolor') === '1';
    this._name = getLayerName(this.element);
  };

  get color(): string {
    return this._color;
  }

  setColor(val: string): ICommand {
    const oldValue = this._color;
    this.element.setAttribute('data-color', val);
    this._color = val;
    const cmd = new history.ChangeElementCommand(this.element, { 'data-color': oldValue });
    // update layer color?
    // history
    return cmd;
  }

  get isLocked(): boolean {
    return this._isLocked;
  }

  setLocked(val: boolean): ICommand {
    const oldAttributeValue = this.element.getAttribute('display');
    if (val) this.element.setAttribute('data-lock', 'true');
    else this.element.removeAttribute('data-lock');
    this._isLocked = val;
    const cmd = new history.ChangeElementCommand(this.element, { 'data-lock': oldAttributeValue });
    return cmd;
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  setVisible(val: boolean): ICommand {
    const oldAttributeValue = this.element.getAttribute('display');
    if (val) this.element.removeAttribute('display');
    else this.element.setAttribute('display', 'none');
    this._isVisible = val;
    const cmd = new history.ChangeElementCommand(this.element, { 'display': oldAttributeValue });
    // deselect all elements in this layer
    return cmd;
  }

  get isFullColor(): boolean {
    return this._isFullColor;
  }

  setIsFullColor(val: boolean): ICommand {
    const oldAttributeValue = this.element.getAttribute('data-fullcolor');
    if (val) this.element.setAttribute('data-fullcolor', '1');
    else this.element.removeAttribute('data-fullcolor');
    this._isFullColor = val;
    const cmd = new history.ChangeElementCommand(this.element, { 'data-fullcolor': oldAttributeValue });
    return cmd;
  }

  get name(): string {
    return this._name;
  }

  setName(val: string): { name: string, cmd: ICommand } | null {
    const titleElement = this.element.querySelector(':spec > title');
    if (titleElement) {
      const newName = svgedit.utilities.toXml(val);
      while (titleElement.firstChild) {
        titleElement.firstChild.remove();
      }
      const oldName = titleElement.textContent;
      titleElement.textContent = newName;
      this._name = newName;
      const cmd = new history.ChangeElementCommand(titleElement, { '#text': oldName });
      return { name: newName, cmd };
    }
    return null;
  }
}

export default Layer;
