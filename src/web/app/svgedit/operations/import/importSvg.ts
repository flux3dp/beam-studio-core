import alertCaller from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import awsHelper from 'helpers/aws-helper';
import beamboxPreference from 'app/actions/beambox/beambox-preference';
import dialogCaller from 'app/actions/dialog-caller';
import history from 'app/svgedit/history/history';
import LayerModule, { modelsWithModules } from 'app/constants/layer-module/layer-modules';
import LayerPanelController from 'app/views/beambox/Right-Panels/contexts/LayerPanelController';
import layerConfigHelper, { writeDataLayer } from 'helpers/layer/layer-config-helper';
import layerModuleHelper from 'helpers/layer-module/layer-module-helper';
import presprayArea from 'app/actions/canvas/prespray-area';
import progressCaller from 'app/actions/progress-caller';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import i18n from 'helpers/i18n';
import readBitmapFile from 'app/svgedit/operations/import/readBitmapFile';
import svgLaserParser from 'helpers/api/svg-laser-parser';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IBatchCommand } from 'interfaces/IHistory';
import { ImportType } from 'interfaces/ImportSvg';
import { createLayer, removeDefaultLayerIfEmpty } from 'helpers/layer/layer-helper';

import importSvgString from './importSvgString';

const svgWebSocket = svgLaserParser({ type: 'svgeditor' });
let svgCanvas: ISVGCanvas;

getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const getBasename = (path: string) => path.match(/(.+)[/\\].+/)?.[1] ?? '';

const readSVG = (
  blob: Blob | File,
  {
    type,
    targetModule = layerModuleHelper.getDefaultLaserModule(),
    layerName,
    parentCmd = null,
  }: {
    type: ImportType;
    targetModule?: LayerModule;
    layerName?: string;
    parentCmd?: IBatchCommand;
  }
) =>
  new Promise<SVGUseElement>((resolve) => {
    const parsedLayerName = layerName === 'nolayer' ? undefined : layerName;
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
      const newElement = await importSvgString(modifiedSvgString, {
        type,
        layerName: parsedLayerName,
        targetModule,
        parentCmd,
      });

      // Apply style
      svgCanvas.svgToString($('#svgcontent')[0], 0);

      resolve(newElement);
    };

    reader.readAsText(blob);
  });

const importSvg = async (
  file: Blob,
  {
    skipByLayer = false,
    isFromNounProject,
    isFromAI = false,
  }: { skipByLayer?: boolean; isFromNounProject?: boolean; isFromAI?: boolean } = {}
): Promise<void> => {
  const batchCmd = new history.BatchCommand('Import SVG');
  const { lang } = i18n;
  const isPrinter = modelsWithModules.has(beamboxPreference.read('workarea'));
  const moduleSuffix = isPrinter ? 'printer' : 'laser';
  let targetModule: LayerModule;

  if (isPrinter) {
    targetModule = await dialogCaller.showRadioSelectDialog({
      id: `${moduleSuffix}-import-module`,
      title: lang.beambox.popup.select_import_module,
      options: [
        {
          label: lang.layer_module.general_laser,
          value: layerModuleHelper.getDefaultLaserModule(),
        },
        { label: lang.layer_module.printing, value: LayerModule.PRINTER },
      ],
      defaultValue: beamboxPreference.read(`${moduleSuffix}-import-module`),
    });
  } else {
    targetModule = LayerModule.LASER_10W_DIODE;
  }

  if (!targetModule) {
    return;
  }

  const importTypeOptions = [];

  if (!skipByLayer) {
    importTypeOptions.push({ label: lang.beambox.popup.layer_by_layer, value: 'layer' });
  }

  if (targetModule !== LayerModule.PRINTER) {
    importTypeOptions.push({ label: lang.beambox.popup.layer_by_color, value: 'color' });
  }

  importTypeOptions.push({ label: lang.beambox.popup.nolayer, value: 'nolayer' });

  const typeSuffix = (() => {
    if (targetModule === LayerModule.LASER_10W_DIODE) {
      return moduleSuffix;
    }

    if (targetModule === LayerModule.PRINTER) {
      return `${moduleSuffix}-printer`;
    }

    return `${moduleSuffix}-laser`;
  })();

  const importType: ImportType = await (async () => {
    if (isFromAI) {
      return 'layer';
    }

    if (importTypeOptions.length === 1) {
      return importTypeOptions[0].value;
    }

    return dialogCaller.showRadioSelectDialog({
      id: `${typeSuffix}-import-type`,
      title: lang.beambox.popup.select_import_method,
      options: importTypeOptions,
      defaultValue: beamboxPreference.read(`${typeSuffix}-import-type`),
    });
  })();

  if (!importType) {
    return;
  }

  const result = await svgWebSocket.uploadPlainSVG(file);
  if (result !== 'ok') {
    progressCaller.popById('loading_image');

    if (result === 'invalid_path') {
      alertCaller.popUpError({ message: lang.beambox.popup.import_file_contain_invalid_path });
    }

    return;
  }

  let outputs =
    importType === 'layer' ? await svgWebSocket.divideSVGbyLayer() : await svgWebSocket.divideSVG();

  if (!outputs.res) {
    alertCaller.popUpError({
      buttonType: alertConstants.YES_NO,
      message: `#809 ${outputs.data}\n${lang.beambox.popup.import_file_error_ask_for_upload}`,
      onYes: () => {
        const fileReader = new FileReader();

        fileReader.onloadend = (e) => {
          const svgString = e.target.result;

          // @ts-expect-error the file name is not in the type
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
    newElement = await readSVG(outputs.strokes, {
      type: importType,
      targetModule,
      parentCmd: batchCmd,
    });

    if (newElement) {
      newElements.push(newElement);
    }

    newElement = await readSVG(outputs.colors, {
      type: importType,
      targetModule,
      parentCmd: batchCmd,
    });

    if (newElement) {
      newElements.push(newElement);
    }
  } else if (importType === 'layer') {
    const keys = Object.keys(outputs);

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];

      if (!['bitmap', 'bitmap_offset'].includes(key)) {
        // eslint-disable-next-line no-await-in-loop
        newElement = await readSVG(outputs[key], {
          type: importType,
          targetModule,
          layerName: key,
          parentCmd: batchCmd,
        });

        if (newElement) {
          newElements.push(newElement);
        }
      }
    }
  } else {
    newElement = await readSVG(file, { type: importType, targetModule, parentCmd: batchCmd });

    if (newElement) {
      newElements.push(newElement);
    }
  }

  newElements = newElements.filter(Boolean);

  if (outputs.bitmap.size > 0) {
    const isPrinting = targetModule === LayerModule.PRINTER;

    if (!isPrinting || !newElements.length) {
      const layerName = lang.beambox.right_panel.layer_panel.layer_bitmap;
      const { layer: newLayer, name: newLayerName, cmd } = createLayer(layerName);

      if (cmd && !cmd.isEmpty()) {
        batchCmd.addSubCommand(cmd);
      }

      layerConfigHelper.initLayerConfig(newLayerName);

      if (isPrinting) {
        writeDataLayer(newLayer, 'module', LayerModule.PRINTER);
        writeDataLayer(newLayer, 'fullcolor', true);
      }
    }

    const img = await readBitmapFile(outputs.bitmap, {
      offset: outputs.bitmap_offset,
      gray: !isPrinting,
      parentCmd: batchCmd,
    });

    newElements.push(img);

    const cmd = removeDefaultLayerIfEmpty();

    if (cmd) {
      batchCmd.addSubCommand(cmd);
    }
  }

  presprayArea.togglePresprayArea();
  progressCaller.popById('loading_image');

  if (isFromNounProject) {
    for (let i = 0; i < newElements.length; i += 1) {
      const elem = newElements[i];

      elem.setAttribute('data-np', '1');
    }
  }

  LayerPanelController.setSelectedLayers([svgCanvas.getCurrentDrawing().getCurrentLayerName()]);

  if (newElements.length === 0) {
    svgCanvas.clearSelection();
  } else {
    svgCanvas.selectOnly(newElements);

    if (newElements.length > 1) {
      svgCanvas.tempGroupSelectedElements();
    }
  }

  if (!batchCmd.isEmpty()) {
    svgCanvas.addCommandToHistory(batchCmd);
  }
};

export default importSvg;
