'use strict';

var _robotiq = require('./robotiq');

(0, _robotiq.start)(function () {
    console.log('Gripper is ready to use');
    setTimeout(function () {
        (0, _robotiq.closeGripperAndWait)(function () {
            console.log('gripper open');
            (0, _robotiq.openGripperAndWait)();
        });
    }, 1000);
});