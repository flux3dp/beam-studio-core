import alertCaller from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import beamboxPreference from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import constant from 'app/actions/beambox/constant';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import i18n from 'helpers/i18n';
import LayerModule, { modelsWithModules } from 'app/constants/layer-module/layer-modules';
import LayerPanelController from 'app/views/beambox/Right-Panels/contexts/LayerPanelController';
import symbolMaker from 'helpers/symbol-maker';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';
import { toggleFullColorAfterWorkareaChange } from 'helpers/layer/layer-config-helper';

import changeWorkarea from '../changeWorkarea';

let svgCanvas: ISVGCanvas;
let svgEditor;
let svgedit;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgEditor = globalSVG.Editor;
  svgedit = globalSVG.Edit;
});

export const importBvgString = async (str: string): Promise<void> => {
  svgCanvas.clearSelection();
  await svgEditor.loadFromStringAsync(
    str.replace(/STYLE>/g, 'style>').replace(/<STYLE/g, '<style')
  );

  const currentWorkarea: WorkAreaModel = beamboxPreference.read('workarea');
  const currentWorkareaObj = getWorkarea(currentWorkarea);
  // loadFromString will lose data-xform and data-wireframe of `use` so set it back here
  if (typeof str === 'string') {
    const workarea = document.getElementById('workarea');
    const tmp = str.substr(str.indexOf('<use')).split('<use');

    for (let i = 1; i < tmp.length; i += 1) {
      let wireframe: string;
      let xform: string;

      tmp[i] = tmp[i].substring(0, tmp[i].indexOf('/>'));
      let match = tmp[i].match(/id="svg_\d+"/)[0];
      const id = match.substring(match.indexOf('"') + 1, match.lastIndexOf('"'));
      match = tmp[i].match(/data-xform="[^"]*"/)?.[0];
      if (match) xform = match.substring(match.indexOf('"') + 1, match.lastIndexOf('"'));
      match = tmp[i].match(/data-wireframe="[a-z]*"/)?.[0];
      if (match) wireframe = match.substring(match.indexOf('"') + 1, match.lastIndexOf('"'));

      const elem = document.getElementById(id);
      elem?.setAttribute('data-xform', xform);
      elem?.setAttribute('data-wireframe', String(wireframe === 'true'));
    }
    let match = str.match(/data-rotary_mode="[a-zA-Z]+"/);
    if (match) {
      let rotaryMode = match[0].substring(18, match[0].length - 1);
      if (rotaryMode === 'true') rotaryMode = '1';
      const isRotaryModeOn = ['true', '1', '2'].includes(rotaryMode);
      if (constant.addonsSupportList.rotary.includes(currentWorkarea)) {
        beamboxPreference.write('rotary_mode', parseInt(rotaryMode, 10));
        svgCanvas.setRotaryMode(isRotaryModeOn);
      } else {
        beamboxPreference.write('rotary_mode', 0);
        svgCanvas.setRotaryMode(false);
      }
      svgCanvas.runExtensions('updateRotaryAxis');
    }
    match = str.match(/data-engrave_dpi="[a-zA-Z]+"/);
    if (match) {
      const engraveDpi = match[0].substring(18, match[0].length - 1);
      beamboxPreference.write('engrave_dpi', engraveDpi);
    } else {
      beamboxPreference.write('engrave_dpi', 'medium');
    }
    if (constant.addonsSupportList.hybridLaser.includes(currentWorkarea)) {
      match = str.match(/data-en_diode="([a-zA-Z]+)"/);
      if (match && match[1]) {
        if (match[1] === 'true') {
          beamboxPreference.write('enable-diode', true);
        } else {
          beamboxPreference.write('enable-diode', false);
        }
      }
    }
    if (constant.addonsSupportList.autoFocus.includes(currentWorkarea)) {
      match = str.match(/data-en_af="([a-zA-Z]+)"/);
      if (match && match[1]) {
        if (match[1] === 'true') {
          beamboxPreference.write('enable-autofocus', true);
        } else {
          beamboxPreference.write('enable-autofocus', false);
        }
      }
    }
    LayerPanelController.updateLayerPanel();
    match = str.match(/data-zoom="[0-9.]+"/);
    if (match) {
      const zoom = parseFloat(match[0].substring(11, match[0].length - 1));
      svgEditor.zoomChanged(window, { zoomLevel: zoom, staticPoint: { x: 0, y: 0 } });
    }
    match = str.match(/data-left="[-0-9]+"/);
    if (match) {
      let left = parseInt(match[0].substring(11, match[0].length - 1), 10);
      left = Math.round((left + currentWorkareaObj.pxWidth) * svgCanvas.getZoom());
      workarea.scrollLeft = left;
    }
    match = str.match(/data-top="[-0-9]+"/);
    if (match) {
      let top = parseInt(match[0].substring(10, match[0].length - 1), 10);
      top = Math.round(
        (top + (currentWorkareaObj.pxDisplayHeight ?? currentWorkareaObj.pxHeight)) *
          svgCanvas.getZoom()
      );
      workarea.scrollTop = top;
    }
  }
  const { lang } = i18n;
  let newWorkarea = currentWorkarea;
  if (!modelsWithModules.has(currentWorkarea)) {
    const hasPrintingLayer =
      document
        .getElementById('svgcontent')
        ?.querySelectorAll(`g.layer[data-module="${LayerModule.PRINTER}"]`).length > 0;
    if (hasPrintingLayer) {
      const res = await new Promise<boolean>((resolve) => {
        alertCaller.popUp({
          id: 'ask-change-workarea',
          message: lang.layer_module.notification.importedDocumentContainsPrinting,
          buttonType: alertConstants.YES_NO,
          onYes: () => resolve(true),
          onNo: () => resolve(false),
        });
      });
      if (res) {
        changeWorkarea('ado1', { toggleModule: false });
        newWorkarea = 'ado1';
      } else {
        alertCaller.popUp({
          type: alertConstants.SHOW_POPUP_INFO,
          message: lang.layer_module.notification.printingLayersCoverted,
        });
      }
    }
  }
  if (!modelsWithModules.has(newWorkarea)) {
    toggleFullColorAfterWorkareaChange();
  }
  beamboxStore.emitUpdateWorkArea();
  svgedit.utilities.findDefs().remove();
  svgedit.utilities.moveDefsOutfromSvgContent();
  await symbolMaker.reRenderAllImageSymbol();
  LayerPanelController.setSelectedLayers([]);
};

const importBvg = async (file: Blob): Promise<void> => {
  await new Promise<void>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = async (evt) => {
      const str = evt.target.result;
      await importBvgString(str as string);
      resolve();
    };
    reader.readAsText(file);
  });
  svgCanvas.setHasUnsavedChange(false);
};

export default importBvg;
