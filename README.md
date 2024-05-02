# Minis Walldorf Siedlerspiel


## Info for Development & Deployment

*PHP-Version:* >=8.0

Steps:
1. Adjust `/config/config.json` to fit your needs (options and explantions are explained on top)
2. Create an empty MySQL database and a user which has data & structure rights and additionally `REFERENCES` for the created DB
3. Put the connection info of the DB into `/config/DBConfig.php`
4. call `http://server-address/ajax/clearDB.php` and `http://server-address/ajax/initDB.php` to initialize/reset database
5. go to `http://server-address` to get into the login page


## Future Development

**Feature idea:** Admin overview uneffected by hiding inventory and points with  calculated defence probability

Punkte:
 - Blau 448 => 100
 - Rot 435 => 97
 - Grün 365 => 81 +15 = 96
 - Gelb 329 => 73