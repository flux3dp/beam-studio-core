import { useEffect } from 'react';

interface Props {
  predicate: (e: KeyboardEvent) => boolean;
  keyDown?: () => void;
  keyUp?: () => void;
}

/* eslint-disable import/prefer-default-export */
export const useKeyDown = ({ predicate, keyDown, keyUp }: Props): void => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (predicate(e)) {
        e.preventDefault();
        keyDown();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (predicate(e)) {
        keyUp();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [keyDown, keyUp, predicate]);
};
