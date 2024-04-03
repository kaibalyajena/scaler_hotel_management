// import React from 'react';
// import BookingForm from './components/BookingForm';

// function App() {
//   return (
//     <div className="App">
//       <h1>Hotel Booking System</h1>
//       <BookingForm />
//     </div>
//   );
// }

// export default App;


import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import BookingForm from './components/BookingForm'; // Path to your BookingForm component
import BookingsView from './components/BookingsView'; // Path to your BookingsView component

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/api/bookings">Create Booking</Link>
            </li>
            <li>
              <Link to="/">View Bookings</Link>
            </li>
          </ul>
        </nav>
        
        {/* A <Routes> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Routes>
          <Route path="/api/bookings" element={<BookingForm />} />
          <Route path="/" element={<BookingsView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

