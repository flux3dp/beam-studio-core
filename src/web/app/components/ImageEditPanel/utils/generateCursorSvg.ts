/* eslint-disable no-nested-ternary */
/* eslint-disable import/prefer-default-export */

export const generateCursorSvg = (brushSize: number): string => {
  const cursorRatio = brushSize <= 10 ? 2 : brushSize <= 20 ? 1 : brushSize <= 80 ? 0.5 : 0.1;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#1890FF" stroke-linecap="round"
    stroke-linejoin="round" stroke-opacity="1" stroke-width="${cursorRatio}" width="${brushSize}"
    height="${brushSize}" viewBox="0 0 10 10">
      <circle cx="5.02" cy="5.02" r="5"/>
    </svg>`;

  return encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
};
