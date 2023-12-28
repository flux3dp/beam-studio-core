import alertCaller from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import awsHelper from 'helpers/aws-helper';
import beamboxPreference from 'app/actions/beambox/beambox-preference';
import dialogCaller from 'app/actions/dialog-caller';
import LayerModule, { modelsWithModules } from 'app/constants/layer-module/layer-modules';
import LayerPanelController from 'app/views/beambox/Right-Panels/contexts/LayerPanelController';
import layerConfigHelper, { DataType, writeDataLayer } from 'helpers/layer/layer-config-helper';
import layerModuleHelper from 'helpers/layer-module/layer-module-helper';
import presprayArea from 'app/actions/beambox/prespray-area';
import progressCaller from 'app/actions/progress-caller';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import i18n from 'helpers/i18n';
import readBitmapFile from 'app/svgedit/operations/import/readBitmapFile';
import svgLaserParser from 'helpers/api/svg-laser-parser';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { ImportType } from 'interfaces/ImportSvg';

import importSvgString from './importSvgString';

const svgWebSocket = svgLaserParser({ type: 'svgeditor' });
let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const getBasename = (path) => {
  const pathMatch = path.match(/(.+)[/\\].+/);
  if (pathMatch[1]) return pathMatch[1];
  return '';
};

const readSVG = (
  blob: Blob | File,
  args: { type: ImportType; targetModule?: LayerModule; layerName?: string }
) =>
  new Promise<SVGUseElement>((resolve) => {
    const { type, targetModule = layerModuleHelper.getDefaultLaserModule(), layerName } = args;
    const reader = new FileReader();
    reader.onloadend = async (e) => {
      let svgString = e.target.result as string;
      if (!['color', 'layer'].includes(type)) {
        svgString = svgString.replace(/<svg[^>]*>/, (svgTagString) =>
          svgTagString.replace(/"([^"]*)pt"/g, (_, valWithoutPt) => `"${valWithoutPt}"`)
        );
      }

      // @ts-expect-error do not know why, so I just keep it
      if (blob.path) {
        svgString = svgString.replace(
          'xlink:href="../',
          // @ts-expect-error do not know why, so I just keep it
          `xlink:href="${getBasename(blob.path)}/../`
        );
        // @ts-expect-error do not know why, so I just keep it
        svgString = svgString.replace('xlink:href="./', `xlink:href="${getBasename(blob.path)}/`);
      }

      svgString = svgString.replace(/<!\[CDATA\[([^\]]*)\]\]>/g, (_, p1) => p1);

      svgString = svgString.replace(/<switch[^>]*>[^<]*<[^/]*\/switch>/g, () => '');
      if (!['color', 'layer'].includes(type)) {
        svgString = svgString.replace(/<image[^>]*>[^<]*<[^/]*\/image>/g, () => '');
        svgString = svgString.replace(/<image[^>]*>/g, () => '');
      }

      const modifiedSvgString = svgString
        .replace(/fill(: ?#(fff(fff)?|FFF(FFF)?));/g, 'fill: none;')
        .replace(/fill= ?"#(fff(fff)?|FFF(FFF))"/g, 'fill="none"');
      const newElement = await importSvgString(modifiedSvgString, { type, layerName, targetModule });

      // Apply style
      svgCanvas.svgToString($('#svgcontent')[0], 0);

      resolve(newElement);
    };
    reader.readAsText(blob);
  });

const importSvg = async (
  file: Blob,
  args: { skipByLayer?: boolean; isFromNounProject?: boolean; isFromAI?: boolean } = {}
): Promise<void> => {
  const { lang } = i18n;
  let targetModule: LayerModule;

  if (modelsWithModules.includes(beamboxPreference.read('workarea'))) {
    targetModule = await dialogCaller.showRadioSelectDialog({
      id: 'import-module',
      title: lang.beambox.popup.select_import_module,
      options: [
        { label: lang.layer_module.general_laser, value: layerModuleHelper.getDefaultLaserModule() },
        { label: lang.layer_module.printing, value: LayerModule.PRINTER },
      ],
    });
  } else targetModule = LayerModule.LASER_10W_DIODE;
  if (!targetModule) return;
  const importTypeOptions = [];
  const { skipByLayer = false, isFromAI = false } = args;
  if (!skipByLayer) {
    importTypeOptions.push({ label: lang.beambox.popup.layer_by_layer, value: 'layer' });
  }
  if (targetModule !== LayerModule.PRINTER)
    importTypeOptions.push({ label: lang.beambox.popup.layer_by_color, value: 'color' });
  importTypeOptions.push({ label: lang.beambox.popup.nolayer, value: 'nolayer' });
  let importType: ImportType;
  if (isFromAI) importType = 'layer';
  else if (importTypeOptions.length === 1) importType = importTypeOptions[0].value;
  else {
    importType = await dialogCaller.showRadioSelectDialog({
      id: 'import-type',
      title: lang.beambox.popup.select_import_method,
      options: importTypeOptions,
    });
  }
  if (!importType) return;

  const result = await svgWebSocket.uploadPlainSVG(file);
  if (result !== 'ok') {
    progressCaller.popById('loading_image');
    switch (result) {
      case 'invalid_path':
        alertCaller.popUpError({
          message: lang.beambox.popup.import_file_contain_invalid_path,
        });
        break;
      default:
        break;
    }
    return;
  }
  let outputs;
  if (importType === 'layer') outputs = await svgWebSocket.divideSVGbyLayer();
  else outputs = await svgWebSocket.divideSVG();
  if (!outputs.res) {
    alertCaller.popUpError({
      buttonType: alertConstants.YES_NO,
      message: `#809 ${outputs.data}\n${lang.beambox.popup.import_file_error_ask_for_upload}`,
      onYes: () => {
        const fileReader = new FileReader();
        fileReader.onloadend = (e) => {
          const svgString = e.target.result;
          awsHelper.uploadToS3(file.name, svgString);
        };
        fileReader.readAsText(file);
      },
    });
    return;
  }
  outputs = outputs.data;
  let newElements: SVGUseElement[] = [];
  let newElement: SVGUseElement;
  if (['color', 'nolayer'].includes(importType)) {
    newElement = await readSVG(outputs.strokes, { type: importType, targetModule });
    newElements.push(newElement);
    newElement = await readSVG(outputs.colors, { type: importType, targetModule });
    newElements.push(newElement);
  } else if (importType === 'layer') {
    const keys = Object.keys(outputs);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (!['bitmap', 'bitmap_offset'].includes(key)) {
        if (key === 'nolayer') {
          // eslint-disable-next-line no-await-in-loop
          newElement = await readSVG(outputs[key], { type: importType, targetModule });
        } else {
          // eslint-disable-next-line no-await-in-loop
          newElement = await readSVG(outputs[key], { type: importType, targetModule, layerName: key });
        }
        newElements.push(newElement);
      }
    }
  } else {
    newElement = await readSVG(file, { type: importType, targetModule });
    newElements.push(newElement);
  }

  if (outputs.bitmap.size > 0) {
    const isPrinting = targetModule === LayerModule.PRINTER;
    if (!isPrinting || !newElements.length) {
      const layerName = lang.beambox.right_panel.layer_panel.layer_bitmap;
      const newLayer = svgCanvas.createLayer(layerName);
      layerConfigHelper.initLayerConfig(layerName);
      if (isPrinting) {
        writeDataLayer(newLayer, DataType.module, LayerModule.PRINTER);
        writeDataLayer(newLayer, DataType.fullColor, '1');
      }
    }
    await readBitmapFile(outputs.bitmap, { offset: outputs.bitmap_offset, gray: !isPrinting });
  }
  presprayArea.togglePresprayArea();
  progressCaller.popById('loading_image');
  newElements = newElements.filter((elem) => elem);
  if (args.isFromNounProject) {
    for (let i = 0; i < newElements.length; i += 1) {
      const elem = newElements[i];
      elem.setAttribute('data-np', '1');
    }
  }
  svgCanvas.selectOnly(newElements);
  LayerPanelController.setSelectedLayers([svgCanvas.getCurrentDrawing().getCurrentLayerName()]);
  if (newElements.length > 1) svgCanvas.tempGroupSelectedElements();
};

export default importSvg;
