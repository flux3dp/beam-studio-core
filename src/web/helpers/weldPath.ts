import * as paper from 'paper';

const weldPathD = (
  pathD: string
): string => {
  const proj = new paper.Project(document.createElement('canvas'));
  const subPaths = pathD.split('M').filter((d) => d.split(' ').length > 4).map((d) => `<path d="M${d}" />`);
  const items = proj.importSVG(`<svg>${subPaths.join('')}</svg>`);
  const objs = items.children.map((obj) => obj as paper.Path | paper.CompoundPath);
  // Sort from the biggest to the smallest area
  objs.sort((a, b) => b.area - a.area);
  let basePath = objs[0] as paper.PathItem;
  const removeList = [];
  for (let i = 1; i < objs.length; i += 1) {
    const newPath = basePath.unite(objs[i]);
    // If the new path is the same as base path, it means the objs[i] is inside the base path
    if (newPath.pathData !== basePath.pathData) {
      removeList.push(objs[i]);
    }
    basePath.remove();
    basePath = newPath;
  }
  removeList.forEach((obj) => obj.remove());
  const svg = proj.exportSVG() as SVGElement;
  const canvas = svg.children[0];
  const result = canvas.children[0];
  let pathData = '';
  for (let i = 0; i < result.children.length; i += 1) {
    const path = result.children[i];
    pathData += path.getAttribute('d');
  }
  return pathData;
};

export default weldPathD;
