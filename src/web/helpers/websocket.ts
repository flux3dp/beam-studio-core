/* eslint-disable no-console */
import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import blobSegments from 'helpers/blob-segments';
import i18n from 'helpers/i18n';
import isJson from 'helpers/is-json';
import Logger from 'helpers/logger';
import outputError from 'helpers/output-error';
import storage from 'implementations/storage';

window['FLUX'].websockets = [];
window['FLUX'].websockets.list = function () {
  window['FLUX'].websockets.forEach((conn, i) => {
    console.log(i, conn.url);
  });
};

let hadConnected = false;
const WsLogger = Logger('websocket');
const logLimit = 100;
let wsErrorCount = 0;
let wsCreateFailedCount = 0;

const readyState = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
};

// options:
//      hostname      - host name (Default: 127.0.0.1)
//      port          - what protocol uses (Default: 8000)
//      method        - method be called
//      autoReconnect - auto reconnect on close
//      onMessage     - fired on receive message
//      onError       - fired on a normal error happend
//      onFatal       - fired on a fatal error closed
//      onClose       - fired on connection closed
//      onOpen        - fired on connection connecting
export default function (options) {
  let { dev } = window['FLUX'];
  const customHost = storage.get('host');
  const customPort = localStorage.getItem('port');
  const defaultCallback = () => { };
  const defaultOptions = {
    hostname: customHost || '127.0.0.1',
    method: '',
    get port() {
      return customPort || dev ? '8000' : window['FLUX'].ghostPort;
    },
    autoReconnect: true,
    ignoreAbnormalDisconnect: false,
    onMessage: defaultCallback,
    onError: defaultCallback,
    onFatal: defaultCallback,
    onClose: defaultCallback,
    onOpen: defaultCallback,
  };
  let receivedData = [];
  let ws = null;
  const trimMessage = (origMessage: string): string => {
    const message = origMessage.replace(/"/g, '');

    if (message.length > 200) {
      return `${message.substr(0, 200)}...`;
    }

    return message;
  };
  const origanizeOptions = (opts) => {
    const keys = Object.keys(defaultOptions);
    const newOpts = { ...opts };
    for (let i = 0; i < keys.length; i += 1) {
      const name = keys[i];
      if (name !== 'port' && (typeof opts[name] === 'undefined')) {
        newOpts[name] = defaultOptions[name];
      }
    }

    return newOpts;
  };
  const socketOptions = origanizeOptions(options);
  const wsLog = {
    url: `/ws/${options.method}`,
    log: [],
  };
  const createWebSocket = (createWsOpts) => {
    const port = createWsOpts.port || defaultOptions.port;
    const url = `ws://${createWsOpts.hostname}:${port}/ws/${createWsOpts.method}`;
    if (port === undefined) {
      wsCreateFailedCount += 1;
      if (wsCreateFailedCount === 100) {
        const LANG = i18n.lang.beambox.popup;
        Alert.popById('backend-error');
        Alert.popUp({
          id: 'backend-error',
          type: AlertConstants.SHOW_POPUP_ERROR,
          message: LANG.backend_connect_failed_ask_to_upload,
          buttonType: AlertConstants.YES_NO,
          onYes: () => {
            outputError.uploadBackendErrorLog();
          },
        });
      }
      return null;
    }
    const nodeWs = new WebSocket(url);
    wsCreateFailedCount = 0;

    nodeWs.onerror = (e) => {
      wsErrorCount += 1;
      // If ws error count exceed certian number Alert user there may be problems with backend
      if (wsErrorCount === 50) {
        const LANG = i18n.lang.beambox.popup;
        Alert.popById('backend-error');
        Alert.popUp({
          id: 'backend-error',
          type: AlertConstants.SHOW_POPUP_ERROR,
          message: LANG.backend_connect_failed_ask_to_upload,
          buttonType: AlertConstants.YES_NO,
          onYes: () => {
            outputError.uploadBackendErrorLog();
          },
        });
      }
    };

    nodeWs.onopen = (e) => {
      socketOptions.onOpen(e);
      wsErrorCount = 0;
    };

    nodeWs.onmessage = (result) => {
      let data = (isJson(result.data) === true ? JSON.parse(result.data) : result.data);
      let errorStr = '';
      let skipError = false;
      if (!(result.data instanceof Blob)) {
        const message = trimMessage(['<', result.data].join(' '));
        wsLog.log.push(message);
      } else {
        // Blob, not stringifiable
        const message = trimMessage(`< Blob, size: ${result.data.size}`);
        wsLog.log.push(message);
      }

      while (wsLog.log.length >= logLimit) {
        wsLog.log.shift();
      }

      if (typeof data === 'string') {
        data = data.replace(/\\/g, '\\\\');
        data = data.replace(/\bNaN\b/g, 'null');
        data = data.replace(/\r?\n|\r/g, ' ');
        data = (isJson(data) === true ? JSON.parse(data) : data);
      }

      while (receivedData.length >= logLimit) {
        receivedData.shift();
      }
      receivedData.push(data);

      switch (data.status) {
        case 'error':
          errorStr = data instanceof Object ? data.error : '';
          skipError = false;

          if (data instanceof Object && data.error instanceof Array) {
            errorStr = data.error.join('_');
          }

          if (errorStr === 'NOT_EXIST_BAD_NODE') { skipError = true; }

          if (window['FLUX'].allowTracking && !skipError) {
            // window.Raven.captureException(data);
            console.error('WS_ERROR', errorStr);
          }
          socketOptions.onError(data);
          break;
        case 'fatal':
          errorStr = data instanceof Object ? data.error : '';
          skipError = false;

          if (data instanceof Object && data.error instanceof Array) {
            errorStr = data.error.join('_');
          }

          if (errorStr === 'AUTH_ERROR') { skipError = true; }

          // if identify error, reconnect again
          if (errorStr === 'REMOTE_IDENTIFY_ERROR') {
            setTimeout(() => {
              ws = createWebSocket(createWsOpts);
            }, 1000);
            return;
          }

          if (window['FLUX'].allowTracking && !skipError) {
            // window.Raven.captureException(data);
            console.error('WS_FATAL', errorStr);
          }

          socketOptions.onFatal(data);
          break;
        // ignore below status
        case 'pong':
          break;
        case 'debug':
          if (socketOptions.onDebug) {
            socketOptions.onDebug(data);
          }
          break;
        default:
          socketOptions.onMessage(data);
          break;
      }

      hadConnected = true;
    };

    nodeWs.onclose = (result) => {
      socketOptions.onClose(result);

      // The connection was closed abnormally without sending or receving data
      // ref: http://tools.ietf.org/html/rfc6455#section-7.4.1
      if (result.code === 1006) {
        wsLog.log.push(['**abnormal disconnection**'].join(' '));
        socketOptions.onFatal(result);
      }

      if (socketOptions.autoReconnect === true) {
        receivedData = [];
        ws = createWebSocket(createWsOpts);
      } else {
        ws = null; // release
      }
    };

    return nodeWs;
  };

  let timer = null;
  const keepAlive = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (ws !== null && readyState.OPEN === ws.readyState) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        sender('ping');
      }
    }, 60 * 1000 /* ms */);
  };
  keepAlive();

  const sender = (data) => {
    wsLog.log.push(trimMessage(['>', data, typeof data].join(' ')));

    if (data instanceof Blob === true) {
      blobSegments(data, (chunk) => {
        ws.send(chunk);
      });
    } else {
      ws.send(data);
    }
    keepAlive();
  };

  ws = createWebSocket(socketOptions);
  const wsobj = {
    readyState,
    options: socketOptions,
    url: `/ws/${options.method}`,
    log: wsLog.log,
    send(data) {
      if (ws === null) {
        ws = createWebSocket(socketOptions);
      }

      if (ws === null || readyState.OPEN !== ws.readyState) {
        ws.onopen = (e) => {
          socketOptions.onOpen(e);
          sender(data);
        };
      } else {
        sender(data);
      }
      return wsobj;
    },
    fetchData() {
      return receivedData;
    },
    fetchLastResponse() {
      return wsobj.fetchData()[receivedData.length - 1];
    },
    getReadyState() {
      return ws.readyState;
    },
    close(reconnect?: boolean) {
      if (typeof reconnect === 'boolean') {
        socketOptions.autoReconnect = reconnect;
      }
      if (ws !== null && ws.readyState !== readyState.CLOSED) {
        ws.close();
      }
    },
    setOptions(sockOpts) {
      Object.assign(socketOptions, sockOpts);
    },
    // events
    onOpen(callback) {
      socketOptions.onOpen = callback;
      return wsobj;
    },
    onMessage(callback) {
      socketOptions.onMessage = callback;
      return wsobj;
    },
    onClose(callback) {
      socketOptions.onClose = callback;
      return wsobj;
    },
    onError(callback) {
      socketOptions.onError = callback;
      return wsobj;
    },
    onFatal(callback) {
      socketOptions.onFatal = callback;
      return wsobj;
    },
  };

  window['FLUX'].websockets.push(wsobj);

  WsLogger.append(wsLog);

  return wsobj;
}
