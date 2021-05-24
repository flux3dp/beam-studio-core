/**
 * initialize machine helper
 */
import settings from 'app/app-settings';
import storage from 'implementations/storage';
import { IDeviceInfo } from 'interfaces/IDevice';

var methods = {
    reset: function(callback) {
        callback = ('function' === typeof callback ? callback : function() {});
        storage.set('printer-is-ready', false)
        callback();
    },
    completeSettingUp: function(redirect) {
        let d = $.Deferred();
        var completed = methods.hasBeenCompleted();

        redirect = ('boolean' === typeof redirect ? redirect : true);

        // add laser-default
        storage.set('laser-defaults', JSON.stringify(settings.laser_default));

        storage.set('printer-is-ready', true);
        (function() {
          methods.settedPrinter.add(
              methods.settingPrinter.get()
          );

          methods.settingPrinter.clear();
          methods.settingWifi.clear();

          if (true === redirect) {
              location.hash = '#studio/beambox';
          }
          d.resolve();
        })();
        return d.promise();
    },
    hasBeenCompleted: function() {
        // If you initialized before and you're not in initialization screen
        return storage.get('printer-is-ready') && (!~location.href.indexOf('initialize/'));
    },
    settingPrinter: {
        get: function() {
            return storage.get('setting-printer');
        },
        set: function(printer) {
            storage.set('setting-printer', printer);
        },
        clear: function() {
            storage.removeAt('setting-printer');
        }
    },
    settedPrinter: {
        get: function(): any[] {
            return storage.get('printers') as unknown as any[];
        },
        set: function(printers) {
            storage.set('printers', printers);
        },
        add: function(printer) {
            var settedPrinters = methods.settedPrinter.get(),
                findPrinter = function(existingPrinter) {
                    return existingPrinter.uuid === printer.uuid;
                };

            if ('object' === typeof printer && false === settedPrinters.some(findPrinter)) {
                settedPrinters.push(printer);
            }

            storage.set('printers', JSON.stringify(settedPrinters));
        },
        removeAt: function(printer) {
            var settedPrinters = methods.settedPrinter.get(),
                survivalPrinters = [];

            settedPrinters.forEach(function(el) {
                if (el.uuid !== printer.uuid) {
                    survivalPrinters.push(el);
                }
            });

            methods.settedPrinter.set(survivalPrinters);
        },
        clear: function() {
            storage.removeAt('printers');
        }
    },
    settingWifi: {
        get: function() {
            return storage.get('setting-wifi') || {};
        },
        set: function(wifi) {
            storage.set('setting-wifi', wifi);
        },
        clear: function() {
            storage.removeAt('setting-wifi');
        }
    },
    defaultPrinter: {
        set: function(printer) {
          storage.set('default-printer', JSON.stringify(printer));
        },
        exist: function() {
            var defaultPrinter = storage.get('default-printer') || {};

            return ('string' === typeof defaultPrinter['uuid']);
        },
        get: function(): IDeviceInfo {
            const defaultDevice = (storage.get('default-printer') || {}) as IDeviceInfo;
            return defaultDevice;
        },
        clear: function() {
          storage.removeAt('default-printer');
        }
    }
};

export default methods;
