== setup for the Concox BL10 lock

set the backend server url in the bl10 lock by SMS:

server,1,<serverurl>,7777,0#

[usage -> server,url(0)/ip address(1),serverurl/ip,port,tcp(0)/udp(1)#]
You will receive an SMS in return with the text "OK"

speedup heartbeat by SMS:

hbt,1#

[usage -> hbt,interval in minutes#]
You will receive an SMS in return with the text "OK"

