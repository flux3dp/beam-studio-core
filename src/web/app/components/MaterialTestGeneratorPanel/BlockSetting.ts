export const blockSettingScopes = ['column', 'row'] as const;
export const blockSettingParams = ['count', 'size', 'spacing'] as const;
export const blockSettingValues = ['value', 'min', 'max'] as const;

export type BlockInfo = Record<
  (typeof blockSettingParams)[number],
  Record<(typeof blockSettingValues)[number], number>
>;
export type BlockSetting = Record<(typeof blockSettingScopes)[number], BlockInfo>;

const blockInfo = (): BlockInfo => ({
  count: { value: 5, min: 1, max: 10 },
  size: { value: 20, min: 1, max: 100 },
  spacing: { value: 5, min: 1, max: 100 },
});

export const blockSetting = (): BlockSetting => ({
  column: blockInfo(),
  row: blockInfo(),
});
