import socket
import threading
import json
import datetime

#サーバとクライアントが1対多のソケット通信プログラム（サーバ側）
#本番用（print文なし）
args = ("10.0.1.232",49200)
time = int(datetime.datetime.now().strftime("%H"))
timeout_seconds = 10
global_buf = []
json_data = []
def receive_record(connection):
	thread_buf = []
	while True:
		receive = connection.recv(4096).decode()
		if receive == "quit": 
			connection.close()
			break
		thread_buf.append(receive)
		send_message = "あなたが入力したのは「{}」ですね。".format(receive)
		connection.send(send_message.encode("utf-8"))
	global_buf.extend(thread_buf)

def make_json(data_buf):
	one_record = []
	for record in range(int(len(data_buf)/4)):
		for data_in_record in range(4):
			one_record.append(data_buf[4*(record-1)+data_in_record])
		data={"id":one_record[0],"data":one_record[1],"date":one_record[2],"time":one_record[3]}
		json_data.append(data)
		one_record.clear()
	return

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1)
if (time >= 5 and time < 9) or (time >= 11 and time < 13) or (time >= 18 and time < 21):
	timeout_seconds = 30
s.settimeout(timeout_seconds)
s.bind(args)
s.listen(10)
while True:
	try:
		connection, address = s.accept()
	except TimeoutError:
		break
	thread = threading.Thread(target=receive_record,args=(connection,))
	thread.start()
s.close()
make_json(global_buf)
print(json.dumps(json_data))