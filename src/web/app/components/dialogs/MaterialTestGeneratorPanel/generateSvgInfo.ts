import { BlockSetting } from './BlockSetting';
import { TableSetting } from './TableSetting';

interface Props {
  tableSetting: TableSetting;
  blockSetting: BlockSetting;
}

export interface SvgInfo {
  name: string;
  strength: number;
  speed: number;
  repeat: number;
  pulseWidth?: number;
  frequency?: number;
}

const namingMap = {
  strength: 'P',
  speed: 'S',
  repeat: 'C',
  pulseWidth: 'PW',
  frequency: 'F',
};

export default function generateSvgInfo({
  tableSetting,
  blockSetting: {
    column: {
      count: { value: colLength },
    },
    row: {
      count: { value: rowLength },
    },
  },
}: Props): Array<SvgInfo> {
  const [col, row, ...staticParams] = Object.entries(tableSetting).sort(
    ([, { selected: a }], [, { selected: b }]) => a - b
  );
  const generateRange = (
    length: number,
    { minValue, maxValue }: { minValue: number; maxValue: number }
  ) =>
    Array.from({ length }, (_, i) =>
      Math.ceil(minValue + ((maxValue - minValue) / (length - 1)) * i)
    );

  const colRange = generateRange(colLength, col[1]);
  const rowRange = generateRange(rowLength, row[1]);

  return colRange.flatMap((c) =>
    rowRange.map((r) => ({
      name: `${namingMap[col[0]]}${c}-${namingMap[row[0]]}${r}`,
      [col[0]]: c,
      [row[0]]: r,
      ...staticParams.map(([key, value]) => ({
        [key]: value.default,
      })),
    }))
  ) as unknown as Array<SvgInfo>;
}
