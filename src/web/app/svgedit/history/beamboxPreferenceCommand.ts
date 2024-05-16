/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import beamboxPreference from 'app/actions/beambox/beambox-preference';
import { IBatchCommand, IHistoryHandler } from 'interfaces/IHistory';

import { BaseHistoryCommand, HistoryEventTypes } from './history';

class BeamboxPreferenceCommand extends BaseHistoryCommand {
  private key: string;

  private oldValue: any;

  private newValue: any;

  elements = () => [];

  type = () => 'BeamboxPreferenceCommand';

  constructor(key: string, oldValue: any, newValue: any) {
    super();
    this.key = key;
    this.oldValue = oldValue;
    this.newValue = newValue;
  }

  public apply(handler: IHistoryHandler): void {
    handler?.handleHistoryEvent(HistoryEventTypes.BEFORE_APPLY, this);
    beamboxPreference.write(this.key, this.newValue);
    handler?.handleHistoryEvent(HistoryEventTypes.AFTER_APPLY, this);
  }

  public unapply(handler: IHistoryHandler): void {
    handler?.handleHistoryEvent(HistoryEventTypes.BEFORE_UNAPPLY, this);
    console.log(this.key, this.oldValue);
    beamboxPreference.write(this.key, this.oldValue);
    handler?.handleHistoryEvent(HistoryEventTypes.AFTER_UNAPPLY, this);
  }
}

export const changeBeamboxPreferenceValue = (
  key: string,
  value: any,
  opts: { parentCmd?: IBatchCommand } = {}
): BeamboxPreferenceCommand => {
  const { parentCmd } = opts;
  const oldValue = beamboxPreference.read(key);
  beamboxPreference.write(key, value);
  const cmd = new BeamboxPreferenceCommand(key, oldValue, value);
  if (parentCmd) parentCmd.addSubCommand(cmd);
  return cmd;
};

export default BeamboxPreferenceCommand;
