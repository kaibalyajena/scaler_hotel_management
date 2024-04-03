const express = require('express');
const bodyParser = require('body-parser');
const bookingsRouter = require('./routes/bookings');
const cors = require('cors'); // Assume you have this file

const app = express();
const port = 3001; // or any port you prefer
app.use(cors());
const { Pool } = require('pg');

const pool = new Pool({
    user: 'room-booking-db_owner',
    host: 'ep-wandering-tooth-a544ch40.us-east-2.aws.neon.tech',
    database: 'room-booking-db',
    password: 'KTOLGjzY54Wd',
    port: 5432,
    ssl: {
        require: true,
        rejectUnauthorized: false,
        // You may need to provide the path to the PostgreSQL server's SSL certificate
        // ca: fs.readFileSync('/path/to/ca-certificate.crt').toString()
    }
});

app.use(bodyParser.json());
app.get('/', async (req, res) => {
    let query = `
        SELECT b.booking_id, b.user_email, b.room_id, b.start_time, b.end_time, b.price 
        FROM bookings b
        JOIN rooms r ON b.room_id = r.room_id
        JOIN room_types rt ON r.type_id = rt.type_id
    `;
    const params = [];
    const { roomType, roomId } = req.query;

    if (roomType) {
        params.push(`rt.type_name = '${roomType}'`);
    }

    if (roomId) {
        params.push(`b.room_id = ${roomId}`);
    }

    if (params.length > 0) {
        query += ' WHERE ' + params.join(' AND ');
    }

    query += ' ORDER BY b.start_time ASC';

    try {
        const allBookings = await pool.query(query);
        res.json(allBookings.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.delete('/delete/:bookingId', async (req, res) => {
    const { bookingId } = req.params;

    try {
        // Fetch the booking details
        const bookingResult = await pool.query('SELECT * FROM bookings WHERE booking_id = $1', [bookingId]);
        if (bookingResult.rows.length === 0) {
            return res.status(404).send('Booking not found');
        }

        const booking = bookingResult.rows[0];
        const startTime = new Date(booking.start_time);
        const currentTime = new Date();

        // Calculate the time difference in hours
        const timeDifference = (startTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);

        let refund = 0;

        // Determine the refund amount based on the time difference
        if (timeDifference > 48) {
            refund = booking.price;
        } else if (timeDifference >= 24 && timeDifference <= 48) {
            refund = booking.price * 0.5;
        }

        // Delete the booking from the database
        await pool.query('DELETE FROM bookings WHERE booking_id = $1', [bookingId]);

        res.json({ message: 'Booking cancelled successfully', refundAmount: refund });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.put('/update/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    const { userEmail, roomId, startTime, endTime } = req.body;

    try {
        // Fetch the booking details
        const bookingResult = await pool.query('SELECT * FROM bookings WHERE booking_id = $1', [bookingId]);
        if (bookingResult.rows.length === 0) {
            return res.status(404).send('Booking not found');
        }

        const booking = bookingResult.rows[0];
        const oldStartTime = new Date(booking.start_time);
        const oldEndTime = new Date(booking.end_time);
        const newStartTime = new Date(startTime);
        const newEndTime = new Date(endTime);

        // Calculate the price based on the new start and end times
        const duration = (newEndTime.getTime() - newStartTime.getTime()) / (1000 * 60 * 60); // Duration in hours
        const roomResult = await pool.query(`
            SELECT rt.price_per_hour 
            FROM rooms r
            JOIN room_types rt ON r.type_id = rt.type_id
            WHERE r.room_id = $1
        `, [roomId]);

        if (roomResult.rows.length === 0) {
            return res.status(404).send('Room not found');
        }

        const pricePerHour = roomResult.rows[0].price_per_hour;
        const newPrice = pricePerHour * duration;

        // Update the booking details in the database
        await pool.query('UPDATE bookings SET user_email = $1, room_id = $2, start_time = $3, end_time = $4, price = $5 WHERE booking_id = $6',
            [userEmail, roomId, startTime, endTime, newPrice, bookingId]);

        res.json({ message: 'Booking updated successfully', newPrice: newPrice });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


app.post('/api/bookings', async (req,res)=>{
    const { userEmail, roomId, startTime, endTime } = req.body;

  try {
    // Calculate the total price based on the room type price per hour and duration
    const roomDetails = await pool.query('SELECT price_per_hour FROM room_types JOIN rooms ON room_types.type_id = rooms.type_id WHERE rooms.room_id = $1', [roomId]);
    
    if (roomDetails.rows.length === 0) {
      return res.status(404).send('Room not found');
    }

    const pricePerHour = roomDetails.rows[0].price_per_hour;
    const duration = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60); // duration in hours
    const totalPrice = pricePerHour * duration;

    // Check for double booking
    const checkAvailabilityQuery = `
      SELECT * FROM bookings
      WHERE room_id = $1
      AND (
        (start_time <= $2 AND end_time > $2)
        OR (start_time < $3 AND end_time >= $3)
        OR (start_time >= $2 AND end_time <= $3)
      );
    `;

    const { rows } = await pool.query(checkAvailabilityQuery, [roomId, startTime, endTime]);

    if (rows.length > 0) {
      return res.status(400).send('The room is already booked for the selected time slot.');
    }

    // Insert the new booking
    const newBooking = await pool.query(
      'INSERT INTO bookings (user_email, room_id, start_time, end_time, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userEmail, roomId, startTime, endTime, totalPrice]
    );

    res.json(newBooking.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
