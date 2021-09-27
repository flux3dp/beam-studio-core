import { IMediaTutorial } from 'interfaces/ITutorial';

export const gestureIntroduction: IMediaTutorial[] = [
  {
    mediaSources: [
      { src: 'img/touch-drag.svg', type: 'image/svg+xml' },
    ],
    description: 't2 fingers press and drag to track the canvas',
  },
  {
    mediaSources: [
      { src: 'img/touch-zoom.svg', type: 'image/svg+xml' },
    ],
    description: 'tPinch to zoom in/out canvas',
  },
  {
    isVideo: true,
    mediaSources: [
      { src: 'video/touch-select.webm', type: 'video/webm' },
      { src: 'video/touch-select.mov', type: 'video/quicktime' },
    ],
    description: 'tTap to Select the Object.',
  },
  {
    isVideo: true,
    mediaSources: [
      { src: 'video/touch-multiselect.webm', type: 'video/webm' },
      { src: 'video/touch-multiselect.mov', type: 'video/quicktime' },
    ],
    description: 'tDrag to Select Multiple Objects.',
  },
  {
    isVideo: true,
    mediaSources: [
      { src: 'video/touch-contextmenu.webm', type: 'video/webm' },
      { src: 'video/touch-contextmenu.mov', type: 'video/quicktime' },
    ],
    description: 'Press and Hold Timer to Open Context Menu',
  },
];

export default {
  gestureIntroduction,
};
