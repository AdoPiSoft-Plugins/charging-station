import sys
import time

pinNum = int(sys.argv[1])
output = int(sys.argv[2])

gpio_path = "/sys/class/gpio"
export_path = gpio_path + "/export"
value_path = gpio_path + "/gpio" + str(pinNum) + "/value"
direction_path = gpio_path + "/gpio" + str(pinNum) + "/direction"

try:
    export_file = open(export_path, "w")
    export_file.write(str(pinNum))
    export_file.close()
except:
    pass

direction_file = open(direction_path, "w")
direction_file.write("out")
direction_file.close()

gpio_value_file = open(value_path, "w")
gpio_value_file.write(str(output))
gpio_value_file.close()


