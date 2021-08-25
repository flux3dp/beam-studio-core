import { IMediaTutorial } from 'interfaces/ITutorial';

export const gestureIntroduction: IMediaTutorial[] = [
  {
    mediaSrc: 'img/left-bar/icon-cursor.svg',
    description: 't2 fingers press and drag to track the canvas',
  },
  {
    mediaSrc: 'img/icon.png',
    description: 'tPinch to zoom in/out canvas',
  },
  {
    mediaSrc: 'img/icon.png',
    description: 'tTap to Select the Object.',
  },
  {
    mediaSrc: 'img/icon.png',
    description: 'tDrag to Select Multiple Objects.',
  },
  {
    isVideo: true,
    mediaSrc: 'video/bb_focus.webm',
    description: 'Press and Hold Timer to Open Context Menu',
  },
];

export default {
  gestureIntroduction,
};
