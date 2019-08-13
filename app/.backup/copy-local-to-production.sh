#!/usr/bin/env bash

echo "are you sure that you want to erase all data on the production server?"
echo "if sure: disable the hardcoded exit in the script"
exit 1

mkdir tmp-store-local
rm -rf tmp-store-local/*
mkdir tmp-store-local/mongodump

# #make a copy of local files to tmp-store-production/uploads
rsync -avz /storage/lisk-bike/images/ tmp-store-local/images

#copy a database dump local database to tmp-store-local/mongodump
mongodump --port 3001 --db meteor --forceTableScan -o tmp-store-local/mongodump/

#remove existing remote uploads
ssh root@lisk.bike "rm -rf /root/tmp-store-remote/*"

#make a copy of local files to remote
rsync -avz tmp-store-local/* root@lisk.bike:/root/tmp-store-remote/

#restore database backup to remote mongodb
# - do not overwrite settings collection
ssh root@lisk.bike "mongorestore --drop /root/tmp-store-remote/mongodump --nsFrom \"meteor.*\" --nsTo \"lisk-bike.*\" --nsExclude \"lisk-bike.settings\""

#restore remote uploads to local folder
ssh root@lisk.bike "rsync /root/tmp-store-remote/images/* -avz /root/lisk-bike/images/"

#remove local temporary storage file
# rm -rf tmp-store-local
