import { eventEmitter } from 'app/contexts/DialogContext';
// Trigger some dialog here to avoid dialog caller circular import

export const showFluxPlusWarning = (monotype?: boolean): void => {
  eventEmitter.emit('SHOW_FLUX_PLUS_WARNING', monotype);
};

export default {};
