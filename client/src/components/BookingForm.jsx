import React, { useState } from 'react';
import axios from 'axios';
import './BookingForm.css'; // Ensure this path is correct

const BookingForm = () => {
    const [formData, setFormData] = useState({
        userEmail: '',
        roomId: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Combine date and time for start and end
        const startDateTime = `${formData.startDate}T${formData.startTime}`;
        const endDateTime = `${formData.endDate}T${formData.endTime}`;

        // Prepare data to send
        const dataToSend = {
            userEmail: formData.userEmail,
            roomId: formData.roomId,
            startTime: startDateTime,
            endTime: endDateTime
        };

        try {
            const response = await axios.post('http://localhost:3001/api/bookings/', dataToSend);
            console.log('Booking created:', response.data);
            alert('Booking created successfully!');
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('Error creating booking. Please try again.');
        }
    };

    return (
        <div class="form-container">
    <form onSubmit={handleSubmit} class="booking-form">

        <div class="form-group">
            <label>User Email:</label>
            <input type="email" name="userEmail" value={formData.userEmail} onChange={handleChange} required />
        </div>

        <div class="form-group">
            <label>Room ID:</label>
            <input type="number" name="roomId" value={formData.roomId} onChange={handleChange} required />
        </div>

        <div class="form-group">
            <label>Start Date:</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
        </div>

        <div class="form-group">
            <label>Start Time:</label>
            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
        </div>

        <div class="form-group">
            <label>End Date:</label>
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
        </div>

        <div class="form-group">
            <label>End Time:</label>
            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
        </div>
        <div class="form-group">
            <button type="submit" class="book-room-button">Book Room</button>
        </div>
    </form>
</div>

    );
};

export default BookingForm;
