'use strict'
import { start, closeGripperAndWait, openGripperAndWait } from './robotiq'

start(() => {
    console.log('Gripper is ready to use')
    setTimeout(() => {
        closeGripperAndWait(() => {
            console.log('gripper open')
            openGripperAndWait()
        })
    }, 1000)

})