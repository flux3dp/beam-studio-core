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
import fs from 'implementations/fileSystem';
import i18n from 'helpers/i18n';
import Progress from 'app/actions/progress-caller';
import storage from 'implementations/storage';
import Websocket from 'helpers/websocket';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (parserOpts: { type?: string, onFatal?: (data) => void }) => {
  parserOpts = parserOpts || {};

  const apiMethod = {
    laser: 'svg-laser-parser',
    svgeditor: 'svgeditor-laser-parser',
    draw: 'pen-svg-parser',
    cut: 'svg-vinyl-parser',
    mill: 'svg-vinyl-parser',
  }[parserOpts.type || 'laser'];
  const events: { onMessage: (data?) => void, onError: (data?) => void } = {
    onMessage: () => { },
    onError: () => { },
  };
  const ws = Websocket({
    method: apiMethod,
    onMessage: (data) => {
      events.onMessage(data);
    },

    onError: (data) => {
      events.onError(data);
    },

    onFatal: parserOpts.onFatal,
  });
  let lastOrder = '';

  return {
    getTaskCode(names, opts) {
      opts = opts || {};
      opts.onProgressing = opts.onProgressing || (() => { });
      opts.onFinished = opts.onFinished || (() => { });
      lastOrder = 'getTaskCode';

      const args = [
        'go',
        names.join(' '),
        opts.fileMode || '-f',
      ];
      const blobs = [];
      let duration;
      let totalLength = 0;
      let blob;

      if (opts.model === 'fhexa1') {
        args.push('-hexa');
        const accel = BeamboxPreference.read('padding_accel') || 5000;
        const accelDiode = BeamboxPreference.read('padding_accel_diode') || 4500;
        args.push('-acc', opts.enableDiode ? accelDiode : accel);
      } else if (opts.model === 'fbb1p') {
        args.push('-pro');
      } else if (opts.model === 'fbm1') {
        args.push('-beamo');
      }
      if (opts.codeType === 'gcode') {
        args.push('-gc');
      }

      if (svgCanvas && svgCanvas.getRotaryMode()) {
        args.push('-spin');
        args.push(svgCanvas.runExtensions('getRotaryAxisAbsoluteCoord'));
      }

      if (i18n.getActiveLang() === 'zh-cn' && BeamboxPreference.read('blade_radius') && BeamboxPreference.read('blade_radius') > 0) {
        args.push('-blade');
        args.push(BeamboxPreference.read('blade_radius'));
        if (BeamboxPreference.read('blade_precut')) {
          args.push('-precut');
          args.push(`${BeamboxPreference.read('precut_x') || 0},${BeamboxPreference.read('precut_y') || 0}`);
        }
      }

      if (opts.enableAutoFocus) {
        args.push('-af');
      }

      if (opts.enableDiode) {
        args.push('-diode');
        args.push(`${BeamboxPreference.read('diode_offset_x') || 0},${BeamboxPreference.read('diode_offset_y') || 0}`);
        if (BeamboxPreference.read('diode-one-way-engraving') !== false) {
          args.push('-diode-owe');
        }
      }

      if (opts.shouldUseFastGradient) {
        args.push('-fg');
      }

      if (opts.shouldMockFastGradient) {
        args.push('-mfg');
      }

      if (opts.vectorSpeedConstraint) {
        args.push('-vsc');
      }

      if (BeamboxPreference.read('stripe_compensation')) {
        args.push('-strpcom');
        args.push(`${BeamboxPreference.read('stripe_compensation_y0') || 0},${BeamboxPreference.read('stripe_compensation_interval') || 0},${BeamboxPreference.read('stripe_compensation_power') || 100}`);
      }

      if (BeamboxPreference.read('reverse-engraving')) {
        args.push('-rev');
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

      const loopCompensation = Number(storage.get('loop_compensation') || '0');
      if (loopCompensation > 0) {
        ws.send(['set_params', 'loop_compensation', loopCompensation].join(' '));
      }
      ws.send(args.join(' '));
    },
    gcodeToFcode(
      taskData: { arrayBuffer: ArrayBuffer, thumbnailSize: number, size: number },
      opts,
    ) {
      const $deferred = $.Deferred();
      const warningCollection = [];
      const args = [
        'g2f',
      ];
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

      ws.send([
        'g2f',
        taskData.size,
        taskData.thumbnailSize,
      ].join(' '));

      return $deferred.promise();
    },
    divideSVG(opts?) {
      const $deferred = $.Deferred();
      opts = opts || {};
      opts.onProgressing = opts.onProgressing || (() => { });
      opts.onFinished = opts.onFinished || (() => { });
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
      opts.onProgressing = opts.onProgressing || (() => { });
      opts.onFinished = opts.onFinished || (() => { });
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
    uploadPlainSVG(file, skipVersionWarning = false) {
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
            let newPath = hrefCleaned.replace(/&apos;/g, '\'')
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
                newPath = newPath.replace(/&/g, '&amp;')
                  .replace(/'/g, '&apos;')
                  .replace(/"/g, '&quot;')
                  .replace(/>/g, '&gt;')
                  .replace(/</g, '&lt;');
                svgString = svgString.replace(`xlink:href="${hrefCleaned}"`, `xlink:href="${newPath}"`);
                continue;
              }
            }
            allImageValid = false;
            $deferred.resolve('invalid_path');
          }
        }
        let version;
        const LANG = i18n.lang.beambox.popup;
        if (!skipVersionWarning && !AlertConfig.read('skip_svg_version_warning')) {
          const matchSVG = svgString.match(/<svg[^>]*>/g)[0];
          if (matchSVG) {
            version = matchSVG.match(/ version="([^"]+)"/);
            if (version) {
              const versionString = version[1];
              if (versionString === '1.1') {
                Alert.popUp({
                  type: AlertConstants.SHOW_POPUP_WARNING,
                  message: LANG.svg_1_1_waring,
                  checkbox: {
                    text: LANG.dont_show_again,
                    callbacks: () => AlertConfig.write('skip_svg_version_warning', true),
                  },
                });
              }
            }
          }
        }
        if (allImageValid && hasPath && !AlertConfig.read('skip_image_path_warning')) {
          Alert.popUp({
            type: AlertConstants.SHOW_POPUP_WARNING,
            message: LANG.svg_image_path_waring,
            checkbox: {
              text: LANG.dont_show_again,
              callbacks: () => AlertConfig.write('skip_image_path_warning', true),
            },
          });
        }
        if (allImageValid) {
          file = new Blob([svgString], {
            type: 'text/plain',
          });

          ws.send([
            'upload_plain_svg',
            'plain-svg',
            file.size,
          ].join(' '));
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
      const svgString = `<svg viewBox="${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}"><defs>${defs}</defs>${textString}</svg>`;
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
      ws.send([
        'upload_plain_svg',
        'text-svg',
        file.size,
      ].join(' '));
      return $deferred.promise();
    },

    uploadToSvgeditorAPI(files, opts) {
      const $deferred = $.Deferred();
      let currIndex = 0;
      const orderName = 'svgeditor_upload';
      const setMessages = (file, isBroken, warningCollection) => {
        file.status = (warningCollection.length > 0 ? 'bad' : 'good');
        file.messages = warningCollection;
        file.isBroken = isBroken;
        return file;
      };

      const sendFile = (file) => {
        const warningCollection = [];

        events.onMessage = (data) => {
          switch (data.status) {
            case 'computing':
              opts.onProgressing(data);
              break;
            case 'continue':
              ws.send(file.data);
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
          warningCollection.push(data.error);
          file = setMessages(file, true, warningCollection);
          $deferred.notify('next');
        };
        const args = [
          orderName,
          file.uploadName,
          file.size,
          file.thumbnailSize,
        ];

        if (opts) {
          if (opts.model === 'fhexa1') {
            args.push('-bb2');
          } else if (opts.model === 'fbb1p') {
            args.push('-pro');
          } else if (opts.model === 'fbm1') {
            args.push('-beamo');
          }

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
          if (opts.enableMask) {
            args.push('-mask');
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
