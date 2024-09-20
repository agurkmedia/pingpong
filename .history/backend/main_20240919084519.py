from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from threading import Thread
import time
from opcua import Server

# FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulate GPIO and PWM
class GPIOSimulator:
    BCM = "BCM"
    OUT = "OUT"

    def setmode(self, mode):
        print(f"GPIO mode set to: {mode}")

    def setup(self, pin, mode):
        print(f"GPIO pin {pin} set up as {mode}")

    def cleanup(self):
        print("GPIO cleaned up")

class PWMSimulator:
    def __init__(self, pin, frequency):
        self.pin = pin
        self.frequency = frequency
        print(f"PWM initialized on pin {pin} with frequency {frequency}Hz")

    def start(self, duty_cycle):
        print(f"PWM started with {duty_cycle}% duty cycle")

    def ChangeDutyCycle(self, duty_cycle):
        print(f"PWM duty cycle changed to {duty_cycle}%")

    def stop(self):
        print("PWM stopped")

try:
    import RPi.GPIO as GPIO
except ImportError:
    print("Running on a non-Raspberry Pi system. Using GPIO simulator.")
    GPIO = GPIOSimulator()

# Set up GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(25, GPIO.OUT)
pwm = PWMSimulator(25, 50)
pwm.start(0)

# Shared variables
shared_variables = {
    'speed_percentage': 50,
    'min_angle': -45,
    'max_angle': 45,
    'stop': True
}

# OPC UA server setup
server = Server()
server.set_endpoint("opc.tcp://0.0.0.0:4840/freeopcua/server/")
namespace = server.register_namespace("ServoControl")

objects = server.get_objects_node()
servo_obj = objects.add_object(namespace, "ServoControl")
start_servo_var = servo_obj.add_variable(namespace, "StartServo", False)
speed_percentage_var = servo_obj.add_variable(namespace, "SpeedPercentage", 50)
min_angle_var = servo_obj.add_variable(namespace, "MinSweepAngle", -45)
max_angle_var = servo_obj.add_variable(namespace, "MaxSweepAngle", 45)

start_servo_var.set_writable()
speed_percentage_var.set_writable()
min_angle_var.set_writable()
max_angle_var.set_writable()

def angle_to_duty_cycle(angle):
    return 2.5 + (angle + 60) * (10 / 120)

def continuous_sweep(variables):
    try:
        while not variables['stop']:
            min_duty = angle_to_duty_cycle(variables['min_angle'])
            max_duty = angle_to_duty_cycle(variables['max_angle'])
            delay = (100 - variables['speed_percentage']) / 1000.0

            for duty_cycle in range(int(min_duty * 10), int(max_duty * 10) + 1):
                if variables['stop']:
                    break
                current_duty = duty_cycle / 10.0
                pwm.ChangeDutyCycle(current_duty)
                time.sleep(delay)

            for duty_cycle in range(int(max_duty * 10), int(min_duty * 10) - 1, -1):
                if variables['stop']:
                    break
                current_duty = duty_cycle / 10.0
                pwm.ChangeDutyCycle(current_duty)
                time.sleep(delay)
    
    except Exception as e:
        print(f"Error in sweeping: {e}")
    finally:
        pwm.ChangeDutyCycle(0)

def opcua_monitor():
    global shared_variables
    running = False
    while True:
        try:
            start_servo = start_servo_var.get_value()
            speed_percentage = speed_percentage_var.get_value()
            min_angle = min_angle_var.get_value()
            max_angle = max_angle_var.get_value()

            shared_variables['speed_percentage'] = speed_percentage
            shared_variables['min_angle'] = min_angle
            shared_variables['max_angle'] = max_angle

            if start_servo and not running:
                shared_variables['stop'] = False
                print(f"Starting servo with speed: {speed_percentage}%, min_angle: {min_angle}, max_angle: {max_angle}")
                sweep_thread = Thread(target=continuous_sweep, args=(shared_variables,))
                sweep_thread.start()
                running = True
            elif not start_servo and running:
                shared_variables['stop'] = True
                print("Stopping servo.")
                running = False

        except Exception as e:
            print(f"Error in OPC UA monitor: {e}")

        time.sleep(0.1)

# FastAPI models and endpoints
class ServoControl(BaseModel):
    start: bool
    speed_percentage: int
    min_angle: int
    max_angle: int

@app.post("/api/control_servo")
async def control_servo(servo: ServoControl, background_tasks: BackgroundTasks):
    start_servo_var.set_value(servo.start)
    speed_percentage_var.set_value(servo.speed_percentage)
    min_angle_var.set_value(servo.min_angle)
    max_angle_var.set_value(servo.max_angle)
    
    return {"message": "Servo control updated"}

@app.get("/api/servo_status")
async def servo_status():
    return {
        "start": start_servo_var.get_value(),
        "speed_percentage": speed_percentage_var.get_value(),
        "min_angle": min_angle_var.get_value(),
        "max_angle": max_angle_var.get_value()
    }

# Start OPC UA server and monitor thread
server.start()
print("OPC UA Server started at opc.tcp://0.0.0.0:4840/freeopcua/server/")
monitor_thread = Thread(target=opcua_monitor)
monitor_thread.start()

# FastAPI startup and shutdown events
@app.on_event("startup")
async def startup_event():
    print("FastAPI server started")

@app.on_event("shutdown")
async def shutdown_event():
    shared_variables['stop'] = True
    monitor_thread.join()
    server.stop()
    GPIO.cleanup()
    pwm.stop()
    print("Cleaned up and exited.")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)