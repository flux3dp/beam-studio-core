export interface TextSetting {
  select: { value: string; label: string };
  power: number;
  speed: number;
}

export const textSetting = (): TextSetting => ({
  select: { value: 'custom', label: 'Custom' },
  power: 15,
  speed: 20,
});
