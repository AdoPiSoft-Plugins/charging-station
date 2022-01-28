#!/usr/bin/python
import OPi.GPIO as GPIO, sys, time
import orangepi.BOARD_NAME as board

pinNum = int(sys.argv[1])
output = int(sys.argv[2])

pinNumberingType = board.BOARD # BOARD

GPIO.setwarnings(False)
GPIO.setmode(pinNumberingType)
GPIO.setup(pinNum, GPIO.OUT)
GPIO.output(pinNum, output)
