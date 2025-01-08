import { modifierKeys } from 'app/constants/modifierKeys';
import { isMac, isMobile } from 'helpers/system-helper';
/**
 * setting up shortcut
 */
interface ShortcutEvent {
  keySet: string;
  callback: (event: KeyboardEvent) => void;
  priority: number;
  isPreventDefault: boolean;
  scope?: string;
}

interface RegisterOptions {
  isBlocking?: boolean;
  isPreventDefault?: boolean;
  splitKey?: string;
  scope?: string;
}

const defaultScope = '*';

let events = Array.of<ShortcutEvent>();
const currentPressedKeys = new Set<string>();
let hasBind = false;
let currentScope = defaultScope;

window.addEventListener('blur', () => currentPressedKeys.clear());

const parseKeySet = (keySet: string, splitKey = '+'): string =>
  keySet
    .replace(/Fnkey/gi, isMac() ? 'Meta' : 'Control')
    .toLowerCase()
    .split(splitKey)
    .sort()
    .join('+');

const matchedEventsByKeySet = (keySet: string, matchScope = currentScope) =>
  events
    .filter(({ scope }) => !matchScope || scope === matchScope)
    .reduce(
      (acc, cur) => {
        if (cur.keySet === keySet) {
          if (cur.priority > acc.maxPriority) {
            acc.matches = [cur];
            acc.maxPriority = cur.priority;
          } else if (cur.priority === acc.maxPriority) {
            acc.matches.push(cur);
          }
        }

        return acc;
      },
      { matches: Array.of<ShortcutEvent>(), maxPriority: 0 }
    );

const keyupEvent = (event: KeyboardEvent) => {
  /**
   * on MacOs, the keyup event is not triggered when the key is released if Meta key is pressed
   * so we need to clear the currentPressedKeys when Meta key is released
   */
  if (event.key === 'Meta') {
    currentPressedKeys.clear();
  } else {
    currentPressedKeys.delete(event.key.toLowerCase());
  }
};

const isFocusingOnInputs = () => {
  if (!document.activeElement) return false;
  return (
    document.activeElement.tagName.toLowerCase() === 'input' ||
    document.activeElement?.getAttribute('role') === 'slider'
  );
};

const keydownEvent = (event: KeyboardEvent) => {
  // ignore autocomplete input
  if (event.key === undefined || isFocusingOnInputs()) {
    return;
  }

  const currentKey = event.key.toLowerCase();

  /**
   * on MacOs, the keyup event is not triggered when the non-modifier key is released if metaKey is pressed
   * so we need to clear the currentPressedKeys when metaKey is pressed
   */
  if (event.metaKey) {
    currentPressedKeys.forEach((key) => {
      if (!modifierKeys.includes(key)) {
        currentPressedKeys.delete(key);
      }
    });
  } else if (currentPressedKeys.has('meta')) {
    currentPressedKeys.clear();
  }

  currentPressedKeys.add(currentKey);

  const currentKeySet = [...currentPressedKeys].sort().join('+');
  const { matches } = matchedEventsByKeySet(currentKeySet, currentScope);

  matches.forEach((matchedEvent) => {
    if (matchedEvent.isPreventDefault) {
      event.preventDefault();
    }

    matchedEvent.callback.apply(null, [event]);
  });
};

const initialize = (): void => {
  if (hasBind === false) {
    window.addEventListener('keyup', keyupEvent);
    window.addEventListener('keydown', keydownEvent);

    hasBind = true;
  }
};

const unsubscribe = (eventToUnsubscribe: ShortcutEvent) => {
  events.splice(events.indexOf(eventToUnsubscribe), 1);
};

export default {
  on(
    keys: Array<string>,
    callback: (event: KeyboardEvent) => void,
    { isBlocking = false, isPreventDefault = true, splitKey = '+', scope }: RegisterOptions = {}
  ): (() => void) | null {
    if (isMobile()) {
      return null;
    }

    const keySets = keys.map((key) => parseKeySet(key, splitKey));
    const newEvents: Array<ShortcutEvent> = keySets.map((keySet) => ({
      keySet,
      callback,
      priority: isBlocking ? matchedEventsByKeySet(keySet).maxPriority + 1 : 0,
      isPreventDefault,
      scope,
    }));

    newEvents.forEach((newEvent) => {
      events.push(newEvent);
    });

    initialize();

    return () => {
      newEvents.forEach((newEvent) => {
        unsubscribe(newEvent);
      });
    };
  },
  off(keySets: Array<string>): void {
    events = events.filter(({ keySet }) => !keySets.includes(keySet));
  },
  disableAll(): void {
    window.removeEventListener('keyup', keyupEvent);
    window.removeEventListener('keydown', keydownEvent);

    hasBind = false;
    events.length = 0;
  },
  pauseAll(): void {
    window.removeEventListener('keyup', keyupEvent);
    window.removeEventListener('keydown', keydownEvent);

    hasBind = false;
  },
  initialize,
  /**
   * Change the scope of the shortcuts, if no scope is provided, it will change to the default scope.
   * @param scope
   */
  enterScope(scope = defaultScope): void {
    currentScope = scope;
  },
};
