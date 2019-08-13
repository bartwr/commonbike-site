 #!/usr/bin/env bash

ssh root@lisk.bike "mkdir /root/tmp-store-remote"
ssh root@lisk.bike "rm -rf /root/tmp-store-remote/*"
ssh root@lisk.bike "mkdir /root/tmp-store-remote/mongodump"

# #make a copy of remote files to tmp-store-production/uploads
ssh root@lisk.bike "rsync -avz /root/lisk-bike/image-upload/images/ /root/tmp-store-remote/images"

#copy a database dump remote database to /root/tmp-store-remote/mongodump
ssh root@lisk.bike "mongodump --db lisk-bike --forceTableScan -o /root/tmp-store-remote/mongodump/"

#remove existing local uploads
rm -rf tmp-store-local/*

#make a copy of remote files to local
rsync -avz root@lisk.bike:/root/tmp-store-remote/* tmp-store-local/

#restore database backup to local mongodb
# - do not overwrite settings collection
mongorestore --drop ./tmp-store-local/mongodump --port 3001 --nsFrom \"lisk-bike.*\" --nsTo \"meteor.*\" --nsExclude \"meteor.settings\"

#restore remote uploads to local folder
rsync tmp-store-local/images/* -avz /storage/lisk-bike/images/

#remove remote temporary storage file
# ssh root@lisk.bike "rm -rf tmp-store-remote"
