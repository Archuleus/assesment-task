const express = require('express');
const router = express.Router();
const { nftAnalytics } = require('../controllers/tokenController');

router.get('/nft-analytics', nftAnalytics);

module.exports = router;
