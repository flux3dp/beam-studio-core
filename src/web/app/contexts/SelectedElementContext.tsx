import React, { createContext, memo, useCallback, useEffect, useState } from 'react';

import eventEmitterFactory from 'helpers/eventEmitterFactory';

const canvasEventEmitter = eventEmitterFactory.createEventEmitter('canvas');

export interface SelectedElementContextType {
  selectedElement: Element | null;
}

export const SelectedElementContext = createContext<SelectedElementContextType>({
  selectedElement: null,
});

interface Props {
  children: React.ReactNode;
}

export const SelectedElementContextProvider = memo(({ children }: Props): JSX.Element => {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);

  const handleSetSelectedElem = useCallback(
    (elem: Element): void => {
      if (elem !== selectedElement) {
        (document.activeElement as HTMLInputElement).blur();
        setSelectedElement(elem);
      }
    },
    [selectedElement]
  );

  useEffect(() => {
    canvasEventEmitter.on('SET_SELECTED_ELEMENT', handleSetSelectedElem);
  });

  return (
    <SelectedElementContext.Provider value={{ selectedElement }}>
      {children}
    </SelectedElementContext.Provider>
  );
});

export default {
  SelectedElementContext,
  SelectedElementContextProvider,
};
