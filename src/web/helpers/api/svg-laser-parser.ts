/* eslint-disable no-continue */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/**
 * API svg laser parser
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-svg-laser-parser
 */
import Alert from 'app/actions/alert-caller';
import AlertConfig from 'helpers/api/alert-config';
import AlertConstants from 'app/constants/alert-constants';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import curveEngravingModeController from 'app/actions/canvas/curveEngravingModeController';
import fs from 'implementations/fileSystem';
import i18n from 'helpers/i18n';
import isDev from 'helpers/is-dev';
import moduleOffsets from 'app/constants/layer-module/module-offsets';
import Progress from 'app/actions/progress-caller';
import presprayArea from 'app/actions/canvas/prespray-area';
import storage from 'implementations/storage';
import Websocket from 'helpers/websocket';
import rotaryAxis from 'app/actions/canvas/rotary-axis';
import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (parserOpts: { type?: string; onFatal?: (data) => void }) => {
  parserOpts = parserOpts || {};

  const apiMethod = {
    svgeditor: 'svgeditor-laser-parser',
  }[parserOpts.type || 'svgeditor'];
  const events: { onMessage: (data?) => void; onError: (data?) => void } = {
    onMessage: () => {},
    onError: () => {},
  };
  const ws = Websocket({
    method: apiMethod,
    onMessage: (data) => events.onMessage(data),

    onError: (data) => events.onError(data),
    onFatal: (data) => {
      if (parserOpts.onFatal) parserOpts.onFatal(data);
      else events.onError(data);
    },
  });
  let lastOrder = '';

  const setParameter = (key: string, value: number | string) =>
    new Promise<null>((resolve, reject) => {
      events.onMessage = (data) => {
        console.log(data);
        if (data.status === 'ok') {
          resolve(null);
        } else if (data.status === 'error') {
          console.error('Failed to set parameter', key, value, data);
          resolve(null);
        }
      };
      events.onError = (data) => {
        reject(data);
      };
      ws.send(['set_params', key, value].join(' '));
    });

  return {
    async getTaskCode(names, opts) {
      opts = opts || {};
      opts.onProgressing = opts.onProgressing || (() => {});
      opts.onFinished = opts.onFinished || (() => {});
      lastOrder = 'getTaskCode';

      const args = ['go', names.join(' '), opts.fileMode || '-f'];
      const blobs = [];
      let duration;
      let totalLength = 0;
      let blob;

      const isDevMode = isDev();
      const paddingAccel = BeamboxPreference.read('padding_accel');
      // Not real acceleration, just for calculating padding distance
      const { model }: { model: WorkAreaModel } = opts;
      const { minSpeed: modelMinSpeed, rotary } = getWorkarea(model);
      if (model === 'fhexa1') {
        args.push('-hexa');
        if (!isDevMode || !paddingAccel) args.push('-acc', '7500');
      } else if (model === 'fbb1p') args.push('-pro');
      else if (model === 'fbm1') args.push('-beamo');
      else if (model === 'ado1') {
        args.push('-ado1');
        if (!isDevMode || !paddingAccel) args.push('-acc', opts.paddingAccel?.toString() || '3200');
      }
      if (isDevMode && paddingAccel) args.push('-acc', paddingAccel);
      if (opts.codeType === 'gcode') args.push('-gc');

      const rotaryMode = BeamboxPreference.read('rotary_mode');
      if (rotaryMode) {
        args.push('-spin');
        const rotaryPos = rotaryAxis.getPosition();
        args.push(rotaryPos);
        if (rotaryMode !== 1 && rotary.includes(rotaryMode)) {
          args.push('-rotary-y-ratio');
          args.push(Math.round(constant.rotaryYRatio[rotaryMode] * 10 ** 6) / 10 ** 6);
        }
      }

      if (constant.adorModels.includes(model)) {
        const { x, y, w, h } = presprayArea.getPosition(true);
        const workareaWidth = getWorkarea(model).width;
        args.push('-prespray');
        args.push(rotaryMode ? `${workareaWidth - w},27,${w},${h}` :`${x},${y},${w},${h}`);
        if (!isDevMode || BeamboxPreference.read('multipass-compensation') !== false) args.push('-mpc');
        if (!isDevMode || BeamboxPreference.read('one-way-printing') !== false) args.push('-owp');
      }

      if (
        i18n.getActiveLang() === 'zh-cn' &&
        BeamboxPreference.read('blade_radius') &&
        BeamboxPreference.read('blade_radius') > 0
      ) {
        args.push('-blade');
        args.push(BeamboxPreference.read('blade_radius'));
        if (BeamboxPreference.read('blade_precut')) {
          args.push('-precut');
          args.push(
            `${BeamboxPreference.read('precut_x') || 0},${BeamboxPreference.read('precut_y') || 0}`
          );
        }
      }

      if (opts.enableAutoFocus) {
        args.push('-af');
        if (BeamboxPreference.read('af-offset')) args.push(BeamboxPreference.read('af-offset'));
      }
      if (opts.enableDiode) {
        args.push('-diode');
        args.push(
          `${BeamboxPreference.read('diode_offset_x') || 0},${
            BeamboxPreference.read('diode_offset_y') || 0
          }`
        );
        if (BeamboxPreference.read('diode-one-way-engraving') !== false) {
          args.push('-diode-owe');
        }
      }
      const isBorderLess =
        BeamboxPreference.read('borderless') &&
        constant.addonsSupportList.openBottom.includes(model);
      if (BeamboxPreference.read('enable_mask') || isBorderLess) {
        args.push('-mask');
        const clipRect = [0, 0, 0, 0]; // top right bottom left
        if (isBorderLess) clipRect[1] = constant.borderless.safeDistance.X;
        args.push(clipRect.join(','));
      }
      if (opts.shouldUseFastGradient) args.push('-fg');
      if (opts.shouldMockFastGradient) args.push('-mfg');
      if (opts.vectorSpeedConstraint) args.push('-vsc');
      if (modelMinSpeed < 3) args.push(`-min-speed ${modelMinSpeed}`);
      else if (BeamboxPreference.read('enable-low-speed')) args.push('-min-speed 1');
      if (BeamboxPreference.read('reverse-engraving')) args.push('-rev');
      if (BeamboxPreference.read('enable-custom-backlash')) args.push('-cbl');
      let printingTopPadding: number;
      let printingBotPadding: number;
      if (rotaryMode && constant.adorModels.includes(model)) {
        printingTopPadding = 43;
        printingBotPadding = 43;
      }
      if (isDevMode) {
        let storageValue = localStorage.getItem('min_engraving_padding');
        if (storageValue) {
          args.push('-mep');
          args.push(storageValue);
        }
        storageValue = localStorage.getItem('min_printing_padding');
        if (storageValue) {
          args.push('-mpp');
          args.push(storageValue);
        }
        storageValue = localStorage.getItem('printing_top_padding');
        if (storageValue && !Number.isNaN(Number(storageValue))) {
          printingTopPadding = Number(storageValue);
        }
        storageValue = localStorage.getItem('printing_bot_padding');
        if (storageValue && !Number.isNaN(Number(storageValue))) {
          printingBotPadding = Number(storageValue);
        }
        storageValue = localStorage.getItem('nozzle_votage');
        if (storageValue) {
          args.push('-nv');
          args.push(storageValue);
        }
        storageValue = localStorage.getItem('nozzle_pulse_width');
        if (storageValue) {
          args.push('-npw');
          args.push(storageValue);
        }
        storageValue = localStorage.getItem('travel_speed');
        if (storageValue && !Number.isNaN(Number(storageValue))) {
          args.push('-ts');
          args.push(Number(storageValue));
        }
        storageValue = localStorage.getItem('path_travel_speed');
        if (storageValue && !Number.isNaN(Number(storageValue))) {
          args.push('-pts');
          args.push(Number(storageValue));
        }
        storageValue = localStorage.getItem('a_travel_speed');
        if (storageValue && !Number.isNaN(Number(storageValue))) {
          args.push('-ats');
          args.push(Number(storageValue));
        }
      }
      if (printingTopPadding !== undefined) {
        args.push('-ptp');
        args.push(printingTopPadding);
      }
      if (printingBotPadding !== undefined) {
        args.push('-pbp');
        args.push(printingBotPadding);
      }
      if (model === 'ado1') {
        const offsets = { ...moduleOffsets, ...BeamboxPreference.read('module-offsets') };
        args.push('-mof');
        args.push(JSON.stringify(offsets));
      }

      const loopCompensation = Number(storage.get('loop_compensation') || '0');
      if (loopCompensation > 0) await setParameter('loop_compensation', loopCompensation);

      if (curveEngravingModeController.hasArea()) {
        const data = {
          bbox: curveEngravingModeController.data.bbox,
          points: curveEngravingModeController.data.points.flat().filter((p) => p[2] !== null),
          gap: curveEngravingModeController.data.gap,
        };
        const dataStr = JSON.stringify(data, (key, val) => {
          if (typeof val === 'number') {
            return Math.round(val * 1e3) / 1e3;
          }
          return val;
        });
        await setParameter('curve_engraving', dataStr);
      }
      events.onMessage = (data) => {
        if (data.status === 'computing') {
          opts.onProgressing(data);
        } else if (data.status === 'complete') {
          totalLength = data.length;
          duration = Math.floor(data.time) + 1;
        } else if (data instanceof Blob === true) {
          blobs.push(data);
          blob = new Blob(blobs);

          if (totalLength === blob.size) {
            opts.onFinished(blob, args[2], duration);
          }
        } else if (data.status === 'Error') {
          opts.onError(data.message);
        }
      };
      ws.send(args.join(' '));
    },
    gcodeToFcode(
      taskData: { arrayBuffer: ArrayBuffer; thumbnailSize: number; size: number },
      opts
    ) {
      const $deferred = $.Deferred();
      const warningCollection = [];
      const args = ['g2f'];
      const blobs = [];
      let duration;
      let totalLength = 0;
      let blob;

      events.onMessage = (data) => {
        if (data instanceof Blob === true) {
          blobs.push(data);
          blob = new Blob(blobs);

          if (totalLength === blob.size) {
            opts.onFinished(blob, args[2], duration);
          }
        } else {
          switch (data.status) {
            case 'continue':
              ws.send(taskData.arrayBuffer);
              break;
            case 'ok':
              $deferred.resolve('ok');
              break;
            case 'warning':
              warningCollection.push(data.message);
              break;
            case 'computing':
              opts.onProgressing(data);
              break;
            case 'complete':
              totalLength = data.length;
              duration = Math.floor(data.time) + 1;
              break;
            case 'Error':
              opts.onError(data.message);
              break;
            default:
              break;
          }
        }
      };
      events.onError = (data) => {
        console.error(data);
      };

      ws.send(['g2f', taskData.size, taskData.thumbnailSize].join(' '));

      return $deferred.promise();
    },
    divideSVG(opts?) {
      const $deferred = $.Deferred();
      opts = opts || {};
      opts.onProgressing = opts.onProgressing || (() => {});
      opts.onFinished = opts.onFinished || (() => {});
      lastOrder = 'divideSVG';

      const args = ['divide_svg'];
      const finalBlobs: { [key: string]: Blob | number } = {};
      let blobs = [];
      let currentLength = 0;
      let currentName = '';

      if (opts.scale) {
        args.push('-s');
        args.push(String(Math.floor(opts.scale * 100) / 100));
      }

      events.onMessage = (data) => {
        if (data.name) {
          currentName = data.name;
          currentLength = data.length;
          if (currentName === 'bitmap') {
            finalBlobs.bitmap_offset = data.offset;
          }
        } else if (data instanceof Blob) {
          blobs.push(data);
          const blob = new Blob(blobs);

          if (currentLength === blob.size) {
            blobs = [];
            finalBlobs[currentName] = blob;
          }
        } else if (data.status === 'ok') {
          $deferred.resolve({ res: true, data: finalBlobs });
        } else if (data.status === 'Error') {
          Progress.popById('loading_image');
          $deferred.resolve({ res: false, data: data.message });
        }
      };

      ws.send(args.join(' '));

      if (opts.timeout && opts.timeout > 0) {
        setTimeout(() => {
          $deferred.resolve({ res: false, data: 'timeout' });
        }, opts.timeout);
      }
      return $deferred.promise();
    },
    divideSVGbyLayer(opts?) {
      const $deferred = $.Deferred();
      opts = opts || {};
      opts.onProgressing = opts.onProgressing || (() => {});
      opts.onFinished = opts.onFinished || (() => {});
      lastOrder = 'divideSVGbyLayer';

      const args = ['divide_svg_by_layer'];
      const finalBlobs: { [key: string]: Blob | number } = {};
      let blobs = [];
      let currentLength = 0;
      let currentName = '';

      if (opts.scale) {
        args.push('-s');
        args.push(String(Math.floor(opts.scale * 100) / 100));
      }

      events.onMessage = (data) => {
        if (data.name) {
          currentName = data.name;
          currentLength = data.length;
          if (currentName === 'bitmap') {
            finalBlobs.bitmap_offset = data.offset;
          }
        } else if (data instanceof Blob) {
          blobs.push(data);
          const blob = new Blob(blobs);

          if (currentLength === blob.size) {
            blobs = [];
            finalBlobs[currentName] = blob;
          }
        } else if (data.status === 'ok') {
          $deferred.resolve({ res: true, data: finalBlobs });
        } else if (data.status === 'Error') {
          Progress.popById('loading_image');
          $deferred.resolve({ res: false, data: data.message });
        }
      };

      ws.send(args.join(' '));
      return $deferred.promise();
    },
    uploadPlainSVG(file) {
      const $deferred = $.Deferred();
      const warningCollection = [];

      events.onMessage = (data) => {
        switch (data.status) {
          case 'continue':
            ws.send(file);
            break;
          case 'ok':
            $deferred.resolve('ok');
            break;
          case 'warning':
            warningCollection.push(data.message);
            break;
          default:
            break;
        }
      };
      events.onError = (data) => {
        console.error(data);
      };

      const getBasename = (p?: string) => {
        if (!p) return '';
        const pathMatch = p.match(/(.+)[/\\].+/);
        if (pathMatch[1]) return pathMatch[1];
        return '';
      };
      const reader = new FileReader();
      reader.onloadend = (e) => {
        let svgString = e.target.result as string;
        const matchImages = svgString.match(/<image[^>]+>/g);
        let allImageValid = true;
        let hasPath = false;
        if (matchImages) {
          const basename = getBasename(file.path);
          for (let i = 0; i < matchImages.length; i += 1) {
            const hrefMatch = matchImages[i].match(/xlink:href="[^"]+"/);
            if (!hrefMatch) {
              continue;
            }
            const hrefRaw = hrefMatch[0];
            const hrefCleaned = hrefRaw.substring(12, hrefRaw.length - 1);
            if (hrefCleaned.startsWith('data:')) {
              continue;
            }
            let newPath = hrefCleaned
              .replace(/&apos;/g, "'")
              .replace(/&quot;/g, '"')
              .replace(/&gt;/g, '>')
              .replace(/&lt;/g, '<')
              .replace(/&amp;/g, '&');
            // Test Abosulte Path
            hasPath = true;
            if (fs.exists(newPath)) {
              continue;
            }
            // Test Relative Path
            if (file.path) {
              newPath = fs.join(basename, newPath);
              if (fs.exists(newPath)) {
                newPath = newPath
                  .replace(/&/g, '&amp;')
                  .replace(/'/g, '&apos;')
                  .replace(/"/g, '&quot;')
                  .replace(/>/g, '&gt;')
                  .replace(/</g, '&lt;');
                svgString = svgString.replace(
                  `xlink:href="${hrefCleaned}"`,
                  `xlink:href="${newPath}"`
                );
                continue;
              }
            }
            allImageValid = false;
            $deferred.resolve('invalid_path');
          }
        }
        if (allImageValid && hasPath && !AlertConfig.read('skip_image_path_warning')) {
          Alert.popUp({
            type: AlertConstants.SHOW_POPUP_WARNING,
            message: i18n.lang.beambox.popup.svg_image_path_waring,
            checkbox: {
              text: i18n.lang.beambox.popup.dont_show_again,
              callbacks: () => AlertConfig.write('skip_image_path_warning', true),
            },
          });
        }
        if (allImageValid) {
          file = new Blob([svgString], {
            type: 'text/plain',
          });

          ws.send(['upload_plain_svg', 'plain-svg', file.size].join(' '));
        }
      };
      reader.readAsText(file);

      return $deferred.promise();
    },
    uploadPlainTextSVG(textElement: Element, bbox) {
      const $deferred = $.Deferred();
      const warningCollection = [];

      events.onError = (data) => {
        console.error(data);
      };

      let textString = textElement.outerHTML;
      if (textElement.getAttribute('data-verti') === 'true') {
        textString = textString.replace(/letter-spacing="[^"]+"/, '');
      }
      let defs = '';
      for (let i = 0; i < textElement.childNodes.length; i += 1) {
        const childNode = textElement.childNodes[i] as Element;
        if (childNode.nodeName === 'textPath') {
          const href = childNode.getAttribute('href');
          const hrefElem = document.querySelector(href);
          if (hrefElem) {
            defs += hrefElem.outerHTML;
          }
        }
      }
      const { x, y, width, height } = bbox;
      const svgString = `<svg viewBox="${x} ${y} ${width} ${height}"><defs>${defs}</defs>${textString}</svg>`;
      console.log(svgString);
      const file = new Blob([svgString], {
        type: 'text/plain',
      });
      events.onMessage = (data) => {
        switch (data.status) {
          case 'continue':
            ws.send(file);
            break;
          case 'ok':
            $deferred.resolve('ok');
            break;
          case 'warning':
            warningCollection.push(data.message);
            break;
          default:
            break;
        }
      };
      ws.send(['upload_plain_svg', 'text-svg', file.size].join(' '));
      return $deferred.promise();
    },

    uploadToSvgeditorAPI(files, opts) {
      const $deferred = $.Deferred();
      let currIndex = 0;
      const orderName = 'svgeditor_upload';
      const setMessages = (file, isBroken, warningCollection) => {
        file.status = warningCollection.length > 0 ? 'bad' : 'good';
        file.messages = warningCollection;
        file.isBroken = isBroken;
        return file;
      };

      const sendFile = (file) => {
        const warningCollection = [];
        const CHUNK_SIZE = 128 * 1024; // 128KB
        const chunkCounts = Math.ceil(file.size / CHUNK_SIZE);

        events.onMessage = (data) => {
          switch (data.status) {
            case 'computing':
              opts.onProgressing(data);
              break;
            case 'continue':
              for (let i = 0; i < chunkCounts; i += 1) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(file.size, start + CHUNK_SIZE);
                const chunk = file.data.slice(start, end);
                ws.send(chunk);
              }
              break;
            case 'ok':
              opts.onFinished();
              $deferred.resolve();
              break;
            case 'warning':
              warningCollection.push(data.message);
              break;
            case 'Error':
              opts.onError(data.message);
              $deferred.resolve();
              break;
            default:
              console.warn('Unknown Status:', data.status);
          }
        };

        events.onError = (data) => {
          warningCollection.push(data.message);
          opts.onError(data.message || data.symbol?.join('_') || String(data) || 'Unknown Error');
          $deferred.resolve();
        };
        const args = [orderName, file.uploadName, file.size, file.thumbnailSize];

        const rotaryMode = BeamboxPreference.read('rotary_mode');
        const extendRotaryWorkarea = BeamboxPreference.read('extend-rotary-workarea');
        if (rotaryMode && extendRotaryWorkarea) args.push('-spin');

        if (opts) {
          if (opts.model === 'fhexa1') args.push('-hexa');
          else if (opts.model === 'fbb1p') args.push('-pro');
          else if (opts.model === 'fbm1') args.push('-beamo');
          else if (opts.model === 'ado1') args.push('-ado1');

          if (typeof opts.engraveDpi === 'number') {
            args.push(`-dpi ${opts.engraveDpi}`);
          } else {
            switch (opts.engraveDpi) {
              case 'low':
                args.push('-ldpi');
                break;
              case 'medium':
                args.push('-mdpi');
                break;
              case 'high':
                args.push('-hdpi');
                break;
              case 'ultra':
                args.push('-udpi');
                break;
              default:
                args.push('-mdpi');
                break;
            }
          }
        }
        ws.send(args.join(' '));
      };

      $deferred.progress((action) => {
        let file;
        let hasBadFiles = false;

        if (action === 'next') {
          file = files[currIndex];

          if (typeof file === 'undefined') {
            hasBadFiles = files.some((f) => f.status === 'bad');
            $deferred.resolve({ files, hasBadFiles });
          } else if (file.extension && file.extension.toLowerCase() === 'svg') {
            sendFile(file);
            currIndex += 1;
            console.log('currIndex', currIndex);
          } else {
            setMessages(file, true, ['NOT_SUPPORT']);
            currIndex += 1;
            $deferred.notify('next');
          }
        }
      });

      $deferred.notify('next');

      return $deferred.promise();
    },

    interruptCalculation: () => {
      ws.send('interrupt');
      events.onMessage = (data) => {
        switch (data.status) {
          case 'ok':
            console.log('calculation interrupted');
            break;
          default:
            console.warn('Unknown Status:', data.status);
            break;
        }
      };
    },
  };
};
