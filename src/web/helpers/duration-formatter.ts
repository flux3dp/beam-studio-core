export default (
  lengthInSecondInput: number,
  i18nHour: string,
  i18nMinute: string,
  i18nSecond: string,
): string => {
  const HOUR_IN_SECOND = 3600;
  const MINUTE_IN_SECOND = 60;
  const lengthInSecond: number = lengthInSecondInput || 0;

  if (lengthInSecond >= HOUR_IN_SECOND) {
    const hours = parseInt(String(lengthInSecond / HOUR_IN_SECOND), 10);
    const minutes = parseInt(String((lengthInSecond % HOUR_IN_SECOND) / MINUTE_IN_SECOND), 10);
    return `${hours} ${i18nHour} ${minutes} ${i18nMinute}`;
  } if (lengthInSecond >= MINUTE_IN_SECOND) {
    const minutes = parseInt(String(lengthInSecond / MINUTE_IN_SECOND), 10);
    const seconds = parseInt(String(lengthInSecond % MINUTE_IN_SECOND), 10);
    return `${minutes} ${i18nMinute} ${seconds} ${i18nSecond}`;
  }
  return !lengthInSecond ? '' : `${lengthInSecond} ${i18nSecond}`;
};
