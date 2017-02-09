'use strict'

import SerialPort from 'serialport'
import { Buffer } from 'buffer'
import _ from 'lodash'

let port = new SerialPort('/dev/cu.usbserial-DAK1RHE7', {
    baudRate: 115200
})

let settings = {
    close: Buffer.from([0x9, 0x10, 0x3, 0xE8, 0x0, 0x3, 0x6, 0x9, 0x0, 0x0, 0xFF, 0xFF, 0xFF, 0x42, 0x29]),
    open: Buffer.from([0x9, 0x10, 0x3, 0xE8, 0x0, 0x3, 0x6, 0x9, 0x0, 0x0, 0x00, 0xFF, 0xFF, 0x72, 0x19]),
    readStatus: Buffer.from([0x9, 0x3, 0x7, 0xD0, 0x0, 0x1, 0x85, 0xCF]),
    gripperActive: Buffer.from([0x9, 0x3, 0x2, 0x31, 0x0, 0x4C, 0x15]),
    notActive: Buffer.from([0x9, 0x3, 0x2, 0x11, 0x0, 0x55, 0xD5]),
    clear: Buffer.from([0x09, 0x10, 0x03, 0xE8, 0x00, 0x03, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x73, 0x30]),
    set: Buffer.from([0x09, 0x10, 0x03, 0xE8, 0x00, 0x03, 0x06, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x72, 0xE1]),
    readGripStatus: Buffer.from([0x9, 0x3, 0x7, 0xD0, 0x0, 0x3, 0x4, 0x0E]),
    gripMoving: [0x39, 0x00],
    gripComplete: [0xf9, 0x00],
    responseOK: Buffer.from([0x09, 0x10, 0x03, 0xe8, 0x00, 0x03, 0x01, 0x30]),
    callback:null
}

export function start(callback) {

    port.on('open', () => {
        console.log('PORT is open')
        clearGripper(port, () => {
            setGripper(port, () => {
                console.log('[NOTICE] Gripper is set')
                return callback()
            })
        })
    })

}





function clearGripper(port, callback) {
    port.write(settings.clear, (err, bytesWritten) => {
        if (err) console.log('[ERROR] There is an issue writing to the device', err)

    })
    port.once('data', response)
    function response(data) {
        let responseOK = Buffer.from([0x09, 0x10, 0x03, 0xe8, 0x00, 0x03, 0x01, 0x30])
        console.log('[DATA]', data)
        console.log('[OK]', settings.responseOK)
        if (data.equals(responseOK)) {
            console.log('HI THERE')
            return callback()
        }
    }
}

function setGripper(port, callback) {
    port.write(settings.set, (err) => {
        if (err) console.log('[ERROR] There is an issue writing to the gripper', err)
        port.once('data', (data) => {
            if (data.equals(settings.responseOK)) {
                port.write(settings.readStatus, (err) => {
                    port.on('data', listenToActivate)
                })

            }
        })
    })

    function listenToActivate(data) {
        console.log('[Listen to activate]', data)
        if (data.equals(settings.gripperActive)) {
            port.removeListener('data', listenToActivate)
            return callback()
        } else {
            port.write(settings.readStatus)
        }
    }
}

export function closeGripperAndWait(callback) {
    port.write(settings.close, (err) => {
        port.once('data', (data) => {
            if (data.equals(settings.responseOK)) {
                port.write(settings.readGripStatus)
                settings.callback = callback
                port.on('data', listenToGripStatus)
            }
        })
    })


}

export function openGripperAndWait(callback) {
    console.log('SHould be opening')
    port.write(settings.open, (err) => {
        port.once('data', (data) => {
            if (data.equals(settings.responseOK)) {
                port.write(settings.readGripStatus)
                settings.callback = callback
                port.on('data', listenToGripStatus)

            }
        })

    })


}

function listenToGripStatus(data, callback) {
    let status = 'Complete'
    if (data[3] == 0x39) status='Moving'
    console.log('[Grip Status]', status)
    console.log('[POSITION]', data[7])
    if (data[3] == settings.gripComplete[0]) {
        port.removeListener('data', listenToGripStatus)
        console.log('[Grip Status] Gripper not moving')
        if (typeof (settings.callback) == 'function') settings.callback()
        settings.callback = null
        return
    } else {
        port.write(settings.readGripStatus)
    }
}
