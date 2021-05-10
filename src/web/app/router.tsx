import * as i18n from 'helpers/i18n';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import appSettings from 'app/app-settings';
import Backbone from 'backbone';
import Beambox from 'app/pages/Beambox';
import ConnectEthernet from 'app/pages/Connect-Ethernet';
import ConnectMachineIp from 'app/pages/Connect-Machine-Ip';
import ConnectWiFi from 'app/pages/Connect-Wi-Fi';
import ConnectWired from 'app/pages/Connect-Wired';
import FluxIdLogin from 'app/pages/FluxIdLogin';
import Home from 'app/pages/Home';
import NotificationCollection from 'app/views/Notification-Collection';
import SelectConnectionType from 'app/pages/Select-Connection-Type';
import SelectMachineType from 'app/pages/Select-Machine-Type';
import Settings from 'app/pages/Settings';
import SkipConnectMachine from 'app/pages/Skip-Connect-Machine';
import { AlertProgressContextProvider } from 'app/contexts/Alert-Progress-Context';
import { AlertsAndProgress } from 'app/views/dialogs/Alerts-And-Progress';
import { Dialog } from 'app/views/dialogs/Dialog';
import { DialogContextProvider } from 'app/contexts/Dialog-Context';

const _display = function(view: Function, args?, el?) {
    el = el || $('section.content')[0];
    args = args || {};
    args.props = args.props || {};
    args.state = args.state || {};

    args.state.lang = i18n.lang;
    // Shpuldn;t pass props and state using args.
    const elem = view(args);
    const component = React.createElement(elem, args.props);
    const wrappedComponent = (
        <AlertProgressContextProvider>
            <DialogContextProvider>
                { component }
                <Dialog index={0}/>
                <AlertsAndProgress/>
            </DialogContextProvider>
        </AlertProgressContextProvider>
    );
    ReactDOM.render(wrappedComponent, el);
};

export default Backbone.Router.extend({
    routes: {},

    initialize: function() {
        var router = this,
            routes = [
                // catch no match route, 404
                [/^.*$/, 'e404', this.e404],
                // initialize Flux Printer
                [
                    /^initialize\/connect\/?(flux-id-login|select-machine-type|select-connection-type|skip-connect-machine|connect-wi-fi|connect-wired|connect-ethernet|connect-machine-ip)\/?(.*)?/,
                    'initial',
                    this.initial
                ],
                // go to studio
                [
                    /^studio\/?(print|beambox|laser|scan|usb|settings|draw|cut|mill|cloud)\/?(.*)?/,
                    'studio',
                    this.studio
                ],
                // flux home
                [/^$/, 'home', this.home]
            ];

        routes.forEach(function(route) {
            router.route.apply(router, route);
        });

        this.appendNotificationCollection();
    },

    home: function(name) {
        _display(Home, {
            props: {
                supported_langs: appSettings.i18n.supported_langs
            }
        });
    },

    initial: function(step, other) {
        switch(step) {
            case 'flux-id-login':
                _display(FluxIdLogin);
                break;
            case 'select-machine-type':
                _display(
                    SelectMachineType,
                    {
                        props: {
                            other: other
                        }
                    }
                );
                break;
            case 'select-connection-type':
                _display(
                    SelectConnectionType,
                    {
                        props: {
                            other: other
                        }
                    }
                );
                break;
            case 'skip-connect-machine':
                _display(
                    SkipConnectMachine,
                    {
                        props: {
                            other: other
                        }
                    }
                )
                break;
            case 'connect-wi-fi':
                _display(
                    ConnectWiFi,
                    {
                        props: {
                            other: other
                        }
                    }
                )
                break;
            case 'connect-wired':
                _display(
                    ConnectWired,
                    {
                        props: {
                            other: other
                        }
                    }
                )
                break;
            case 'connect-ethernet':
                _display(
                    ConnectEthernet,
                    {
                        props: {
                            other: other
                        }
                    }
                )
                break;
            case 'connect-machine-ip':
                _display(
                    ConnectMachineIp,
                    {
                        props: {
                            other: other
                        }
                    }
                )
                break;
        }
    },

    appendNotificationCollection: function() {
        _display(NotificationCollection, {}, $('.notification')[0]);
    },

    studio: function(page, args) {
        args = args || '';

        var requests = args.split('/'),
            child_view = requests.splice(0, 1)[0],
            // if something needs webgl then add to the list below
            needWebGL = appSettings.needWebGL,
            map = {
                'beambox': this.beambox,
                'settings': this.settings,
                'usb': this.usb,
                'device': this.device
            },
            func = this.beambox;

        if (true === map.hasOwnProperty(page)) {
            func = map[page];
        }

        func(child_view, requests);
    },

    beambox: function() {
        _display(Beambox);
    },

    settings: function(child, requests) {
        child = (child || 'general').toLowerCase();

            var childView,
                args = {
                    child: child,
                    requests: requests
                };

            _display(Settings, args);
    },

    e404: function() {
        // TODO: handle 404
        alert('404');
    }
});
