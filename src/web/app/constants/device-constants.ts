export default {
  // Status
  STARTING: 'STARTING',
  RUNNING: 'RUNNING',
  READY: 'READY',
  PAUSING: 'PAUSING',
  PAUSED: 'PAUSED',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  BUSY: 'BUSY',
  ERROR: 'ERROR',
  ABORTED: 'ABORTED',
  UNKNOWN: 'UNKNOWN',
  COMPLETED: 'COMPLETED',
  COMPLETING: 'COMPLETING',
  FATAL: 'FATAL',
  OK: 'OK',
  IDLE: 'IDLE',
  RESUMING: 'RESUMING',
  AUTH_ERROR: 'AUTH_ERROR',
  HEAD_OFFLINE: 'HEAD_OFFLINE',
  HEAD_ERROR: 'HEAD_ERROR',
  WRONG_HEAD: 'WRONG_HEAD',
  AUTH_FAILED: 'AUTH_FAILED',
  HEADER_OFFLINE: 'HEADER_OFFLINE',
  HEADER_ERROR: 'HEADER_ERROR',
  WRONG_HEADER: 'WRONG_HEADER',
  TILT: 'TILT',
  FAN_FAILURE: 'FAN_FAILURE',
  TIMEOUT: 'TIMEOUT',
  FILAMENT_RUNOUT: 'FILAMENT_RUNOUT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  UNKNOWN_STATUS: 'UNKNOWN_STATUS',
  USER_OPERATION: 'USER_OPERATION',
  UPLOADING: 'UPLOADING',
  WAITING_HEAD: 'WAITING_HEAD',
  CORRECTING: 'CORRECTING',
  OCCUPIED: 'OCCUPIED',
  SCANNING: 'SCANNING',
  CALIBRATING: 'CALIBRATING',
  HEATING: 'HEATING',
  MONITOR_TOO_OLD: 'FLUXMONITOR_VERSION_IS_TOO_OLD',
  RESOURCE_BUSY: 'RESOURCE_BUSY',
  NOT_FOUND: 'NOT_FOUND',
  // folder
  NOT_EXIST: 'NOT_EXIST',
  PREVIEW: 'PREVIEW',
  DOWNLOAD: 'DOWNLOAD',
  UPLOAD: 'UPLOAD',
  SELECT: 'SELECT',

  // Print head
  EXTRUDER: 'EXTRUDER',
  PRINTER: 'PRINTER',
  LASER: 'LASER',

  // Command
  RESUME: 'RESUME',
  PAUSE: 'PAUSE',
  STOP: 'STOP',
  REPORT: 'REPORT',
  ABORT: 'ABORT',
  QUIT: 'QUIT',
  QUIT_TASK: 'QUIT_TASK',
  KICK: 'KICK',
  LS: 'LS',
  LOAD_FILAMENT: 'LOAD',
  LOAD_FLEXIBLE_FILAMENT: 'LOADF',
  UNLOAD_FILAMENT: 'UNLOAD',
  WORKAREA_IN_MM: {
    fbb2b: {
      maxX: 610,
      maxY: 406,
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
  },
  MOVEMENT_TEST: 'data:;base64,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',
  BEAMBOX_CAMERA_TEST: 'data:;base64,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',
  DIODE_CALIBRATION: 'data:;base64,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',
  status: {
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
  },
};
