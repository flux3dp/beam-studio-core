import KeycodeConstants from 'app/constants/keycode-constants';
import { isMobile } from 'helpers/system-helper';
/**
 * setting up shortcut
 */
const root = window;
const isMetaKey = (keyCode: number) => keyCode === 91 || keyCode === 93;
const specialKeyMap = {
  CMD: -91,
  L_CMD: KeycodeConstants.KEY_L_CMD,
  R_CMD: KeycodeConstants.KEY_R_CMD,
  SHIFT: KeycodeConstants.KEY_SHIFT,
  CTRL: KeycodeConstants.KEY_CTRL,
  ALT: KeycodeConstants.KEY_ALT,
  DEL: KeycodeConstants.KEY_DEL,
  BACK: KeycodeConstants.KEY_BACK,
  RETURN: KeycodeConstants.KEY_RETURN,
  TAB: KeycodeConstants.KEY_TAB,
  ESC: KeycodeConstants.KEY_ESC,
  LEFT: KeycodeConstants.KEY_LEFT,
  UP: KeycodeConstants.KEY_UP,
  RIGHT: KeycodeConstants.KEY_RIGHT,
  DOWN: KeycodeConstants.KEY_DOWN,
  PLUS: KeycodeConstants.KEY_PLUS,
  MINUS: KeycodeConstants.KEY_MINUS,
  NUM_PLUS: KeycodeConstants.KEY_NUM_PLUS,
  NUM_MINUS: KeycodeConstants.KEY_NUM_MINUS,
  FNKEY: window.os === 'MacOS' ? -91 : KeycodeConstants.KEY_CTRL,
  '\\': KeycodeConstants.KEY_BACKSLASH,
  F1: KeycodeConstants.KEY_F1,
  F2: KeycodeConstants.KEY_F2,
};
let events: {
  key: string[];
  keyCode: string;
  callback: (e: KeyboardEvent) => void;
  priority?: number;
}[] = [];
let keyCodeStatus = [];
let hasBind = false;
const keyupEvent = () => {
  keyCodeStatus = [];
};

const generateKey = (keyCodes: number[]) => keyCodes.sort().join('+');
const matchedEvents = (keyCodes: number[]) => {
  const keyCode = generateKey(keyCodes);

  const { matches, maxPriority } = events.reduce(
    (acc, cur) => {
      if (cur.keyCode === keyCode) {
        if (cur.priority > acc.maxPriority) {
          acc.matches = [cur];
          acc.maxPriority = cur.priority;
        } else if (cur.priority === acc.maxPriority) {
          acc.matches.push(cur);
        }
      }
      return acc;
    },
    { matches: [], maxPriority: 0 }
  );
  return { matches, maxPriority };
};
const keydownEvent = (e: KeyboardEvent) => {
  keyupEvent();

  if (isMetaKey(e.keyCode) === false) {
    keyCodeStatus.push(e.keyCode);
  }

  if (e.ctrlKey === true) {
    keyCodeStatus.push(specialKeyMap.CTRL);
  }

  if (e.altKey === true) {
    keyCodeStatus.push(specialKeyMap.ALT);
  }

  if (e.shiftKey === true) {
    keyCodeStatus.push(specialKeyMap.SHIFT);
  }

  if (e.metaKey === true) {
    keyCodeStatus.push(specialKeyMap.CMD);
  }

  keyCodeStatus = [...new Set(keyCodeStatus)].sort();

  const { matches } = matchedEvents(keyCodeStatus);

  if (matches.length > 0) {
    keyCodeStatus = [];
  }

  matches.forEach((event) => {
    event.callback.apply(null, [e]);
  });
};
const initialize = (): void => {
  if (hasBind === false) {
    root.addEventListener('keyup', keyupEvent);
    root.addEventListener('keydown', keydownEvent);
    hasBind = true;
  }
};
const convertToKeyCode = (keys: string[]) => {
  const keyCodes: number[] = keys.map((key) => {
    const upperKey = key.toUpperCase();
    const keycode = specialKeyMap[upperKey] ? specialKeyMap[upperKey] : upperKey.charCodeAt(0);
    return keycode;
  });
  return keyCodes;
};

const unsubscribe = (evt: (typeof events)[number]) => {
  events = events.filter((e) => e !== evt);
};

export default {
  on(
    keys: string[],
    callback: (e: KeyboardEvent) => void,
    { isBlocking = false }: { isBlocking?: boolean } = {}
  ): (() => void) | null {
    if (isMobile()) return null;
    const keyCodes = convertToKeyCode(keys);
    const e: (typeof events)[number] = {
      key: keys,
      keyCode: generateKey(keyCodes),
      callback,
      priority: 0,
    };
    if (isBlocking) {
      const { maxPriority } = matchedEvents(keyCodes);
      e.priority = maxPriority + 1;
    }
    events.push(e);
    initialize();
    return () => unsubscribe(e);
  },
  off(keys: string[]): void {
    const keyCodes = convertToKeyCode(keys);
    const keyCode = generateKey(keyCodes);
    events = events.filter((event) => event.keyCode !== keyCode);
  },
  disableAll(): void {
    root.removeEventListener('keyup', keyupEvent);
    root.removeEventListener('keydown', keydownEvent);
    hasBind = false;
    events = [];
  },
  pauseAll(): void {
    root.removeEventListener('keyup', keyupEvent);
    root.removeEventListener('keydown', keydownEvent);
    hasBind = false;
  },
  initialize,
};
