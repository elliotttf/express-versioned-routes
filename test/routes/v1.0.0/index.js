'use strict';

const express = require('express');

const router = module.exports = express.Router();

router.get('/users', (req, res) => res.send({ version: req.version }));

