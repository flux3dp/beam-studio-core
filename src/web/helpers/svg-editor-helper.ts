interface ISVGGlobal {
    Canvas: any,
    Editor: any,
    Edit: any
}

export const getSVGCanvas = () => {
    if (!window['svgCanvas']) {
        throw new Error('Access to svgCanvas before svgCanvas was inited');
    }
    return window['svgCanvas'];
}

export const getSVGEditor = () => {
    return window['svgEditor'];
}

export const getSVGEdit = () => {
    return window['svgedit'];
}

export const getSVGAsync = (callback: (p: ISVGGlobal) => void) => {
  console.log('00000');
    const refreshTimer = setInterval(() => {
        if (!window['svgCanvas']) return;
        if (!window['svgEditor']) return;
        console.log(11111);
        callback({
            Canvas: getSVGCanvas(),
            Editor: getSVGEditor(),
            Edit: getSVGEdit()
        });
        clearInterval(refreshTimer);
    }, 200);
}

export const getSVG = () => {
  setTimeout(() => {}, 200)
  if (!window['svgCanvas']) return;
  if (!window['svgEditor']) return;
  return {
    svgCanvas: getSVGCanvas(),
    svgEditor: getSVGEditor(),
    svgedit: getSVGEdit(),
  };
};
