import { useEffect } from 'react';

interface Props {
  predicate: (e: MouseEvent) => boolean;
  keyDown?: () => void;
  keyUp?: () => void;
}

/* eslint-disable import/prefer-default-export */
export const useMouseDown = ({ predicate, keyDown, keyUp }: Props): void => {
  useEffect(() => {
    const handleKeyDown = (e: MouseEvent) => {
      if (predicate(e)) {
        e.preventDefault();
        keyDown();
      }
    };

    const handleKeyUp = (e: MouseEvent) => {
      if (predicate(e)) {
        keyUp();
      }
    };

    document.addEventListener('mousedown', handleKeyDown);
    document.addEventListener('mouseup', handleKeyUp);

    return () => {
      document.removeEventListener('mousedown', handleKeyDown);
      document.removeEventListener('mouseup', handleKeyUp);
    };
  }, [keyDown, keyUp, predicate]);
};
