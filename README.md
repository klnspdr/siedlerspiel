# Minis Walldorf Siedlerspiel


## Info for Development & Deployment

*NodeJS-Version:* >=22.5

Steps:
1. Adjust `/config/config.json` to fit your needs (options and explantions are explained on top)
2. Run `npm install` while in this directory
3. run `sudo npm start` (on Mac and Linux) to open a webserver on port 80, use a shell in Admin mode on Windows and leave out `sudo`
4. go to [http://localhost](http://localhost) and click `Clear Database` and then `Initialize Database`
5. let others connect using the IP shown at the bottom or the device's hostname
6. select a role

### Editing DB manually

This software is using sqlite for it's DB. An app like [https://sqlitebrowser.org/](https://sqlitebrowser.org/) lets you edit the sqlite file directly. You might have to restart the server afterwards

## Future Development

**Feature idea:** Admin overview uneffected by hiding inventory and points with  calculated defence probability