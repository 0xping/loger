import subprocess
import time
import psutil
import sys

ft_lock_path = "/usr/local/bin/ft_lock"

def unLock():
	for proc in psutil.process_iter(['name']):
		if proc.info['name'] == 'ft_lock':
			proc.kill()

def lock():
	try:
		subprocess.run(ft_lock_path, check=True)
	except subprocess.CalledProcessError as e:
		print(f"Error: {e}")

def reLock():
	unLock()
	lock()

def is_screen_locked():
	for proc in psutil.process_iter(['name']):
		if proc.info['name'] == 'ft_lock':
			return True
	return False

if len(sys.argv) > 1:
	function_name = sys.argv[1].lower()
	if function_name == "lock":
		reLock()
	elif function_name == "unlock":
		unLock()
	else:
		print(f"Function '{function_name}' not found")
