import { CMYK } from 'app/constants/color-constants';

/**
 * split img into desired color channels, return null if empty
 */
// TODO: add unit test
const splitColor = async (
  imgBlobUrl: string,
  opts: {
    includeWhite?: boolean;
  } = {}
): Promise<(Blob | null)[]> => {
  const canvas = document.createElement('canvas');
  const { includeWhite = false } = opts;
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
  const whiteChannel = includeWhite ? new Uint8ClampedArray(data.length) : null;
  const empty = [true, true, true, true];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    let k = 255 - Math.max(r, g, b);
    const c = Math.round((255 - r - k));
    const m = Math.round((255 - g - k));
    const y = Math.round((255 - b - k));
    k = Math.round(k);
    // invert color because we print black part
    const colors = [255 - k, 255 - c, 255 - m, 255 - y];
    let hasColor = false;
    for (let j = 0; j < colors.length; j += 1) {
      channelDatas[j][i] = colors[j];
      channelDatas[j][i + 1] = colors[j];
      channelDatas[j][i + 2] = colors[j];
      channelDatas[j][i + 3] = a;
      if (a !== 0 && colors[j] !== 255) {
        if (empty[j]) empty[j] = false;
        hasColor = true;
      }
    }
    if (hasColor && whiteChannel) {
      // we print black part so set to black
      whiteChannel[i] = 0;
      whiteChannel[i + 1] = 0;
      whiteChannel[i + 2] = 0;
      whiteChannel[i + 3] = a;
    }
  }
  const channelToBlob = async (channelData: Uint8ClampedArray | null): Promise<Blob | null> => {
    if (!channelData) return null;
    imageData.data.set(channelData);
    ctx.putImageData(imageData, 0, 0);
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b));
    });
    return blob;
  };
  const resultBlobs = [];
  resultBlobs.push(await channelToBlob(whiteChannel));
  for (let i = 0; i < channelDatas.length; i += 1) {
    if (!empty[i]) {
      // eslint-disable-next-line no-await-in-loop
      resultBlobs.push(await channelToBlob(channelDatas[i]));
    } else resultBlobs.push(null);
  }
  return resultBlobs;
};

export default splitColor;
