"use strict";
const express = require("express");
const os = require("os");

const router = express.Router();

/**
 * GET /ajax/getServerIp
 * Returns the IP address of the server.
 */
router.get("/", (req, res) => {
  const interfaces = os.networkInterfaces();
  const ips = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs) {
      ips.push({
        interface: name,
        address: addr.address,
        family: addr.family, // 'IPv4' or 'IPv6'
        internal: addr.internal,
      });
    }
  }

  res.json({
    ip: ips,
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
  });
});

module.exports = router;
