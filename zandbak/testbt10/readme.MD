## how to get this working

make your test server (laptop) accessible from the internet
-> mapped router port 7777 to laptop local port 3000

setup the BL10 to use your own createServer -> send SMS to lock

    SERVER,0,<serverip>,7777,0#

or:

    SERVER,1,<serverurl>,7777,0#

[usage -> server,url(0)/ip address(1),serverurl/ip,port,tcp(0)/udp(1)#]

speedup heartbeat  -> send SMS to lock
hbt,1#
[usage -> hbt,interval in minutes#]

start server
node index.js


NOTES:

- In the docs it sais that 'Language' should be part of the 'lengthOfDataBit' and 'errorCheck'. This is not correct. Related document: 'BL10 GPS tracker communication protocolV1.0.8  20180408.pdf'.

