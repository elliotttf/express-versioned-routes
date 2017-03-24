'use strict';

const express = require('express');

const router = express.Router();
module.exports = router;

router.get('/users', (req, res) => res.send({ version: req.version }));

