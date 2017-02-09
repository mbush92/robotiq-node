'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.start = start;
exports.closeGripperAndWait = closeGripperAndWait;
exports.openGripperAndWait = openGripperAndWait;

var _serialport = require('serialport');

var _serialport2 = _interopRequireDefault(_serialport);

var _buffer = require('buffer');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var port = new _serialport2.default('/dev/cu.usbserial-DAK1RHE7', {
    baudRate: 115200
});

var settings = {
    close: _buffer.Buffer.from([0x9, 0x10, 0x3, 0xE8, 0x0, 0x3, 0x6, 0x9, 0x0, 0x0, 0xFF, 0xFF, 0xFF, 0x42, 0x29]),
    open: _buffer.Buffer.from([0x9, 0x10, 0x3, 0xE8, 0x0, 0x3, 0x6, 0x9, 0x0, 0x0, 0x00, 0xFF, 0xFF, 0x72, 0x19]),
    readStatus: _buffer.Buffer.from([0x9, 0x3, 0x7, 0xD0, 0x0, 0x1, 0x85, 0xCF]),
    gripperActive: _buffer.Buffer.from([0x9, 0x3, 0x2, 0x31, 0x0, 0x4C, 0x15]),
    notActive: _buffer.Buffer.from([0x9, 0x3, 0x2, 0x11, 0x0, 0x55, 0xD5]),
    clear: _buffer.Buffer.from([0x09, 0x10, 0x03, 0xE8, 0x00, 0x03, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x73, 0x30]),
    set: _buffer.Buffer.from([0x09, 0x10, 0x03, 0xE8, 0x00, 0x03, 0x06, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x72, 0xE1]),
    readGripStatus: _buffer.Buffer.from([0x9, 0x3, 0x7, 0xD0, 0x0, 0x3, 0x4, 0x0E]),
    gripMoving: [0x39, 0x00],
    gripComplete: [0xf9, 0x00],
    responseOK: _buffer.Buffer.from([0x09, 0x10, 0x03, 0xe8, 0x00, 0x03, 0x01, 0x30]),
    callback: null
};

function start(callback) {

    port.on('open', function () {
        console.log('PORT is open');
        clearGripper(port, function () {
            setGripper(port, function () {
                console.log('[NOTICE] Gripper is set');
                return callback();
            });
        });
    });
}

function clearGripper(port, callback) {
    port.write(settings.clear, function (err, bytesWritten) {
        if (err) console.log('[ERROR] There is an issue writing to the device', err);
    });
    port.once('data', response);
    function response(data) {
        var responseOK = _buffer.Buffer.from([0x09, 0x10, 0x03, 0xe8, 0x00, 0x03, 0x01, 0x30]);
        console.log('[DATA]', data);
        console.log('[OK]', settings.responseOK);
        if (data.equals(responseOK)) {
            console.log('HI THERE');
            return callback();
        }
    }
}

function setGripper(port, callback) {
    port.write(settings.set, function (err) {
        if (err) console.log('[ERROR] There is an issue writing to the gripper', err);
        port.once('data', function (data) {
            if (data.equals(settings.responseOK)) {
                port.write(settings.readStatus, function (err) {
                    port.on('data', listenToActivate);
                });
            }
        });
    });

    function listenToActivate(data) {
        console.log('[Listen to activate]', data);
        if (data.equals(settings.gripperActive)) {
            port.removeListener('data', listenToActivate);
            return callback();
        } else {
            port.write(settings.readStatus);
        }
    }
}

function closeGripperAndWait(callback) {
    port.write(settings.close, function (err) {
        port.once('data', function (data) {
            if (data.equals(settings.responseOK)) {
                port.write(settings.readGripStatus);
                settings.callback = callback;
                port.on('data', listenToGripStatus);
            }
        });
    });
}

function openGripperAndWait(callback) {
    console.log('SHould be opening');
    port.write(settings.open, function (err) {
        port.once('data', function (data) {
            if (data.equals(settings.responseOK)) {
                port.write(settings.readGripStatus);
                settings.callback = callback;
                port.on('data', listenToGripStatus);
            }
        });
    });
}

function listenToGripStatus(data, callback) {
    var status = 'Complete';
    if (data[3] == 0x39) status = 'Moving';
    console.log('[Grip Status]', status);
    console.log('[POSITION]', data[7]);
    if (data[3] == settings.gripComplete[0]) {
        port.removeListener('data', listenToGripStatus);
        console.log('[Grip Status] Gripper not moving');
        if (typeof settings.callback == 'function') settings.callback();
        settings.callback = null;
        return;
    } else {
        port.write(settings.readGripStatus);
    }
}