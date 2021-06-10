// const ip = 'https://35.161.43.14:3000';
const { FLUX } = window;
const ip = FLUX.dev ? 'https://127.0.0.1:3000' : 'https://cloudserv1.flux3dp.com:3000';
const deviceProtocol = '/devices';
const headers = new Headers({
  'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
});

const deviceUrl = (name) => `${ip}${deviceProtocol}/${name}`;

const get = (targetUrl) => fetch(targetUrl, { method: 'GET', credentials: 'include', headers });

const getDevices = () => get(deviceUrl('list'));

export default {
  getDevices,
};
