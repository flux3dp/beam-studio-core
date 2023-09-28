import history from 'app/svgedit/history';
import i18n from 'helpers/i18n';
import layerConfigHelper, { DataType, writeData } from 'helpers/layer/layer-config-helper';
import NS from 'app/constants/namespaces';
import storage from 'implementations/storage';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { ICommand } from 'interfaces/IHistory';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const rgbToHex = (rgbStr) => {
  const rgb = rgbStr.substring(4).split(',');
  let hex = (
    Math.round(parseFloat(rgb[0]) * 2.55) * 65536 +
    Math.round(parseFloat(rgb[1]) * 2.55) * 256 +
    Math.round(parseFloat(rgb[2]) * 2.55)
  ).toString(16);
  if (hex === 'NaN') {
    hex = '0';
  }
  while (hex.length < 6) {
    hex = `0${hex}`;
  }
  return `#${hex.toUpperCase()}`; // ex: #0A23C5
};

const appendUseElement = (
  symbol: SVGSymbolElement | null,
  type: string,
  layerName: string
): {
  element: SVGUseElement;
  command: ICommand;
} => {
  // create a use element
  if (!symbol) {
    return null;
  }
  const useEl = document.createElementNS(NS.SVG, 'use');
  useEl.id = svgCanvas.getNextId();
  useEl.setAttributeNS(NS.XLINK, 'xlink:href', `#${symbol.id}`);
  // switch currentLayer, and create layer if necessary
  let targetLayerName = layerName;
  if (
    (type === 'layer' && layerName) ||
    (type === 'color' && symbol.getAttribute('data-color')) ||
    type === 'image-trace'
  ) {
    const color = symbol.getAttribute('data-color');
    if (type === 'image-trace') {
      targetLayerName = 'Traced Path';
    } else if (type === 'color') {
      targetLayerName = rgbToHex(color);
    }

    const isLayerExist = svgCanvas.setCurrentLayer(targetLayerName);
    if (!isLayerExist) {
      const layer = svgCanvas.createLayer(targetLayerName);
      layerConfigHelper.initLayerConfig(targetLayerName);
      layer.color = color;

      if (type === 'layer' && targetLayerName) {
        const matchPara = targetLayerName.match(/#([-SP0-9.]*\b)/i);
        if (matchPara) {
          const matchPower = matchPara[1].match(/P([-0-9.]*)/i);
          const matchSpeed = matchPara[1].match(/S([-0-9.]*)/i);
          let parsePower = matchPower ? parseFloat(matchPower[1]) : NaN;
          let parseSpeed = matchSpeed ? parseFloat(matchSpeed[1]) : NaN;
          const laserConst = i18n.lang.beambox.right_panel.laser_panel;
          if (!Number.isNaN(parsePower)) {
            parsePower = Math.round(parsePower * 10) / 10;
            parsePower = Math.max(Math.min(parsePower, laserConst.power.max), laserConst.power.min);
            writeData(targetLayerName, DataType.strength, parsePower);
          }
          if (!Number.isNaN(parseSpeed)) {
            parseSpeed = Math.round(parseSpeed * 10) / 10;
            parseSpeed = Math.max(
              Math.min(parseSpeed, laserConst.laser_speed.max),
              laserConst.laser_speed.min
            );
            writeData(targetLayerName, DataType.speed, parseSpeed);
          }
        }
      } else if (type === 'color') {
        const layerColorConfig = storage.get('layer-color-config') || {};
        const index = layerColorConfig.dict ? layerColorConfig.dict[layerName] : undefined;
        const laserConst = i18n.lang.beambox.right_panel.laser_panel;
        if (index !== undefined) {
          writeData(
            targetLayerName,
            DataType.strength,
            Math.max(
              Math.min(layerColorConfig.array[index].power, laserConst.power.max),
              laserConst.power.min
            )
          );
          writeData(
            targetLayerName,
            DataType.speed,
            Math.max(
              Math.min(layerColorConfig.array[index].speed, laserConst.laser_speed.max),
              laserConst.laser_speed.min
            )
          );
          writeData(targetLayerName, DataType.repeat, layerColorConfig.array[index].repeat);
        }
      }
    }
  }
  if (type === 'text') svgCanvas.setCurrentLayer(layerName);

  svgCanvas.getCurrentDrawing().getCurrentLayer().appendChild(useEl);

  $(useEl).data('symbol', symbol).data('ref', symbol);

  useEl.setAttribute('data-svg', 'true');
  useEl.setAttribute('data-ratiofixed', 'true');

  if (type === 'nolayer') {
    useEl.setAttribute('data-wireframe', 'true');
    const iterationStack = [symbol] as Element[];
    while (iterationStack.length > 0) {
      const node = iterationStack.pop();
      if (node.nodeType === 1 && node.tagName !== 'STYLE') {
        if (!['g', 'tspan'].includes(node.tagName)) {
          node.setAttribute('data-wireframe', 'true');
          node.setAttribute('stroke', '#000');
          node.setAttribute('fill-opacity', '0');
        }
        iterationStack.push(...(Array.from(node.childNodes) as Element[]));
      }
    }
  }

  return { element: useEl as SVGUseElement, command: new history.InsertElementCommand(useEl) };
};

export default appendUseElement;
