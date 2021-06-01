/* eslint-disable no-console */
/**
 * Converting pdf file to svg file
 * Using pdf2svg binary: https://github.com/dawbarton/pdf2svg
 * binary for mac is built from makefile with dependencies packed by macpack: https://github.com/chearon/macpack
 */
import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import fs from 'implementations/fileSystem';
import i18n from 'helpers/i18n';
import os from 'implementations/os';
import Progress from 'app/actions/progress-caller';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgEditor;
getSVGAsync((globalSVG) => { svgEditor = globalSVG.Editor; });

// eslint-disable-next-line @typescript-eslint/dot-notation
const resourcesRoot = localStorage.getItem('dev') === 'true' ? window.process.cwd() : window.process['resourcesPath'];
const lang = i18n.lang.beambox.popup.pdf2svg;
const appDataPath = fs.getPath('appData');
const beamStudioDataPath = fs.join(appDataPath, 'Beam Studio');
const win32TempFile = fs.join(beamStudioDataPath, 'temp.pdf');

try {
  if (window.os === 'Windows') {
    if (!fs.exists(appDataPath)) {
      os.process.execSync(`mkdir "${appDataPath}"`);
    }
    if (!fs.exists(beamStudioDataPath)) {
      os.process.execSync(`mkdir "${beamStudioDataPath}"`);
    }
  }
} catch (e) {
  console.error('Failed to create pdf beamStudioDataPath');
}

let pdf2svgPath = null;
if (window.os === 'MacOS') {
  pdf2svgPath = fs.join(resourcesRoot, 'utils', 'pdf2svg', 'pdf2svg');
} else if (window.os === 'Windows') {
  pdf2svgPath = fs.join(resourcesRoot, 'utils', 'pdf2svg', 'pdf2svg.exe');
}

const pdf2svg = async (file: File): Promise<void> => {
  if (pdf2svgPath) {
    const outPath = fs.join(resourcesRoot, 'utils', 'pdf2svg', 'out.svg');
    // mac or windows, using packed binary executable
    try {
      let filePath = file.path;
      if (window.os === 'Windows') {
        fs.copyFile(file.path, win32TempFile);
        filePath = win32TempFile;
      }
      const { stderr } = await os.process.execFile(pdf2svgPath, [filePath, outPath]);
      if (!stderr) {
        console.log(outPath);
        const resp = await fetch(outPath);
        const blob = await resp.blob();
        Object.assign(blob, {
          name: `${file.name}.svg`,
          lastModified: file.lastModified,
        });
        svgEditor.importSvg(blob, {
          skipVersionWarning: true,
          skipByLayer: true,
        });
      } else {
        throw stderr;
      }
    } catch (e) {
      console.log('Fail to convert pdf 2 svg', e);
      const message = `${lang.error_when_converting_pdf}\n${e.message}`;
      Progress.popById('loading_image');
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_ERROR,
        message,
      });
    }
  } else {
    // Linux
    const outPath = fs.join('/tmp', 'out.svg');
    try {
      await os.process.exec('type pdf2svg');
    } catch (e) {
      console.log(e);
      const message = lang.error_pdf2svg_not_found;
      Progress.popById('loading_image');
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_ERROR,
        message,
      });
      return;
    }
    try {
      const { stdout, stderr } = await os.process.exec(`pdf2svg "${file.path}" "${outPath}"`);
      console.log('out', stdout, 'err', stderr);
      if (!stderr) {
        const resp = await fetch(outPath);
        const blob = await resp.blob();
        Object.assign(blob, {
          name: `${file.name}.svg`,
          lastModified: file.lastModified,
        });
        svgEditor.importSvg(blob, {
          skipVersionWarning: true,
          skipByLayer: true,
        });
      } else {
        throw stderr;
      }
    } catch (e) {
      console.log('Fail to convert pdf 2 svg', e.message);
      const message = `${lang.error_when_converting_pdf}\n${e.message}`;
      Progress.popById('loading_image');
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_ERROR,
        message,
      });
    }
  }
};

export default {
  pdf2svg,
};
