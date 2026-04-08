import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChartBar, faDollarSign, faUsers } from '@fortawesome/free-solid-svg-icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const BookingReportsModal = ({ bookings, onClose }) => {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Booking Reports</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>
          <p>No data available to generate reports.</p>
        </div>
      </div>
    );
  }

  // --- Data Processing for Charts ---

  // 1. Bookings by Status
  const statusCounts = bookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // 2. Revenue per Tour
  const revenueByTour = bookings.reduce((acc, booking) => {
    if (booking.status === 'Payment Confirmed' || booking.status === 'Trip Completed') {
      acc[booking.tour_name] = (acc[booking.tour_name] || 0) + (booking.total_amount || 0);
    }
    return acc;
  }, {});
  const revenueData = Object.keys(revenueByTour).map(key => ({ name: key, revenue: revenueByTour[key] }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl h-5/6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Booking Reports</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bookings by Status Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center"><FontAwesomeIcon icon={faChartBar} className="mr-2" />Bookings by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Tour Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center"><FontAwesomeIcon icon={faDollarSign} className="mr-2" />Revenue by Tour</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReportsModal;
