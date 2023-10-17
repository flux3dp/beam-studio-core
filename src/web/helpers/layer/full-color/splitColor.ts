import { CMYK } from 'app/constants/color-constants';

/**
 * split img into desired color channels, return null if empty
 */
// TODO: add unit test
const splitColor = async (imgBlobUrl: string): Promise<(Blob | null)[]> => {
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
  const empty = [true, true, true, true];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    const k = 255 - Math.max(r, g, b);
    const c = 255 - r - k;
    const m = 255 - g - k;
    const y = 255 - b - k;
    // invert color because we print black part
    const colors = [255 - k, 255 - c, 255 - m, 255 -y];
    for (let j = 0; j < colors.length; j += 1) {
      channelDatas[j][i] = colors[j];
      channelDatas[j][i + 1] = colors[j];
      channelDatas[j][i + 2] = colors[j];
      channelDatas[j][i + 3] = a;
      if (a !== 0 && colors[j] !== 255 && empty[j]) {
        empty[j] = false;
      }
    }
  }
  const resultBlobs = [];
  for (let i = 0; i < channelDatas.length; i += 1) {
    if (!empty[i]) {
      imageData.data.set(channelDatas[i]);
      ctx.putImageData(imageData, 0, 0);
      // eslint-disable-next-line no-await-in-loop
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b));
      });
      resultBlobs.push(blob);
    } else {
      resultBlobs.push(null);
    }
  }
  return resultBlobs;
};

export default splitColor;
