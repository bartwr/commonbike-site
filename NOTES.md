== install postgress local for testing local blockchain (20191103)

sudo apt-get purge -y postgres*
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt install postgresql-10
sudo -u postgres createuser --createdb lisk
sudo -u postgres -i createdb lisk_dev --owner lisk
sudo -u postgres psql -d lisk_dev -c "alter user lisk with password 'lisk123';"
sudo nano /etc/postgresql/10/main/postgresql.conf
-> max_connections = 200
sudo -u postgres createuser --createdb marcb
sudo -u postgres psql -d lisk_dev -c "alter user marcb with password 'lisk123';"
npm run startdev
(needs nodemon)

