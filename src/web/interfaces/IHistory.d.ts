export interface ICommand {
  elem: SVGGraphicsElement;
  text: string;
  type: () => string;
  getText: () => string;
  elements: () => Element[];
  apply: (handler) => void;
  unapply: (handler) => void;
  newParent?: Node | Element;
  oldParent?: Node | Element;
  newValues?: { [key: string]: string };
  oldValues?: { [key: string]: string };
}

export interface IBatchCommand extends ICommand {
  addSubCommand: (cmd: ICommand) => void;
  isEmpty: () => boolean;
}

export interface IHistoryHandler {
  renderText: (elem: SVGTextElement, val: string, showGrips: boolean) => void;
  handleHistoryEvent: (eventType: string, cmd: ICommand) => void;
}

export interface IUndoManager {
  resetUndoStack: () => void;
  getUndoStackSize: () => number;
  getRedoStackSize: () => number;
  getNextUndoCommandText: () => string;
  getNextRedoCommandText: () => string;
  undo: () => void;
  redo: () => void;
  addCommandToHistory: (cmd: ICommand) => void;
  beginUndoableChange: (attrName: string, elems: Element[]) => void;
  finishUndoableChange: () => IBatchCommand;
}
