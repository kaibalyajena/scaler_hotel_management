
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BookingsView.css';

const BookingsView = () => {
  const [bookings, setBookings] = useState([]);
  const [roomType, setRoomType] = useState('');
  const [roomId, setRoomId] = useState('');
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    userEmail: '',
    roomId: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/`, {
          params: {
            roomType: roomType,
            roomId: roomId
          }
        });
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, [roomType, roomId]);

  function formatDateTime(dateTimeStr) {
    const dateTime = new Date(dateTimeStr);
    return `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString()}`;
}


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'roomType') {
      setRoomType(value);
    } else if (name === 'roomId') {
      setRoomId(value);
    }
  };

    const handleCancelBooking = async (bookingId) => {
    try {
      const response = await axios.delete(`http://localhost:3001/delete/${bookingId}`);
      alert(response.data.message + ' Refund Amount: ' + response.data.refundAmount);
      // Refresh the bookings list after cancellation
      const updatedBookings = bookings.filter(booking => booking.booking_id !== bookingId);
      setBookings(updatedBookings);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Error cancelling booking. Please try again.');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleEditClick = (booking) => {
    setEditingBookingId(booking.booking_id);
    setEditFormData({
      userEmail: booking.user_email,
      roomId: booking.room_id,
      startTime: booking.start_time,
      endTime: booking.end_time
    });
  };

  const handleCancelEdit = () => {
    setEditingBookingId(null);
  };

//   const handleUpdateBooking = async (bookingId) => {
//     try {
//       const response = await axios.put(`http://localhost:3001/update/${bookingId}`, editFormData);
//       alert(response.data.message + ' New Price: ' + response.data.newPrice);
//       setEditingBookingId(null);
//       // Refresh the bookings list after update
//       const updatedBookings = [...bookings];
//       const index = updatedBookings.findIndex(booking => booking.booking_id === bookingId);
//       updatedBookings[index] = {
//         ...updatedBookings[index],
//         ...editFormData
//       };
//       setBookings(updatedBookings);
//     } catch (error) {
//       console.error('Error updating booking:', error);
//       alert('Error updating booking. Please try again.');
//     }
//   };

  const handleUpdateBooking = async (bookingId) => {
    try {
      const response = await axios.put(`http://localhost:3001/update/${bookingId}`, editFormData);
      alert(response.data.message + ' New Price: ' + response.data.newPrice);
      setEditingBookingId(null);
      // Refresh the page after update
      window.location.reload();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error updating booking. Please try again.');
    }
  };


  return (
    <div class="booking-container">
        <h2>All Bookings</h2>
        <div class="filter-section">
            <label>
                Room Type:
                <input type="text" name="roomType" value={roomType} onChange={handleFilterChange} />
            </label>
        </div>
        <div class="filter-section">
            <label>
                Room ID:
                <input type="text" name="roomId" value={roomId} onChange={handleFilterChange} />
            </label>
        </div>
        <ul class="booking-list">
            {bookings.map((booking) => (
                <li key={booking.booking_id} class="booking-item">
                    {editingBookingId === booking.booking_id ? (
                        <div class="edit-form">
                            <div class="form-field">
                                <label>
                                    User Email:
                                    <input type="email" name="userEmail" value={editFormData.userEmail} onChange={handleEditChange} />
                                </label>
                            </div>
                            <div class="form-field">
                                <label>
                                    Room ID:
                                    <input type="number" name="roomId" value={editFormData.roomId} onChange={handleEditChange} />
                                </label>
                            </div>
                            <div class="form-field">
                                <label>
                                    Start Time:
                                    <input type="datetime-local" name="startTime" value={editFormData.startTime} onChange={handleEditChange} />
                                </label>
                            </div>
                            <div class="form-field">
                                <label>
                                    End Time:
                                    <input type="datetime-local" name="endTime" value={editFormData.endTime} onChange={handleEditChange} />
                                </label>
                            </div>
                            <div class="button-group">
                                <button class="update-button" onClick={() => handleUpdateBooking(booking.booking_id)}>Update</button>
                                <button class="cancel-button" onClick={handleCancelEdit}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div class="booking-info">
                            User: {booking.user_email}   Room ID: {booking.room_id}   Start: {formatDateTime(booking.start_time)}   End: {formatDateTime(booking.end_time)}   Price: {booking.price}
                            <div class="button-group">
                                <button class="edit-button" onClick={() => handleEditClick(booking)}>Edit</button>
                                <button class="cancel-booking-button" onClick={() => handleCancelBooking(booking.booking_id)}>Cancel Booking</button>
                            </div>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    </div>

  );
};

export default BookingsView;
