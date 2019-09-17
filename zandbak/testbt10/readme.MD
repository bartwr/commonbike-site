## how to get this working

make your test server (laptop) accessible from the internet
-> mapped router port 7777 to laptop local port 3000

setup the BL10 to use your own createServer -> send SMS to lock
server,1,<serverurl>,7777,0#
[usage -> server,url(0)/ip address(1),serverurl/ip,port,tcp(0)/udp(1)#]
You will receive an SMS in return with the text "OK"

speedup heartbeat  -> send SMS to lock
hbt,1#
[usage -> hbt,interval in minutes#]
You will receive an SMS in return with the text "OK"

start server (tested with node v10.16.3)
	npm install
	node index.js

