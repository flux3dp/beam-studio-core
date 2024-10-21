export interface TextSetting {
  select: { value: string; label: string };
  power: number;
  speed: number;
}

export const textParams = ['power', 'speed'] as const;

export const textSetting = (): TextSetting => ({
  select: { value: 'custom', label: 'Custom' },
  power: 15,
  speed: 20,
});
