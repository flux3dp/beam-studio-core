import communicator from 'implementations/communicator';

const main = async () => {
  communicator.on('SVG_URL_TO_IMG_URL', (e, data) => {
    const {
      url, width, height, id, strokeWidth,
    } = data;
    console.log(data);
    const img = new Image(width + parseInt(strokeWidth, 10), height + parseInt(strokeWidth, 10));
    img.onload = async () => {
      const imgCanvas = document.createElement('canvas');
      imgCanvas.width = img.width;
      imgCanvas.height = img.height;
      const ctx = imgCanvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, width, height);
      const outCanvas = document.createElement('canvas');
      outCanvas.width = Math.max(1, width);
      outCanvas.height = Math.max(1, height);
      const outCtx = outCanvas.getContext('2d');
      outCtx.imageSmoothingEnabled = false;
      outCtx.filter = 'brightness(0%)';
      outCtx.drawImage(imgCanvas, 0, 0, outCanvas.width, outCanvas.height);
      const imageBase64 = outCanvas.toDataURL('image/png');
      const res = await fetch(imageBase64);
      const imageBlob = await res.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      communicator.send('SVG_URL_TO_IMG_URL_DONE', { imageUrl, id });
    };
    img.src = url;
  });
};

main();
