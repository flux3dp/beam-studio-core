/**
 * SVGCanvas Text Actions
 */
/* eslint-disable no-console */
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import history from 'app/svgedit/history';
import { getSVGAsync } from 'helpers/svg-editor-helper';

interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });

const { svgedit } = window;
const { NS } = svgedit;

class TextActions {
  public isEditing = false;

  private curtext: SVGTextElement;

  private textinput: HTMLInputElement;

  private cursor: Element;

  private selblock;

  private blinker: NodeJS.Timeout;

  private chardata: BBox[][] = [];

  private textbb;

  private matrix;

  private lastX;

  private lastY;

  private allowDbl;

  private isVertical = false;

  private fontSize = 100;

  private previousMode = 'select';

  private valueBeforeEdit = '';

  private screenToPt(xIn, yIn) {
    const out = {
      x: xIn,
      y: yIn,
    };

    const zoom = svgCanvas.getZoom();
    out.x /= zoom;
    out.y /= zoom;

    if (this.matrix) {
      const pt = svgedit.math.transformPoint(out.x, out.y, this.matrix.inverse());
      out.x = pt.x;
      out.y = pt.y;
    }

    return out;
  }

  private ptToScreen(xIn, yIn) {
    const out = {
      x: xIn,
      y: yIn,
    };

    if (this.matrix) {
      const pt = svgedit.math.transformPoint(out.x, out.y, this.matrix);
      out.x = pt.x;
      out.y = pt.y;
    }
    const zoom = svgCanvas.getZoom();
    out.x *= zoom;
    out.y *= zoom;

    return out;
  }

  private calculateCharbb() {
    const {
      curtext, textinput, isVertical, textbb, chardata, fontSize,
    } = this;
    if (!curtext) {
      const bb = {
        x: 0, y: 0, width: 0, height: 0,
      };
      chardata.push([bb]);
      return;
    }
    const tspans = Array.from(curtext.childNodes).filter((child: Element) => child.tagName === 'tspan') as SVGTextContentElement[];
    const rowNumbers = tspans.length;
    const charHeight = fontSize;
    const lines = textinput.value.split('\x0b');
    let lastRowX = null;

    // No contents
    if (rowNumbers === 0) {
      let bb;
      if (isVertical) {
        bb = {
          x: textbb.x, y: textbb.y + (textbb.height / 2), width: charHeight, height: 0,
        };
      } else {
        bb = {
          x: textbb.x + (textbb.width / 2), y: textbb.y, width: 0, height: charHeight,
        };
      }
      chardata.push([bb]);
      return;
    }

    // When text is vertical, we use the widest char as first row's width
    let firstRowMaxWidth = 0;
    if (this.isVertical && rowNumbers > 0) {
      for (let i = 0; i < tspans[0].textContent.length; i += 1) {
        const start = tspans[0].getStartPositionOfChar(i);
        const end = tspans[0].getEndPositionOfChar(i);
        firstRowMaxWidth = Math.max(firstRowMaxWidth, end.x - start.x);
      }
    }

    for (let i = 0; i < rowNumbers; i += 1) {
      chardata.push([]);
      let start;
      let end;
      const tspanbb = svgedit.utilities.getBBox(tspans[i]);
      if (lines[i] === '') {
        tspans[i].textContent = ' ';
      }

      for (let j = 0; j < tspans[i].textContent.length; j += 1) {
        start = tspans[i].getStartPositionOfChar(j);
        end = tspans[i].getEndPositionOfChar(j);

        if (!svgedit.browser.supportsGoodTextCharPos()) {
          const zoom = svgCanvas.getZoom();
          const offset = svgCanvas.contentW * zoom;
          start.x -= offset;
          end.x -= offset;

          start.x /= zoom;
          end.x /= zoom;
        }
        let width = end.x - start.x;
        if (isVertical) {
          width = i === 0 ? firstRowMaxWidth : lastRowX - start.x;
        }
        chardata[i].push({
          x: start.x,
          y: isVertical ? start.y - charHeight : tspanbb.y,
          width,
          height: charHeight,
        });
      }
      // Add a last bbox for cursor at end of text
      // Because we insert a space for empty line, we don't add last bbox for empty line
      if (lines[i] !== '') {
        let width = 0;
        if (isVertical) {
          width = i === 0 ? firstRowMaxWidth : lastRowX - start.x;
        }
        chardata[i].push({
          x: isVertical ? start.x : end.x,
          y: isVertical ? end.y : tspanbb.y,
          width,
          height: isVertical ? 0 : charHeight,
        });
      } else {
        tspans[i].textContent = '';
      }
      lastRowX = start.x;
    }
  }

  private indexToRowAndIndex(index) {
    let rowIndex = 0;
    if (!this.chardata || this.chardata.length === 0) {
      this.calculateCharbb();
    }
    while (index >= this.chardata[rowIndex].length) {
      // eslint-disable-next-line no-param-reassign
      index -= this.chardata[rowIndex].length;
      rowIndex += 1;
    }
    return { rowIndex, index };
  }

  private setSelection(start, end, skipInput = false) {
    if (start === end) {
      this.setCursor(end);
      return;
    }

    if (!skipInput) {
      this.textinput.setSelectionRange(start, end);
    }

    this.selblock = document.getElementById('text_selectblock');
    if (!this.selblock && document.getElementById('text_cursor')) {
      this.selblock = document.createElementNS(NS.SVG, 'path');
      svgedit.utilities.assignAttributes(this.selblock, {
        id: 'text_selectblock',
        fill: 'green',
        opacity: 0.5,
        style: 'pointer-events:none',
      });
      svgedit.utilities.getElem('selectorParentGroup').appendChild(this.selblock);
    }

    const { rowIndex: startRowIndex, index: startIndex } = this.indexToRowAndIndex(start);
    const { rowIndex: endRowIndex, index: endIndex } = this.indexToRowAndIndex(end);

    const startbb = this.chardata[startRowIndex][startIndex];
    const endbb = this.chardata[endRowIndex][endIndex];

    this.cursor.setAttribute('visibility', 'hidden');
    let points = [];

    const { textbb } = this;
    // drawing selection block
    if (startRowIndex === endRowIndex) {
      if (this.isVertical) {
        points = [
          [startbb.x, startbb.y],
          [endbb.x, endbb.y],
          [endbb.x + endbb.width, endbb.y],
          [startbb.x + startbb.width, startbb.y],
        ];
      } else {
        points = [
          [startbb.x, startbb.y],
          [endbb.x, endbb.y],
          [endbb.x, endbb.y + endbb.height],
          [startbb.x, startbb.y + startbb.height],
        ];
      }
    } else if (this.isVertical) {
      points = [
        [startbb.x + startbb.width, startbb.y],
        [startbb.x + startbb.width, textbb.y + textbb.height],
        [endbb.x + endbb.width, textbb.y + textbb.height],
        [endbb.x + endbb.width, endbb.y], [endbb.x, endbb.y],
        [endbb.x, textbb.y], [startbb.x, textbb.y], [startbb.x, startbb.y],
      ];
    } else {
      points = [
        [startbb.x, startbb.y],
        [textbb.x + textbb.width, startbb.y],
        [textbb.x + textbb.width, endbb.y],
        [endbb.x, endbb.y],
        [endbb.x, endbb.y + endbb.height],
        [textbb.x, endbb.y + endbb.height],
        [textbb.x, startbb.y + startbb.height],
        [startbb.x, startbb.y + startbb.height],
      ];
    }
    points = points.map((p) => this.ptToScreen(p[0], p[1]));
    points = points.map((p) => `${p.x},${p.y}`);
    const dString = `M ${points.join(' L ')} z`;

    if (this.selblock) {
      svgedit.utilities.assignAttributes(this.selblock, {
        d: dString,
        display: 'inline',
      });
    }
  }

  private getIndexFromPoint(mouse_x, mouse_y) {
    // Position cursor here
    const svgroot = document.getElementById('svgroot') as unknown as SVGSVGElement;
    const pt = svgroot.createSVGPoint();
    pt.x = mouse_x;
    pt.y = mouse_y;

    // No content, so return 0
    if (this.chardata.length === 1 && this.chardata[0].length === 1) {
      return 0;
    }
    // Determine if cursor should be on left or right of character
    let charpos = this.curtext.getCharNumAtPosition(pt);
    let rowIndex = 0;
    this.textbb = svgedit.utilities.getBBox(this.curtext);
    // console.log(textbb);
    if (charpos < 0) {
      // Out of text range, look at mouse coords
      const totalLength = this.chardata.reduce((acc, cur) => acc + cur.length, 0);
      charpos = totalLength - 1;
      if (mouse_x <= this.chardata[0][0].x) {
        charpos = 0;
      }
      if (this.textbb.x < mouse_x
          && mouse_x < this.textbb.x + this.textbb.width
          && this.textbb.y < mouse_y
          && mouse_y < this.textbb.y + this.textbb.height) {
        return -1;
      }
    } else {
      let index = charpos;
      while (index >= this.chardata[rowIndex].length - 1) {
        index -= this.chardata[rowIndex].length - 1;
        rowIndex += 1;
      }
      const charbb = this.chardata[rowIndex][index];
      if (this.isVertical) {
        const mid = charbb.y + (charbb.height / 2);
        if (mouse_y > mid) {
          charpos += 1;
        }
      } else {
        const mid = charbb.x + (charbb.width / 2);
        if (mouse_x > mid) {
          charpos += 1;
        }
      }
    }
    // Add rowIndex because charbb = charnum + 1 in every row
    return charpos + rowIndex;
  }

  private setCursorFromPoint(mouse_x, mouse_y) {
    this.setCursor(this.getIndexFromPoint(mouse_x, mouse_y));
  }

  private setEndSelectionFromPoint(x, y, apply = false) {
    const i1 = this.textinput.selectionStart;
    const i2 = this.getIndexFromPoint(x, y);
    if (i2 < 0) {
      return;
    }
    const start = Math.min(i1, i2);
    const end = Math.max(i1, i2);
    this.setSelection(start, end, !apply);
  }

  private moveCursorLastRow = () => {
    const res = this.indexToRowAndIndex(this.textinput.selectionEnd);
    const { index } = res;
    let { rowIndex } = res;
    if (rowIndex === 0) {
      this.textinput.selectionEnd = 0;
      this.textinput.selectionStart = 0;
    } else {
      let newCursorIndex = 0;
      rowIndex -= 1;
      for (let i = 0; i < rowIndex; i += 1) {
        newCursorIndex += this.chardata[i].length;
      }
      newCursorIndex += Math.min(this.chardata[rowIndex].length - 1, index);
      this.textinput.selectionEnd = newCursorIndex;
      this.textinput.selectionStart = newCursorIndex;
    }
  };

  private moveCursorNextRow = () => {
    const res = this.indexToRowAndIndex(this.textinput.selectionEnd);
    const { index } = res;
    let { rowIndex } = res;
    if (rowIndex === this.chardata.length - 1) {
      this.textinput.selectionEnd += this.chardata[rowIndex].length - index - 1;
      this.textinput.selectionStart = this.textinput.selectionEnd;
    } else {
      let newCursorIndex = 0;
      rowIndex += 1;
      for (let i = 0; i < rowIndex; i += 1) {
        newCursorIndex += this.chardata[i].length;
      }
      newCursorIndex += Math.min(this.chardata[rowIndex].length - 1, index);
      this.textinput.selectionEnd = newCursorIndex;
      this.textinput.selectionStart = newCursorIndex;
    }
  };

  private dbClickSelectAll = (evt) => {
    this.setSelection(0, this.curtext.textContent.length);
    $(this).unbind(evt);
  };

  private selectWord(evt) {
    if (!this.allowDbl || !this.curtext) {
      return;
    }

    const rootSctm = (document.getElementById('svgcontent') as unknown as SVGGraphicsElement).getScreenCTM().inverse();
    const zoom = svgCanvas.getZoom();
    const ept = svgedit.math.transformPoint(evt.pageX, evt.pageY, rootSctm);
    const mouseX = ept.x * zoom;
    const mouseY = ept.y * zoom;
    const pt = this.screenToPt(mouseX, mouseY);

    const index = this.getIndexFromPoint(pt.x, pt.y);
    const str = this.curtext.textContent;
    const first = str.substr(0, index).replace(/[a-z0-9]+$/i, '').length;
    const m = str.substr(index).match(/^[a-z0-9]+/i);
    const last = (m ? m[0].length : 0) + index;
    this.setSelection(first, last);

    // Set tripleclick
    $(evt.target).click(this.dbClickSelectAll);
    setTimeout(() => {
      $(evt.target).unbind('click', this.dbClickSelectAll);
    }, 300);
  }

  select(target, x: number, y: number) {
    this.curtext = target;
    this.toEditMode(x, y);
  }

  start(elem) {
    this.curtext = elem;
    this.toEditMode();
  }

  mouseDown(evt, mouseTarget, startX: number, startY: number) {
    const pt = this.screenToPt(startX, startY);
    console.log('textaction mousedown');

    this.textinput.focus();
    this.setCursorFromPoint(pt.x, pt.y);
    this.lastX = startX;
    this.lastY = startY;
    // TODO: Find way to block native selection
  }

  mouseMove(mouseX: number, mouseY: number) {
    const pt = this.screenToPt(mouseX, mouseY);
    this.setEndSelectionFromPoint(pt.x, pt.y);
  }

  mouseUp(evt, mouseX, mouseY) {
    const pt = this.screenToPt(mouseX, mouseY);

    this.setEndSelectionFromPoint(pt.x, pt.y, true);

    // TODO: Find a way to make this work: Use transformed BBox instead of evt.target
    //  if (last_x === mouse_x && last_y === mouse_y
    //  && !svgedit.math.rectsIntersect(transbb, {x: pt.x, y: pt.y, width:0, height:0})) {
    //  textActions.toSelectMode(true);
    //  }
    const { curtext, lastX, lastY } = this;
    if (evt.target !== curtext
      && evt.target.parentNode !== curtext
      && mouseX < lastX + 2
      && mouseX > lastX - 2
      && mouseY < lastY + 2
      && mouseY > lastY - 2
    ) {
      this.toSelectMode(true);
    }
  }

  setCursor(index?: number) {
    let cursorIndex = index;
    const empty = (this.textinput.value === '');
    this.textinput.focus();
    if (cursorIndex === undefined) {
      if (empty) {
        cursorIndex = 0;
      } else if (this.textinput.selectionEnd !== this.textinput.selectionStart) {
        return;
      } else {
        cursorIndex = this.textinput.selectionEnd;
      }
    }

    if (!empty) {
      this.textinput.setSelectionRange(cursorIndex, cursorIndex);
    }
    const { rowIndex, index: columnIndex } = this.indexToRowAndIndex(cursorIndex);
    const charbb = this.chardata[rowIndex][columnIndex];
    if (!charbb) {
      return;
    }

    this.cursor = document.getElementById('text_cursor');

    if (!this.cursor) {
      this.cursor = document.createElementNS(NS.SVG, 'line');
      svgedit.utilities.assignAttributes(this.cursor, {
        id: 'text_cursor',
        stroke: '#333',
        'stroke-width': 1,
      });
      svgedit.utilities.getElem('selectorParentGroup').appendChild(this.cursor);
    }

    if (!this.blinker) {
      this.blinker = setInterval(() => {
        const show = (this.cursor.getAttribute('display') === 'none');
        this.cursor.setAttribute('display', show ? 'inline' : 'none');
      }, 600);
    }
    const startPt = this.ptToScreen(charbb.x, charbb.y);
    const endPt = this.isVertical
      ? this.ptToScreen(charbb.x + charbb.width, charbb.y)
      : this.ptToScreen(charbb.x, charbb.y + charbb.height);
    svgedit.utilities.assignAttributes(this.cursor, {
      x1: startPt.x,
      y1: startPt.y,
      x2: endPt.x,
      y2: endPt.y,
      visibility: 'visible',
      display: 'inline',
    });

    if (this.selblock) {
      this.selblock.setAttribute('d', '');
    }
  }

  hideCursor() {
    clearInterval(this.blinker);
    this.blinker = null;
    document.getElementById('text_cursor')?.remove();
    document.getElementById('text_selectblock')?.remove();
  }

  onUpKey = () => {
    const { isVertical, textinput } = this;
    if (isVertical) {
      textinput.selectionEnd = Math.max(textinput.selectionEnd - 1, 0);
      textinput.selectionStart = textinput.selectionEnd;
    } else {
      this.moveCursorLastRow();
    }
  };

  onDownKey = () => {
    const { isVertical, textinput } = this;
    if (isVertical) {
      textinput.selectionEnd += 1;
      textinput.selectionStart = textinput.selectionEnd;
    } else {
      this.moveCursorNextRow();
    }
  };

  onLeftKey = () => {
    const { isVertical, textinput } = this;
    if (isVertical) {
      this.moveCursorNextRow();
    } else {
      textinput.selectionEnd = Math.max(textinput.selectionEnd - 1, 0);
      textinput.selectionStart = textinput.selectionEnd;
    }
  };

  onRightKey = () => {
    const { isVertical, textinput } = this;
    if (isVertical) {
      this.moveCursorLastRow();
    } else {
      textinput.selectionEnd += 1;
      textinput.selectionStart = textinput.selectionEnd;
    }
  };

  newLine = () => {
    const { textinput } = this;
    const oldSelectionStart = textinput.selectionStart;
    textinput.value = `${textinput.value.substring(0, textinput.selectionStart)}\x0b${textinput.value.substring(textinput.selectionEnd)}`;
    textinput.selectionStart = oldSelectionStart + 1;
    textinput.selectionEnd = oldSelectionStart + 1;
  };

  copyText = async () => {
    const { textinput } = this;
    if (textinput.selectionStart === textinput.selectionEnd) {
      console.log('No selection');
      return;
    }
    const selectedText = textinput.value.substring(
      textinput.selectionStart, textinput.selectionEnd,
    );
    try {
      await navigator.clipboard.writeText(selectedText);
      console.log('Copying to clipboard was successful!', selectedText);
    } catch (err) {
      console.error('Async: Could not copy text: ', err);
    }
  };

  cutText = async () => {
    const { textinput } = this;
    if (textinput.selectionStart === textinput.selectionEnd) {
      console.log('No selection');
      return;
    }
    const selectedText = textinput.value.substring(
      textinput.selectionStart, textinput.selectionEnd,
    );
    const start = textinput.selectionStart;
    try {
      await navigator.clipboard.writeText(selectedText);
      console.log('Copying to clipboard was successful!', selectedText);
    } catch (err) {
      console.error('Async: Could not copy text: ', err);
    }
    textinput.value = (textinput.value.substring(0, textinput.selectionStart)
      + textinput.value.substring(textinput.selectionEnd));
    textinput.selectionStart = start;
    textinput.selectionEnd = start;
  };

  pasteText = async () => {
    const { textinput } = this;
    const clipboardText = await navigator.clipboard.readText();
    const start = textinput.selectionStart;
    textinput.value = textinput.value.substring(0, textinput.selectionStart)
      + clipboardText
      + textinput.value.substring(textinput.selectionEnd);
    textinput.selectionStart = start + clipboardText.length;
    textinput.selectionEnd = start + clipboardText.length;
  };

  selectAll = () => {
    const { textinput } = this;
    textinput.selectionStart = 0;
    textinput.selectionEnd = textinput.value.length;
  };

  toEditMode = (x?: number, y?: number) => {
    const currentMode = svgCanvas.getMode();
    const { curtext } = this;
    this.isEditing = true;
    this.allowDbl = false;
    const isContinuousDrawing = BeamboxPreference.read('continuous_drawing');
    this.previousMode = isContinuousDrawing ? currentMode : 'select';
    svgCanvas.setMode('textedit');
    const selectorManager = svgedit.select.getSelectorManager();
    selectorManager.requestSelector(curtext).showGrips(false);
    // Make selector group accept clicks
    // selectorManager.requestSelector(curtext).selectorRect;
    this.init();
    this.valueBeforeEdit = this.textinput.value;

    $(curtext).css('cursor', 'text');

    if (!x === undefined) {
      this.setCursor();
    } else {
      const pt = this.screenToPt(x, y);
      this.setCursorFromPoint(pt.x, pt.y);
    }

    setTimeout(() => {
      this.allowDbl = true;
    }, 300);
  };

  toSelectMode(shouldSelectElem = false) {
    const { curtext } = this;
    this.isEditing = false;

    svgCanvas.setMode(this.previousMode);
    this.hideCursor();
    $(curtext).css('cursor', 'move');

    if (shouldSelectElem) {
      svgCanvas.clearSelection();
    }
    $(curtext).css('cursor', 'move');
    svgCanvas.call('selected', [curtext]);
    svgCanvas.addToSelection([curtext], true);
    svgedit.recalculate.recalculateDimensions(curtext);
    const batchCmd = new history.BatchCommand('Edit Text');
    if (curtext && !curtext.textContent.length) {
      // No content, so delete
      const cmd = svgCanvas.deleteSelectedElements(true);
      if (this.valueBeforeEdit && cmd && !cmd.isEmpty()) batchCmd.addSubCommand(cmd);
    }
    if (this.valueBeforeEdit && this.valueBeforeEdit !== this.textinput.value) {
      if (curtext) {
        const cmd = new history.ChangeTextCommand(
          curtext, this.valueBeforeEdit, this.textinput.value,
        );
        batchCmd.addSubCommand(cmd);
        svgCanvas.setHasUnsavedChange(true, true);
      }
    }
    if (!batchCmd.isEmpty()) svgCanvas.undoMgr.addCommandToHistory(batchCmd);

    $(this.textinput).trigger('blur');
    this.curtext = null;
  }

  setInputElem(elem) {
    this.textinput = elem;
  }

  setFontSize = (val: number) => {
    this.fontSize = val;
  };

  setIsVertical = (val) => {
    this.isVertical = val;
  };

  clear() {
    const currentMode = svgCanvas ? svgCanvas.getMode() : 'select';
    if (currentMode === 'textedit') {
      this.toSelectMode();
    } else {
      this.isEditing = false;
      this.hideCursor();
    }
  }

  init() {
    if (!this.curtext) {
      return;
    }
    // if (svgedit.browser.supportsEditableText()) {
    //   curtext.select();
    //   return;
    // }

    if (!this.curtext.parentNode) {
      // Result of the ffClone, need to get correct element
      const selectedElements = svgCanvas.getSelectedElems();
      const [elem] = selectedElements;
      this.curtext = elem;
      const selectorManager = svgedit.select.getSelectorManager();
      selectorManager.requestSelector(this.curtext).showGrips(false);
    }
    this.chardata = [];
    const xform = this.curtext.getAttribute('transform');
    this.textbb = svgedit.utilities.getBBox(this.curtext);
    this.matrix = xform ? svgedit.math.getMatrix(this.curtext) : null;

    this.calculateCharbb();

    this.textinput.focus();
    $(this.curtext).unbind('dblclick', this.selectWord).dblclick(this.selectWord);

    this.setSelection(this.textinput.selectionStart, this.textinput.selectionEnd, true);
  }
}

// TextActions Singleton
const textActions = new TextActions();

export default textActions;
