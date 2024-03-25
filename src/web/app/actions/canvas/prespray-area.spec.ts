import presprayArea from './prespray-area';

const mockGetWidth = jest.fn();
const mockGetHeight = jest.fn();
const mockGetRotaryExpansion = jest.fn();
jest.mock('app/svgedit/workarea', () => ({
  get width() {
    return mockGetWidth();
  },
  get height() {
    return mockGetHeight();
  },
  get rotaryExpansion() {
    return mockGetRotaryExpansion();
  },
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    editor: {
      prespray_area: 'Prespray Area',
    },
  },
}));

const mockRequestAnimationFrame = jest.fn();

// jest.mock('app/icons/prespray.svg?url', () => 'presprayIconUrl');

describe('test canvas/prespray-area', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetWidth.mockReturnValue(4300);
    mockGetHeight.mockReturnValue(4000);
    mockGetRotaryExpansion.mockReturnValue([0, 0]);
    mockRequestAnimationFrame.mockImplementation((cb) => cb());
    window.requestAnimationFrame = mockRequestAnimationFrame;
    document.body.innerHTML = '<svg id="fixedSizeSvg"><g class="layer" data-module="5"></g></svg>';
  });

  test('generate prespray area', () => {
    presprayArea.generatePresprayArea();
    expect(document.getElementById('fixedSizeSvg').innerHTML).toMatchSnapshot();
    expect(document.getElementById('presprayArea')).not.toBeNull();
    expect(document.getElementById('presprayArea').getAttribute('display')).not.toBe('none');
  });

  test('toggle prespray area', () => {
    presprayArea.generatePresprayArea();
    expect(document.getElementById('presprayArea')).not.toBeNull();
    document.querySelector('.layer').setAttribute('display', 'none');
    presprayArea.togglePresprayArea();
    console.log(document.body.innerHTML);
    expect(document.getElementById('presprayArea').getAttribute('display')).toBe('none');
  });

  test('checkMouseTarget', () => {
    presprayArea.generatePresprayArea();
    const mouseTarget = document.getElementById('presprayArea');
    expect(presprayArea.checkMouseTarget(mouseTarget)).toBe(true);
    const mouseTarget2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    expect(presprayArea.checkMouseTarget(mouseTarget2)).toBe(false);
  });

  test.only('drag prespray area', () => {
    presprayArea.generatePresprayArea();
    expect(presprayArea.getPosition()).toEqual({ x: 4000, y: 2400, w: 300, h: 300 });
    presprayArea.startDrag();
    presprayArea.drag(-1000, -1000);
    expect(presprayArea.getPosition()).toEqual({ x: 3000, y: 1400, w: 300, h: 300 });
    presprayArea.drag(-3000, -3000);
    expect(presprayArea.getPosition()).toEqual({ x: 1000, y: 0, w: 300, h: 300 });
    presprayArea.startDrag();
    presprayArea.drag(100, 100);
    expect(presprayArea.getPosition()).toEqual({ x: 1100, y: 100, w: 300, h: 300 });
    presprayArea.drag(10000, 10000);
    expect(presprayArea.getPosition()).toEqual({ x: 4000, y: 3700, w: 300, h: 300 });
  });
});
