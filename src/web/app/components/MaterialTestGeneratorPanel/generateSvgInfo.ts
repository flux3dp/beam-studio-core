import { BlockSetting } from './BlockSetting';
import { TableSetting } from './TableSetting';

interface Props {
  tableSetting: TableSetting;
  blockSetting: BlockSetting;
}

interface SvgInfo {
  name: string;
  strength: number;
  speed: number;
  repeat: number;
}

const namingMap = {
  strength: 'P',
  speed: 'S',
  repeat: 'C',
};

export default function generateSvgInfo({ tableSetting, blockSetting }: Props): Array<SvgInfo> {
  const {
    column: {
      count: { value: colLength },
    },
    row: {
      count: { value: rowLength },
    },
  } = blockSetting;

  const tableArray = Object.entries(tableSetting);

  const [[cName, cParam], [rName, rParam], [sName, sParam]] = tableArray.sort(
    ([, { selected: a }], [, { selected: b }]) => a - b
  );

  const col = Array.from({ length: colLength }, (_, i) => {
    const { minValue, maxValue } = cParam;
    const step = (maxValue - minValue) / (colLength - 1);

    return Math.ceil(minValue + step * i);
  });
  const row = Array.from({ length: rowLength }, (_, i) => {
    const { minValue, maxValue } = rParam;
    const step = (maxValue - minValue) / (rowLength - 1);

    return Math.ceil(minValue + step * i);
  });

  const sum = col
    .map((c) =>
      row.map((r) => ({
        name: `${namingMap[cName]}${c}-${namingMap[rName]}${r}-${namingMap[sName]}${sParam.default}`,
        [cName]: c,
        [rName]: r,
        [sName]: sParam.default,
      }))
    )
    .flat();

  return sum as unknown as Array<SvgInfo>;
}
