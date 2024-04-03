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

const addBooking = async (req, res) => {
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
};

module.exports = { addBooking };
