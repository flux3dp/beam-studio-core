/**
 * API image tracer
 * Ref: none
 */
import beamboxStore from 'app/stores/beambox-store';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import Websocket from 'helpers/websocket';
import { DataType, writeData } from 'helpers/laser-config-helper';

export default function() {
    var ws = Websocket({
            method: 'push-studio',
            onMessage: (data) => {
                events.onMessage(data);
            },
            onError: (response) => {
                events.onError(response);
            },
            onFatal: (response) => {
                events.onFatal(response);
            }
        }),
        events = {
            onMessage   : (data) => {
                if(data.svg) {
                    FnWrapper.insertSvg(data.svg, () => {
                        if (data.layerData) {
                            const layerDataJSON = JSON.parse(data.layerData);

                            for (let layerName in layerDataJSON) {
                                const {
                                    name,
                                    speed,
                                    power
                                } = layerDataJSON[layerName];

                                writeData(name, DataType.speed, parseInt(speed));
                                writeData(name, DataType.strength, parseInt(power));
                            }

                            beamboxStore.emitUpdateLaserPanel();
                        }
                    });
                }

                setTimeout(() => {
                    if (data.layerData) {
                        const layerDataJSON = JSON.parse(data.layerData);

                        for (let layerName in layerDataJSON) {
                            const {
                                name,
                                speed,
                                power
                            } = layerDataJSON[layerName];

                            writeData(name, DataType.speed, parseInt(speed));
                            writeData(name, DataType.strength, parseInt(power));
                        }

                        beamboxStore.emitUpdateLaserPanel();
                    }
                }, 1000);
            },
            onError     : (response: any) => { console.log('IP_ERROR'); },
            onFatal     : (response: any) => { console.log('FATAL'); },
            onOpen      : (response: any) => { console.log('Open interprocess socket! '); }
        };

    return {
        connection: ws,
    };
};
