import beamboxPreference from 'app/actions/beambox/beambox-preference';
import clipboard from 'app/svgedit/operations/clipboard';
import constant from 'app/actions/beambox/constant';
import findDefs from 'app/svgedit/utils/findDef';
import history from 'app/svgedit/history/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import i18n from 'helpers/i18n';
import LayerPanelController from 'app/views/beambox/Right-Panels/contexts/LayerPanelController';
import layerConfigHelper, {
  DataType,
  initLayerConfig,
  writeDataLayer,
} from 'helpers/layer/layer-config-helper';
import NS from 'app/constants/namespaces';
import progressCaller from 'app/actions/progress-caller';
import updateElementColor from 'helpers/color/updateElementColor';
import workareaManager from 'app/svgedit/workarea';
import { changeBeamboxPreferenceValue } from 'app/svgedit/history/beamboxPreferenceCommand';
import { createLayer, getLayerName } from 'helpers/layer/layer-helper';
import { deleteUseRef } from 'app/svgedit/operations/delete';
import { GuideLine } from 'interfaces/IPassThrough';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { getWorkarea } from 'app/constants/workarea-constants';
import { IBatchCommand } from 'interfaces/IHistory';

import canvasManager from './canvasManager';

let svgCanvas: ISVGCanvas;
let svgedit;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgedit = globalSVG.Edit;
});

const sliceWorkarea = async (
  sliceHeight: number,
  opt: { refLayers?: boolean; guideLine?: GuideLine; parentCmd?: IBatchCommand } = {}
): Promise<void> => {
  const progressId = 'slice-workarea';
  const lang = i18n.lang.pass_through;
  progressCaller.openNonstopProgress({ id: progressId, message: lang.exporting });
  const { refLayers, parentCmd, guideLine = { show: false, x: 0, width: 40 } } = opt;
  const { dpmm } = constant;
  const workarea = beamboxPreference.read('workarea');
  const workareaObj = getWorkarea(workarea);
  const batchCmd = new history.BatchCommand('Slice Workarea');
  const currentDrawing = svgCanvas.getCurrentDrawing();
  const sliceHeightPx = sliceHeight * dpmm;
  const defs = findDefs();
  const { width, height: workareaHeight } = workareaManager;
  const topPadding = (workareaObj.height - sliceHeight) / 2;
  const topPaddingPx = topPadding * dpmm;
  const refImageBase64s = refLayers ? await canvasManager.generateRefImage(topPaddingPx) : null;

  const generateGuideLine = () => {
    if (guideLine.show) {
      const { x, width: lineWidth } = guideLine;
      const {
        layer: newLayer,
        name,
        cmd,
      } = createLayer(lang.guide_line, {
        isSubCmd: true,
        hexCode: '#9745ff',
      });
      initLayerConfig(name);
      const lineStart = document.createElementNS(NS.SVG, 'line') as SVGLineElement;
      lineStart.setAttribute('x1', (x * dpmm).toString());
      lineStart.setAttribute('y1', topPaddingPx.toString());
      lineStart.setAttribute('x2', ((x + lineWidth) * dpmm).toString());
      lineStart.setAttribute('y2', topPaddingPx.toString());
      lineStart.setAttribute('stroke', '#9745ff');
      lineStart.setAttribute('fill', 'none');
      lineStart.setAttribute('vector-effect', 'non-scaling-stroke');
      lineStart.id = svgCanvas.getNextId();
      newLayer.appendChild(lineStart);
      const lineEnd = lineStart.cloneNode(true) as SVGLineElement;
      lineEnd.setAttribute('y1', (topPaddingPx + sliceHeightPx).toString());
      lineEnd.setAttribute('y2', (topPaddingPx + sliceHeightPx).toString());
      lineEnd.id = svgCanvas.getNextId();
      newLayer.appendChild(lineEnd);
      updateElementColor(lineStart);
      updateElementColor(lineEnd);
      if (cmd && !cmd.isEmpty()) batchCmd.addSubCommand(cmd);
    }
  };

  const clonedLayers = Array.from(document.querySelectorAll('#svgcontent > .layer')).map(
    (layer) => {
      const name = getLayerName(layer);
      const clonedLayer = layer.cloneNode(true) as SVGGElement;
      clonedLayer.querySelectorAll('title').forEach((el) => el.remove());
      clonedLayer.querySelector('filter')?.remove();
      clonedLayer.id = `passThroughRef_${Date.now()}`;
      defs.appendChild(clonedLayer);
      const bbox = clonedLayer.getBBox();
      if (bbox.height + bbox.y > workareaHeight) bbox.height = workareaHeight - bbox.y;
      if (bbox.y < 0) {
        bbox.height += bbox.y;
        bbox.y = 0;
      }
      clonedLayer.remove();
      return { name, bbox, element: clonedLayer, origLayer: layer, hasNewLayer: false };
    }
  );

  for (let i = Math.ceil(workareaHeight / sliceHeightPx) - 1; i >= 0; i -= 1) {
    const start = i * sliceHeightPx;
    const end = Math.min((i + 1) * sliceHeightPx, workareaHeight);
    let anyLayer = false;
    for (let j = 0; j < clonedLayers.length; j += 1) {
      const { name, bbox, element } = clonedLayers[j];
      const { y, width: bboxW, height } = bbox;
      // eslint-disable-next-line no-continue
      if (bboxW === 0 || height === 0 || y + height < start || y > end) continue;
      anyLayer = true;
      clonedLayers[j].hasNewLayer = true;

      const {
        layer,
        name: newLayerName,
        cmd,
      } = createLayer(`${name} - ${i + 1}`, {
        isSubCmd: true,
      });
      if (!cmd.isEmpty()) batchCmd.addSubCommand(cmd);
      layerConfigHelper.cloneLayerConfig(newLayerName, name);
      layer.setAttribute('data-lock', 'true');
      if (i > 0) layer.setAttribute('display', 'none');

      const container = document.createElementNS(NS.SVG, 'g') as SVGGElement;
      container.setAttribute('transform', `translate(0, ${topPaddingPx - start})`);
      container.innerHTML = element.innerHTML;
      container.id = svgCanvas.getNextId();
      container.setAttribute('data-pass-through', '1');
      layer.appendChild(container);
      svgedit.recalculate.recalculateDimensions(container);
      const descendants = Array.from(container.querySelectorAll('*'));
      const refMap = {}; // id changes
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      descendants.forEach(async (el) => {
        if (el.id) {
          const oldId = el.id;
          el.setAttribute('id', svgCanvas.getNextId());
          if (el.tagName.toLowerCase() === 'clippath') {
            refMap[oldId] = el.id;
          }
        }
        if (el.getAttribute('clip-path')) {
          // please find id using regex
          const clipPathId = el.getAttribute('clip-path').match(/url\(#(.*)\)/)?.[1];
          if (clipPathId && refMap[clipPathId]) el.setAttribute('clip-path', `url(#${refMap[clipPathId]})`);
        };
        if (el.tagName === 'use') {
          clipboard.addRefToClipboard(el as SVGUseElement);
          await clipboard.pasteRef(el as SVGUseElement, { parentCmd: batchCmd });
          updateElementColor(el as SVGUseElement);
        }
      });
      const clipPath = document.createElementNS(NS.SVG, 'clipPath') as SVGClipPathElement;
      const clipRect = document.createElementNS(NS.SVG, 'rect') as SVGRectElement;
      clipPath.appendChild(clipRect);
      clipRect.setAttribute('x', '0');
      clipRect.setAttribute('y', topPaddingPx.toString());
      clipRect.setAttribute('width', width.toString());
      clipRect.setAttribute('height', (end - start).toString());
      clipPath.id = svgCanvas.getNextId();

      // wrap container with clipPath
      const g = document.createElementNS(NS.SVG, 'g') as SVGGElement;
      g.id = svgCanvas.getNextId();
      g.setAttribute('clip-path', `url(#${clipPath.id})`);
      while (container.firstChild) g.appendChild(container.firstChild);
      container.appendChild(g);
      container.insertBefore(clipPath, container.firstChild);
    }
    if (anyLayer && refImageBase64s?.[i]) {
      const { layer, name, cmd } = createLayer(`${lang.ref_layer} ${i + 1}`, {
        isSubCmd: true,
      });
      layer.setAttribute('data-lock', 'true');
      if (i > 0) layer.setAttribute('display', 'none');
      if (!cmd.isEmpty()) batchCmd.addSubCommand(cmd);
      layerConfigHelper.initLayerConfig(name);
      writeDataLayer(layer, DataType.fullColor, '1');
      writeDataLayer(layer, DataType.ref, '1');
      writeDataLayer(layer, DataType.repeat, 0);
      const image = document.createElementNS(NS.SVG, 'image') as SVGImageElement;
      image.setAttribute('x', '0');
      image.setAttribute('y', '0');
      image.setAttribute('width', width.toString());
      image.setAttribute('height', topPaddingPx.toString());
      image.setAttribute('href', refImageBase64s[i]);
      layer.appendChild(image);
    }
  }
  clonedLayers.forEach(({ hasNewLayer, origLayer }) => {
    if (hasNewLayer) {
      const { nextSibling } = origLayer;
      const parent = origLayer.parentNode;
      origLayer.remove();
      const uses = origLayer.querySelectorAll('use');
      uses.forEach((use) => deleteUseRef(use, { parentCmd: batchCmd }));
      batchCmd.addSubCommand(new history.RemoveElementCommand(origLayer, nextSibling, parent));
    }
  });
  generateGuideLine();
  changeBeamboxPreferenceValue('pass-through', false, { parentCmd: batchCmd });
  const onAfter = () => {
    currentDrawing.identifyLayers();
    LayerPanelController.setSelectedLayers([]);
    workareaManager.setWorkarea(workarea);
    workareaManager.resetView();
  };
  onAfter();
  if (parentCmd) parentCmd.addSubCommand(batchCmd);
  else svgCanvas.undoMgr.addCommandToHistory(batchCmd);
  batchCmd.onAfter = onAfter;
  progressCaller.popById(progressId);
};

export default sliceWorkarea;
