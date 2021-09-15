import { IMediaTutorial } from 'interfaces/ITutorial';

export const gestureIntroduction: IMediaTutorial[] = [
  {
    mediaSrc: 'img/touch-drag.svg',
    description: 't2 fingers press and drag to track the canvas',
  },
  {
    mediaSrc: 'img/touch-zoom.svg',
    description: 'tPinch to zoom in/out canvas',
  },
  {
    isVideo: true,
    mediaSrc: 'video/touch-select.webm',
    description: 'tTap to Select the Object.',
  },
  {
    isVideo: true,
    mediaSrc: 'video/touch-multiselect.webm',
    description: 'tDrag to Select Multiple Objects.',
  },
  {
    isVideo: true,
    mediaSrc: 'video/touch-contextmenu.webm',
    description: 'Press and Hold Timer to Open Context Menu',
  },
];

export default {
  gestureIntroduction,
};
