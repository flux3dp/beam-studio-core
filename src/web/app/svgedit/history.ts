/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
/**
 * Package: svedit.history
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Jeff Schiller
 */

// Dependencies:
// 1) jQuery
// 2) svgtransformlist.js
// 3) svgutils.js
import { getSVGAsync } from 'helpers/svg-editor-helper';
import {
  IBatchCommand, ICommand, IHistoryHandler, IUndoManager,
} from 'interfaces/IHistory';

const { svgedit } = window;
let svgCanvas = null;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

if (!svgedit.history) {
  svgedit.history = {};
}

// Group: Undo/Redo history management
const HistoryEventTypes = {
  BEFORE_APPLY: 'before_apply',
  AFTER_APPLY: 'after_apply',
  BEFORE_UNAPPLY: 'before_unapply',
  AFTER_UNAPPLY: 'after_unapply',
};
svgedit.history.HistoryEventTypes = HistoryEventTypes;

class BaseHistoryCommand {
  public elem: SVGGraphicsElement;

  public text: string;

  getText(): string {
    return this.text;
  }

  elements(): Element[] {
    return [this.elem];
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  apply(handler?) {
    throw Error('apply not implemented');
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  unapply(handler?) {
    throw Error('unapply not implemented');
  }
}

class MoveElementCommand extends BaseHistoryCommand implements ICommand {
  private oldNextSibling: Node | Element;

  private newNextSibling: Node | Element;

  public oldParent: Node | Element;

  public newParent: Node | Element;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(elem: any, oldNextSibling: Node | Element, oldParent: Element | Node, text?: string) {
    super();
    this.elem = elem as SVGGraphicsElement;
    this.text = text ? `Move ${elem.tagName} to ${text}` : `Move ${elem.tagName}`;
    this.oldNextSibling = oldNextSibling;
    this.oldParent = oldParent;
    this.newNextSibling = elem.nextSibling;
    this.newParent = elem.parentNode;
  }

  static type(): string {
    return 'svgedit.history.MoveElementCommand';
  }

  type = MoveElementCommand.type;

  apply(handler: IHistoryHandler): void {
    // TODO(codedread): Refactor this common event code into a base HistoryCommand class.
    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_APPLY, this);
    }

    this.elem = this.newParent.insertBefore(this.elem, this.newNextSibling);

    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_APPLY, this);
    }
  }

  unapply(handler: IHistoryHandler): void {
    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_UNAPPLY, this);
    }

    this.elem = this.oldParent.insertBefore(this.elem, this.oldNextSibling);

    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_UNAPPLY, this);
    }
  }
}
svgedit.history.MoveElementCommand = MoveElementCommand;

// History command for an element that was added to the DOM
class InsertElementCommand extends BaseHistoryCommand implements ICommand {
  private nextSibling: Node | Element;

  private parent: Node | Element;

  constructor(elem: Element | SVGGraphicsElement, text?: string) {
    super();
    this.elem = elem as SVGGraphicsElement;
    this.text = text || `Create ${elem.tagName}`;
    this.parent = elem.parentNode;
    this.nextSibling = this.elem.nextSibling;
  }

  static type(): string {
    return 'svgedit.history.InsertElementCommand';
  }

  type = InsertElementCommand.type;

  apply(handler: IHistoryHandler): void {
    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_APPLY, this);
    }

    this.elem = this.parent.insertBefore(this.elem, this.nextSibling);

    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_APPLY, this);
    }
  }

  unapply(handler: IHistoryHandler): void {
    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_UNAPPLY, this);
    }

    this.parent = this.elem.parentNode;
    this.elem = this.elem.parentNode.removeChild(this.elem);

    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_UNAPPLY, this);
    }
  }
}
svgedit.history.InsertElementCommand = InsertElementCommand;

// History command for an element removed from the DOM
class RemoveElementCommand extends BaseHistoryCommand implements ICommand {
  private nextSibling: Node | Element;

  private parent: Node | Element;

  constructor(
    elem: Element | SVGGraphicsElement,
    oldNextSibling: Node | Element,
    oldParent: Node | Element,
    text?: string,
  ) {
    super();
    this.elem = elem as SVGGraphicsElement;
    this.text = text || `Delete ${elem.tagName}`;
    this.nextSibling = oldNextSibling;
    this.parent = oldParent;

    // special hack for webkit: remove this element's entry in the svgTransformLists map
    svgedit.transformlist.removeElementFromListMap(elem);
  }

  static type(): string {
    return 'svgedit.history.RemoveElementCommand';
  }

  type = RemoveElementCommand.type;

  apply(handler: IHistoryHandler): void {
    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_APPLY, this);
    }

    svgedit.transformlist.removeElementFromListMap(this.elem);
    this.parent = this.elem.parentNode;
    this.elem = this.parent.removeChild(this.elem);

    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_APPLY, this);
    }
  }

  unapply(handler: IHistoryHandler): void {
    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_UNAPPLY, this);
    }

    svgedit.transformlist.removeElementFromListMap(this.elem);
    if (this.nextSibling === null) {
      if (window.console) {
        // eslint-disable-next-line no-console
        // console.log('Error: reference element was lost');
      }
    }
    this.parent.insertBefore(this.elem, this.nextSibling);

    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_UNAPPLY, this);
    }
  }
}
svgedit.history.RemoveElementCommand = RemoveElementCommand;

// History command to make a change to an element.
// Usually an attribute change, but can also be textcontent.
class ChangeElementCommand extends BaseHistoryCommand implements ICommand {
  public newValues: { [key: string]: any };

  public oldValues: { [key: string]: any };

  constructor(elem: Element | SVGGraphicsElement, attrs: { [key: string]: any }, text?: string) {
    super();
    this.elem = elem as SVGGraphicsElement;
    this.text = `Change ${elem.tagName}${text ? ` ${text}` : ''}`;
    this.newValues = {};
    this.oldValues = attrs;
    const keys = Object.keys(attrs);
    for (let i = 0; i < keys.length; i += 1) {
      const attr = keys[i];
      if (attr === '#text') {
        this.newValues[attr] = elem.textContent;
      } else if (attr === '#href') {
        this.newValues[attr] = svgedit.utilities.getHref(elem);
      } else {
        this.newValues[attr] = elem.getAttribute(attr);
      }
    }
  }

  static type(): string {
    return 'svgedit.history.ChangeElementCommand';
  }

  type = ChangeElementCommand.type;

  apply(handler: IHistoryHandler): void {
    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_APPLY, this);
    }

    let bChangedTransform = false;
    const keys = Object.keys(this.newValues);
    for (let i = 0; i < keys.length; i += 1) {
      const attr = keys[i];
      if (this.newValues[attr]) {
        if (attr === '#text') {
          this.elem.textContent = this.newValues[attr];
        } else if (attr === '#href') {
          svgedit.utilities.setHref(this.elem, this.newValues[attr]);
        } else {
          this.elem.setAttribute(attr, this.newValues[attr]);
        }
      } else if (attr === '#text') {
        this.elem.textContent = '';
      } else {
        this.elem.setAttribute(attr, '');
        this.elem.removeAttribute(attr);
      }
      if (!bChangedTransform && attr === 'transform') {
        bChangedTransform = true;
      }
    }

    // relocate rotational transform, if necessary
    if (!bChangedTransform) {
      const angle = svgedit.utilities.getRotationAngle(this.elem);
      if (angle) {
        // TODO: These instances of elem either need to be declared as global
        // (which would not be good for conflicts) or declare/use this.elem
        const bbox = this.elem.getBBox();
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;
        const rotate = `rotate(${angle} ${cx}, ${cy})`;
        if (rotate !== this.elem.getAttribute('transform')) {
          this.elem.setAttribute('transform', rotate);
        }
      }
    }

    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_APPLY, this);
    }
  }

  unapply(handler: IHistoryHandler): void {
    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_UNAPPLY, this);
    }

    let bChangedTransform = false;
    const keys = Object.keys(this.oldValues);
    for (let i = 0; i < keys.length; i += 1) {
      const attr = keys[i];
      if (this.oldValues[attr]) {
        if (attr === '#text') {
          this.elem.textContent = this.oldValues[attr];
        } else if (attr === '#href') {
          svgedit.utilities.setHref(this.elem, this.oldValues[attr]);
        } else {
          this.elem.setAttribute(attr, this.oldValues[attr]);
        }
      } else if (attr === '#text') {
        this.elem.textContent = '';
      } else {
        this.elem.removeAttribute(attr);
      }
      if (!bChangedTransform && attr === 'transform') {
        bChangedTransform = true;
      }
    }
    // relocate rotational transform, if necessary
    if (!bChangedTransform) {
      const angle = svgedit.utilities.getRotationAngle(this.elem);
      if (angle) {
        const bbox = this.elem.getBBox();
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;
        const rotate = `rotate(${angle} ${cx}, ${cy})`;
        if (rotate !== this.elem.getAttribute('transform')) {
          this.elem.setAttribute('transform', rotate);
        }
      }
    }

    // Remove transformlist to prevent confusion that causes bugs like 575.
    svgedit.transformlist.removeElementFromListMap(this.elem);

    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_UNAPPLY, this);
    }
  }
}
svgedit.history.ChangeElementCommand = ChangeElementCommand;

class ChangeTextCommand extends BaseHistoryCommand implements ICommand {
  public oldText: string;

  public newText: string;

  constructor(elem: Element | SVGGraphicsElement, oldText: string, newText: string) {
    super();
    this.elem = elem as SVGGraphicsElement;
    this.text = `Change ${elem.id || elem.tagName} from ${oldText} to ${newText}`;
    this.oldText = oldText;
    this.newText = newText;
  }

  static type(): string {
    return 'svgcanvas.textAction.ChangeTextCommand';
  }

  type = ChangeTextCommand.type;

  apply(handler: IHistoryHandler): void {
    if (handler) {
      handler.handleHistoryEvent(HistoryEventTypes.BEFORE_APPLY, this);
      handler.renderText(this.elem as SVGTextElement, this.newText, false);
      handler.handleHistoryEvent(HistoryEventTypes.AFTER_APPLY, this);
    }
  }

  unapply(handler: IHistoryHandler): void {
    if (handler) {
      handler.handleHistoryEvent(HistoryEventTypes.BEFORE_UNAPPLY, this);
      handler.renderText(this.elem as SVGTextElement, this.oldText, false);
      handler.handleHistoryEvent(HistoryEventTypes.AFTER_UNAPPLY, this);
    }
  }
}
svgedit.history.ChangeTextCommand = ChangeTextCommand;

// TODO: create a 'typing' command object that tracks changes in text
// if a new Typing command is created and the top command on the stack is also a Typing
// and they both affect the same element, then collapse the two commands into one

// Class: svgedit.history.BatchCommand
// implements svgedit.history.HistoryCommand
// History command that can contain/execute multiple other commands
//
// Parameters:
// text - An optional string visible to user related to this change
class BatchCommand extends BaseHistoryCommand implements IBatchCommand {
  private stack: BaseHistoryCommand[];

  constructor(text?: string) {
    super();
    this.text = text || 'Batch Command';
    this.stack = [];
  }

  static type(): string {
    return 'svgedit.history.BatchCommand';
  }

  type = BatchCommand.type;

  apply(handler: IHistoryHandler): void {
    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_APPLY, this);
    }

    for (let i = 0; i < this.stack.length; i += 1) {
      this.stack[i]?.apply(handler);
    }

    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_APPLY, this);
    }
  }

  unapply(handler: IHistoryHandler): void {
    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_UNAPPLY, this);
    }

    for (let i = this.stack.length - 1; i >= 0; i -= 1) {
      this.stack[i]?.unapply(handler);
    }

    if (handler) {
      handler.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_UNAPPLY, this);
    }
  }

  elements(): Element[] {
    const elemSet = new Set<Element>();
    for (let i = this.stack.length - 1; i >= 0; i -= 1) {
      const cmd = this.stack[i];
      cmd?.elements().forEach((elem) => {
        elemSet.add(elem);
      });
    }
    const elems = Array.from(elemSet);
    return elems;
  }

  addSubCommand(cmd: BaseHistoryCommand): void {
    this.stack.push(cmd);
  }

  isEmpty(): boolean {
    return this.stack.length === 0;
  }
}
svgedit.history.BatchCommand = BatchCommand;

class UndoManager implements IUndoManager {
  private handler: IHistoryHandler;

  private undoStackPointer: number;

  private undoStack: BaseHistoryCommand[];

  private undoChangeStackPointer: number;

  private undoableChangeStack: {
    attrName: string;
    elements: Element[];
    oldValues: string[];
  }[];

  constructor(historyEventHandler: IHistoryHandler) {
    this.handler = historyEventHandler || null;
    this.undoStackPointer = 0;
    this.undoStack = [];

    // this is the stack that stores the original values, the elements and
    // the attribute name for begin/finish
    this.undoChangeStackPointer = -1;
    this.undoableChangeStack = [];
  }

  resetUndoStack(): void {
    this.undoStack = [];
    this.undoStackPointer = 0;
  }

  getUndoStackSize(): number {
    return this.undoStackPointer;
  }

  getRedoStackSize(): number {
    return this.undoStack.length - this.undoStackPointer;
  }

  getNextUndoCommandText(): string {
    return this.undoStackPointer > 0 ? this.undoStack[this.undoStackPointer - 1].getText() : '';
  }

  getNextRedoCommandText(): string {
    return this.undoStackPointer < this.undoStack.length ? this.undoStack[this.undoStackPointer].getText() : '';
  }

  undo(): void {
    if (this.undoStackPointer > 0) {
      svgCanvas.setHasUnsavedChange(true);
      this.undoStackPointer -= 1;
      const cmd = this.undoStack[this.undoStackPointer];
      cmd.unapply(this.handler);
    }
  }

  redo(): void {
    if (this.undoStackPointer < this.undoStack.length && this.undoStack.length > 0) {
      svgCanvas.setHasUnsavedChange(true);
      const cmd = this.undoStack[this.undoStackPointer];
      this.undoStackPointer += 1;
      cmd.apply(this.handler);
    }
  }

  addCommandToHistory(cmd: BaseHistoryCommand): void {
    // FIXME: we MUST compress consecutive text changes to the same element
    // (right now each keystroke is saved as a separate command that includes the
    // entire text contents of the text element)
    // TODO: consider limiting the history that we store here (need to do some slicing)

    // if our stack pointer is not at the end, then we have to remove
    // all commands after the pointer and insert the new command
    if (this.undoStackPointer < this.undoStack.length && this.undoStack.length > 0) {
      this.undoStack = this.undoStack.splice(0, this.undoStackPointer);
    }
    this.undoStack.push(cmd);
    this.undoStackPointer = this.undoStack.length;
    const isInitCommand = this.undoStack.length === 1 && cmd.getText() === 'Create Layer';
    if (svgCanvas && !isInitCommand) {
      svgCanvas.setHasUnsavedChange(true);
    }
    // console.log(this.undoStack);
  }

  beginUndoableChange(attrName: string, elems: Element[]): void {
    this.undoChangeStackPointer += 1;
    const p = this.undoChangeStackPointer;
    const elements = elems.filter((elem) => !!elem);
    const oldValues = elements.map((elem) => elem.getAttribute(attrName));
    this.undoableChangeStack[p] = { attrName, oldValues, elements };
  }

  finishUndoableChange(): IBatchCommand {
    const p = this.undoChangeStackPointer;
    this.undoChangeStackPointer -= 1;
    const changeset = this.undoableChangeStack[p];
    const { attrName, elements, oldValues } = changeset;
    const batchCmd = new BatchCommand(`Change ${attrName}`);
    for (let i = elements.length - 1; i >= 0; i -= 1) {
      const elem = elements[i];
      if (elem == null) {
        // eslint-disable-next-line no-continue
        continue;
      }
      const changes = {};
      changes[attrName] = oldValues[i];
      if (changes[attrName] !== elem.getAttribute(attrName)) {
        batchCmd.addSubCommand(new ChangeElementCommand(elem, changes, attrName));
      }
    }
    this.undoableChangeStack[p] = null;
    return batchCmd;
  }
}

export default {
  HistoryEventTypes,
  MoveElementCommand,
  ChangeElementCommand,
  InsertElementCommand,
  RemoveElementCommand,
  ChangeTextCommand,
  BatchCommand,
  UndoManager,
};
