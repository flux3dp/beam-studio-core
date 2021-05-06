/**
 * logger
 */
const loggingStore: any = {};

// NOTICE: use "NEW" operator to create object
export default function (name) {
  name = name || btoa(String(new Date().getTime()));

  return {
    clear() {
      delete loggingStore[name];
    },

    append(message) {
      if (!loggingStore[name]) {
        loggingStore[name] = [];
      }

      loggingStore[name].push(message);
      return loggingStore[name];
    },

    get() {
      return loggingStore[name];
    },

    getAll() {
      return loggingStore;
    },

    getTimeLabel() {
      const dt = new Date();
      const year = dt.getFullYear();
      const month = [0, dt.getMonth() + 1].join('').substr(-2);
      const date = [0, dt.getDate()].join('').substr(-2);
      const hour = [0, dt.getHours()].join('').substr(-2);
      const minute = [0, dt.getMinutes()].join('').substr(-2);
      const second = [0, dt.getSeconds()].join('').substr(-2);

      return `[${year}/${month}/${date} ${hour}:${minute}:${second}]`;
    },
  };
}
