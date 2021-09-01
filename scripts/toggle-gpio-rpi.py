#!/usr/bin/python
import RPi.GPIO as GPIO, sys
pinNum = int(sys.argv[1])
output = int(sys.argv[2])
pinNumberingType = GPIO.BOARD # BOARD
GPIO.setwarnings(False)
GPIO.setmode(pinNumberingType)
GPIO.setup(pinNum, GPIO.OUT)
GPIO.output(pinNum, output)