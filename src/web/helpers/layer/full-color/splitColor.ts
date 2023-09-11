import { CMYK } from 'app/constants/color-constants';

/**
 * split img into desired color channels
 */
// TODO: add unit test
const splitColor = async (imgBlobUrl: string): Promise<Blob[]> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  await new Promise<void>((resolve) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resolve();
    };
    img.src = imgBlobUrl;
  });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;
  const channelDatas = [];
  for (let i = 0; i < CMYK.length; i += 1) {
    channelDatas.push(new Uint8ClampedArray(data.length));
  }
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    let k = 255 - Math.max(r, g, b);
    const c = 255 - (255 * (255 - r - k)) / (255 - k);
    const m = 255 - (255 * (255 - g - k)) / (255 - k);
    const y = 255 - (255 * (255 - b - k)) / (255 - k);
    k = 255 - k;
    const colors = [k, c, m, y];
    for (let j = 0; j < colors.length; j += 1) {
      channelDatas[j][i] = colors[j];
      channelDatas[j][i + 1] = colors[j];
      channelDatas[j][i + 2] = colors[j];
      channelDatas[j][i + 3] = a;
    }
  }
  const resultBlobs = [];
  for (let i = 0; i < channelDatas.length; i += 1) {
    imageData.data.set(channelDatas[i]);
    ctx.putImageData(imageData, 0, 0);
    // eslint-disable-next-line no-await-in-loop
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b));
    });
    resultBlobs.push(blob);
  }
  return resultBlobs;
};

export default splitColor;
