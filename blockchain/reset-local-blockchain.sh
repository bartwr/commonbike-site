sudo -u postgres psql -c "drop database lisk_dev;"
sudo -u postgres psql -c "CREATE DATABASE lisk_dev OWNER lisk;";
rm -f ../app/imports/api/lisk-blockchain/tests/accounts/*.json