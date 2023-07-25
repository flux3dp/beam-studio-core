export default {
  shape: [
    {
      name: 'Circle',
      jsonMap: {
        element: 'ellipse',
        attr: {
          cx: 250,
          cy: 250,
          rx: 250,
          ry: 250,
          'data-ratiofixed': true,
        },
      },
    },
    {
      name: 'Triangle',
      jsonMap: {
        element: 'polygon',
        attr: {
          cx: 250,
          cy: 288.675,
          shape: 'regularPoly',
          sides: 3,
          orient: 'x',
          edge: 500,
          angle_offset: -Math.PI / 2,
          points: ['250,0', '500,433.013', '0,433.013', '250,0'],
          'data-ratiofixed': true,
        },
      },
    },
    {
      name: 'Square1',
      jsonMap: {
        element: 'rect',
        attr: {
          width: 500,
          height: 500,
          'data-ratiofixed': true,
        },
      },
    },
    {
      name: 'Square2',
      jsonMap: {
        element: 'rect',
        attr: {
          width: 500,
          height: 500,
          rx: 50,
          'data-ratiofixed': true,
        },
      },
    },
    {
      name: 'Pentagon',
      jsonMap: {
        element: 'polygon',
        attr: {
          cx: 250,
          cy: 262.851,
          shape: 'regularPoly',
          sides: 5,
          orient: 'x',
          edge: 309,
          angle_offset: -Math.PI / 2,
          points: [
            '250,0',
            '499.986,181.626',
            '404.5,475.502',
            '95.5,475.502',
            '0.014,181.626',
            '250,0',
          ],
          'data-ratiofixed': true,
        },
      },
    },
    {
      name: 'Hexagon',
      jsonMap: {
        element: 'polygon',
        attr: {
          cx: 250,
          cy: 216.5,
          shape: 'regularPoly',
          sides: 6,
          orient: 'x',
          edge: 250,
          points: [
            '500,216.5',
            '375,433.006',
            '125,433.006',
            '0,216.5',
            '125,-0.006',
            '375,-0.006',
            '500,216.5',
          ],
          'data-ratiofixed': true,
        },
      },
    },
    {
      name: 'Octagon',
      jsonMap: {
        element: 'polygon',
        attr: {
          cx: 250,
          cy: 250,
          shape: 'regularPoly',
          sides: 8,
          orient: 'x',
          edge: 207.1,
          angle_offset: -Math.PI / 8,
          points: [
            '499.9836426,146.4499969',
            '499.9836426,353.5499878',
            '353.541748,499.9918213',
            '146.4418945,499.9918213',
            '0,353.5499878',
            '0,146.4499969',
            '146.4418945,0.0081856',
            '353.541748,0.0081856',
            '499.9836426,146.4499969',
          ],
          'data-ratiofixed': true,
        },
      },
    },
    { name: 'Semicircle' },
    { name: 'Quadrant' },
    { name: 'Sector' },
    { name: 'Parallelogram' },
    { name: 'Trapezoid' },
    { name: 'Ring' },
    { name: 'Tablet' },
    { name: 'Capsule' },
    { name: 'Arch' },
  ],
  graphics: [
    { name: 'Star1' },
    { name: 'Star2' },
    { name: 'Star3' },
    { name: 'Star4' },
    { name: 'Heart1' },
    { name: 'Heart2' },
    { name: 'Heart3' },
    { name: 'Heart4' },
    { name: 'ScallopCircle1' },
    { name: 'ScallopCircle2' },
    { name: 'Drop' },
    { name: 'Diamond' },
    { name: 'Sparkle' },
    { name: 'Crescent1' },
    { name: 'Crescent2' },
    { name: 'Check' },
    { name: 'Sun' },
    { name: 'Lightning' },
    { name: 'Cloud' },
    { name: 'Plus' },
    { name: 'Minus' },
    { name: 'Multiply' },
    { name: 'Divide' },
    { name: 'Equal' },
  ],
  arrow: [
    { name: 'Chevron' },
    { name: 'Navigator' },
    { name: 'Arrow1' },
    { name: 'Arrow2' },
    { name: 'Arrow3' },
    { name: 'DoubleArrow' },
  ],
  label: [
    { name: 'Ribbon1' },
    { name: 'Ribbon2' },
    { name: 'Wave' },
    { name: 'Label1' },
    { name: 'Label2' },
    { name: 'Label3' },
    { name: 'Ticket' },
    { name: 'SpeechBubble1' },
    { name: 'SpeechBubble2' },
  ],
  line: [
    {
      name: 'Straight',
      jsonMap: {
        element: 'line',
        attr: {
          x1: 250,
          y1: 0,
          x2: 250,
          y2: 500,
          stroke: '#000',
          fill: 'none',
          style: 'pointer-events:none',
        },
      },
    },
    {
      name: 'Curve',
      jsonMap: {
        element: 'path',
        attr: {
          d: 'M500,250 C500,112 388,0 250,0 C112,0 0,112 0,250',
          stroke: '#000',
          fill: 'none',
          'data-ratiofixed': true,
          style: 'pointer-events:none',
        },
      },
    },
    {
      name: 'Angle',
      jsonMap: {
        element: 'path',
        attr: {
          d: 'M500,433.333 L250,0 L0,433.333',
          stroke: '#000',
          fill: 'none',
          'data-ratiofixed': true,
          style: 'pointer-events:none',
        },
      },
    },
    {
      name: 'Staple1',
      jsonMap: {
        element: 'path',
        attr: {
          d: 'M0,250 L0,0 L500,0 L500,250',
          stroke: '#000',
          fill: 'none',
          'data-ratiofixed': true,
          style: 'pointer-events:none',
        },
      },
    },
    {
      name: 'Staple2',
      jsonMap: {
        element: 'path',
        attr: {
          d: 'M0,250 L0,83.3333313 C0,37.3096658 37.3096658,0 83.3333313,0 L416.6666567,0 C462.689989,0 500,37.3096658 500,83.3333313 L500,250',
          stroke: '#000',
          fill: 'none',
          'data-ratiofixed': true,
          style: 'pointer-events:none',
        },
      },
    },
  ],
};
