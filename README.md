# Minis Walldorf Siedlerspiel


## Info for Development & Deployment

*PHP-Version:* >=8.0

*MySQL-Version:* 5.7

Steps:
1. Adjust `/config/config.json` to fit your needs (options and explantions are explained on top)
2. Create an empty MySQL database and a user which has data & structure rights and additionally `REFERENCES` for the created DB
3. Put the connection info of the DB into `/config/DBConfig.php`
4. call `http://server-address/ajax/clearDB.php` and `http://server-address/ajax/initDB.php` to initialize/reset database
5. go to `http://server-address` to get into the login page

## Deployment on MacOS

Prerequesits:

- MAMP (PHP Server with MySQL and phpMyAdmin frontend)

Steps:
1. Start MAMP, check PHP (Main Window) and MySQL (Preferences => Server) Versions and check directory (main window)
2. Start MAMP Server => Top Right
3. Go to [phpMyAdmin](http://localhost/phpMyAdmin5/), create database and user (in database => Rights) if necessary
4. Go to [localhost](http://localhost) and click `initialize Database`
5. Have Fun

## Future Development

**Feature idea:** Admin overview uneffected by hiding inventory and points with  calculated defence probability