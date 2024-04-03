const express = require('express');
const { addBooking } = require('../controllers/bookingsController'); // You need to implement this
const router = express.Router();

router.post('/', addBooking);

module.exports = router;
