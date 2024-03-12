export default {
  // Status
  READY: 'READY',
  OK: 'OK',
  // folder
  NOT_EXIST: 'NOT_EXIST',
  // workarea in mm
  WORKAREA: {
    fhexa1: {
      maxX: 740,
      maxY: 410,
    },
    fbb1p: {
      maxX: 600,
      maxY: 375,
    },
    fbb1b: {
      maxX: 400,
      maxY: 375,
    },
    fbm1: {
      maxX: 300,
      maxY: 210,
    },
    'laser-b1': {
      maxX: 300,
      maxY: 210,
    },
    'laser-b2': {
      maxX: 730,
      maxY: 410,
    },
    ado1: {
      maxX: 430,
      maxY: 300,
    }
  },
  WORKAREA_DEEP: {
    fad1: 40.5, // mm
    ado1: 40.5, // mm
  },
  status: {
    CARTDRIDGE_IO: -17,
    RAW: -10,
    SCAN: -2,
    MAINTAIN: -1,
    IDLE: 0,
    INIT: 1,
    STARTING: 4,
    RESUME_TO_STARTING: 6,
    RUNNING: 16,
    RESUME_TO_RUNNING: 18,
    PAUSED: 32,
    PAUSED_FROM_STARTING: 36,
    PAUSING_FROM_STARTING: 38,
    PAUSED_FROM_RUNNING: 48,
    PAUSING_FROM_RUNNING: 50,
    COMPLETED: 64,
    COMPLETING: 66,
    PREPARING: 68,
    ABORTED: 128,
    ABORTING: 130,
    ALARM: 256,
    FATAL: 512,
  },
  statusColor: {
    '-17': 'grey',
    '-10': 'grey',
    '-2': 'grey',
    '-1': 'orange',
    0: 'grey',
    1: 'grey',
    4: 'blue',
    6: 'blue',
    16: 'blue',
    18: 'blue',
    32: 'orange',
    36: 'orange',
    38: 'orange',
    48: 'orange',
    50: 'orange',
    64: 'green',
    66: 'blue',
    128: 'red',
    256: 'red',
    512: 'red',
  },
};
