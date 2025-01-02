onmessage = async (e) => {
  const startTime = performance.now();
  const { type } = e.data;

  console.log('image-symbol.worker startTime:', startTime);

  if (type === 'svgStringToBlob') {
    const { svgString } = e.data;
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });

    postMessage(svgBlob, null);
  } else if (type === 'imageDataToBlob') {
    const { imageData, bb, imageRatio } = e.data;
    const imgCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const imgCtx = imgCanvas.getContext('2d');

    imgCtx.imageSmoothingEnabled = false;
    imgCtx.putImageData(imageData, 0, 0);

    const outCanvas = new OffscreenCanvas(
      Math.max(1, bb.width * imageRatio),
      Math.max(1, bb.height * imageRatio)
    );
    const outCtx = outCanvas.getContext('2d');

    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(
      imgCanvas,
      bb.x * imageRatio,
      bb.y * imageRatio,
      outCanvas.width,
      outCanvas.height,
      0,
      0,
      outCanvas.width,
      outCanvas.height
    );

    const imageBlob = await outCanvas.convertToBlob({ type: 'image/png' });

    postMessage(imageBlob, null);
  }

  console.log('image-symbol.worker endTime:', performance.now() - startTime);
};
