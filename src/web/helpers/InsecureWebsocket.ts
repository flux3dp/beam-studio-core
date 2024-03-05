const wrappedSockets = {};

let fluxTunnelLoaded = false;
window.addEventListener('FluxTunnelLoaded', () => {
  fluxTunnelLoaded = true;
});
window.dispatchEvent(new CustomEvent('CheckFluxTunnel'));

export const checkFluxTunnel = (): boolean => {
  window.dispatchEvent(new CustomEvent('CheckFluxTunnel'));
  return fluxTunnelLoaded;
};

class InsecureWebsocket {
  id: string;

  url: string;

  protocol: string;

  onopen: () => void;

  onerror: () => void;

  onmessage: (message: string) => void;

  onclose: (data: { code?: number; reason: string; }) => void;

  readyState = 0;

  constructor(url: string, protocol?: string) {
    const id = Math.random().toString(36).substring(2, 15);
    this.id = id;
    wrappedSockets[id] = this;
    this.url = url;
    this.protocol = protocol;
    this.onopen = () => {
      console.log('WebSocket connection established (default message)', id);
    };
    this.onerror = () => {};
    this.onmessage = () => {};
    this.onclose = () => {};
    if (!checkFluxTunnel()) {
      console.warn('FluxTunnel is not loaded');
      setTimeout(() => {
        this.onerror();
        this.onclose({ reason: 'FluxTunnel is not loaded' });
      }, 100);
    } else {
      console.log('Creating websocket in insecure websocket', id, 'url:', url, protocol);
      const event = new CustomEvent('CreateWebsocket', { detail: { id, url, protocol } });
      window.dispatchEvent(event);
    }
  }

  send(message: unknown): void {
    const event = new CustomEvent('SendMessage', { detail: { id: this.id, message } });
    window.dispatchEvent(event);
  }

  close(): void {
    this.readyState = 2;
    const event = new CustomEvent('CloseWebsocket', { detail: { id: this.id } });
    window.dispatchEvent(event);
  }
}

window.addEventListener('InsecureWebsocket', (e: any) => {
  const { detail } = e;
  const { id, type, message } = detail;
  if (!wrappedSockets[id]) {
    // console.warn('InsecureWebsocket Unknown websocket id', id);
    return;
  }
  switch (type) {
    case 'WEBSOCKET_CREATED':
      break;
    case 'WEBSOCKET_OPENED':
      wrappedSockets[id].readyState = 1;
      wrappedSockets[id].onopen();
      break;
    case 'WEBSOCKET_MESSAGE':
      wrappedSockets[id].onmessage({ data: message });
      break;
    case 'WEBSOCKET_CLOSED':
      wrappedSockets[id].readyState = 3;
      wrappedSockets[id].onclose();
      break;
    case 'WEBSOCKET_ERROR':
      wrappedSockets[id].onerror(message);
      break;
    default:
      console.warn('InsecureWebsocket Unknown event type', type);
      break;
  }
});

window.onbeforeunload = () => {
  Object.keys(wrappedSockets).forEach((id) => {
    wrappedSockets[id]?.close();
  });
};

export default InsecureWebsocket;
