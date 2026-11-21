import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Home, Users, Bed, Calendar, UserCheck, Utensils, LogOut, Menu, X, Plus, Edit, Trash2, Save } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// -----------------------------------------------------------
// 1. HELPER COMPONENTS (DEFINED FIRST TO AVOID REFERENCE ERRORS)
// -----------------------------------------------------------

const NavItem = ({ icon, text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-5 py-4 rounded-xl transition-all duration-300 font-semibold ${
      active 
        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`}
  >
    {icon}
    <span>{text}</span>
  </button>
);

const StatCard = ({ title, value, icon, color, bgColor }) => (
  <div className={`${bgColor} rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-semibold uppercase tracking-wider">{title}</p>
        <p className="text-4xl font-bold text-gray-800 mt-2">{value}</p>
      </div>
      <div className={`bg-gradient-to-br ${color} text-white p-4 rounded-2xl shadow-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

const ActivityItem = ({ text, time, color }) => (
  <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 border-l-4 border-transparent hover:border-blue-500">
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 ${color} bg-blue-500 rounded-full animate-pulse`}></div>
      <p className="text-sm text-gray-700 font-medium">{text}</p>
    </div>
    <p className="text-xs text-gray-500 font-semibold">{time}</p>
  </div>
);

const QuickActionBtn = ({ onClick, icon, text, color }) => (
  <button 
    onClick={onClick}
    className={`bg-gradient-to-r ${color} text-white p-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 flex flex-col items-center gap-3`}
  >
    {icon}
    <span className="font-semibold text-sm">{text}</span>
  </button>
);

const MealCard = ({ title, items, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200`}>
    <h4 className="font-bold text-gray-800 mb-3 text-lg">{title}</h4>
    <p className="text-sm text-gray-700 leading-relaxed">{items || 'Menu not set.'}</p>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}:</span>
    <span className="text-sm font-bold text-gray-800">{value}</span>
  </div>
);

const EmptyState = ({ icon, title, description, actionText, onAction }) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-12 text-center border border-gray-200">
    <div className="text-gray-400 flex justify-center mb-6">{icon}</div>
    <h3 className="text-2xl font-bold text-gray-700 mb-3">{title}</h3>
    <p className="text-gray-500 mb-6 text-lg">{description}</p>
    {onAction && (
      <button 
        onClick={onAction}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        {actionText}
      </button>
    )}
  </div>
);

const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <input 
      {...props}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <select 
      {...props}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 bg-white"
    >
      {children}
    </select>
  </div>
);


// -----------------------------------------------------------
// 2. MAIN APPLICATION COMPONENT
// -----------------------------------------------------------

const HostelManagementSystem = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user] = useState({ name: 'Hostel Admin', role: 'admin' });
  
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [messMenu, setMessMenu] = useState([]);
  const [requests, setRequests] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  
  // State for editing
  const [editingStudent, setEditingStudent] = useState(null); 
  const [editingRoom, setEditingRoom] = useState(null); // NEW STATE FOR ROOMS

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, roomsRes, menuRes, requestsRes, visitorsRes] = await Promise.all([
        axios.get(`${API_URL}/students`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/rooms`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/mess`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/requests`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/visitors`).catch(() => ({ data: [] }))
      ]);

      setStudents(studentsRes.data);
      setRooms(roomsRes.data);
      setMessMenu(menuRes.data);
      setRequests(requestsRes.data);
      setVisitors(visitorsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD Handlers ---

  // Add/Create Student
  const handleAddStudent = async (studentData) => {
    try {
      await axios.post(`${API_URL}/students`, studentData);
      fetchData();
      setShowStudentModal(false);
      alert('Student added successfully!');
    } catch (error) {
      alert('Error adding student: ' + (error.response?.data?.message || error.message));
    }
  };
  
  // Update/Edit Student
  const handleUpdateStudent = async (id, studentData) => {
    try {
      await axios.put(`${API_URL}/students/${id}`, studentData);
      fetchData();
      setEditingStudent(null);
      alert('Student updated successfully!');
    } catch (error) {
      alert('Error updating student: ' + (error.response?.data?.message || error.message));
    }
  };

  // Add Room
  const handleAddRoom = async (roomData) => {
    try {
      await axios.post(`${API_URL}/rooms`, roomData);
      fetchData();
      setShowRoomModal(false);
      setEditingRoom(null);
      alert('Room added successfully!');
    } catch (error) {
      alert('Error adding room: ' + (error.response?.data?.message || error.message));
    }
  };
  
  // Update/Edit Room (NEW HANDLER)
  const handleUpdateRoom = async (id, roomData) => {
    try {
      // NOTE: You must also implement the PUT route in your backend rooms.js file
      await axios.put(`${API_URL}/rooms/${id}`, roomData); 
      fetchData();
      setEditingRoom(null);
      alert('Room updated successfully!');
    } catch (error) {
      alert('Error updating room: ' + (error.response?.data?.message || error.message));
    }
  };

  // Add Visitor
  const handleAddVisitor = async (visitorData) => {
    try {
      await axios.post(`${API_URL}/visitors`, visitorData);
      fetchData();
      setShowVisitorModal(false);
      alert('Visitor added successfully!');
    } catch (error) {
      alert('Error adding visitor: ' + (error.response?.data?.message || error.message));
    }
  };

  // Add Menu
  const handleAddMenu = async (menuData) => {
    try {
      await axios.post(`${API_URL}/mess`, menuData);
      fetchData();
      setShowMenuModal(false);
      alert('Menu added successfully!');
    } catch (error) {
      alert('Error adding menu: ' + (error.response?.data?.message || error.message));
    }
  };

  // Delete Student
  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student? This cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/students/${id}`);
        fetchData();
        alert('Student deleted successfully!');
      } catch (error) {
        alert('Error deleting student: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // --- Views (Dashboard, Students, etc.) ---

  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value={students.length} 
          icon={<Users className="w-10 h-10" />} 
          color="from-blue-500 to-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard 
          title="Total Rooms" 
          value={rooms.length} 
          icon={<Bed className="w-10 h-10" />} 
          color="from-green-500 to-green-600"
          bgColor="bg-green-50"
        />
        <StatCard 
          title="Occupied Rooms" 
          value={rooms.filter(r => r.occupied > 0).length} 
          icon={<Bed className="w-10 h-10" />} 
          color="from-yellow-500 to-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatCard 
          title="Pending Requests" 
          value={requests.filter(r => r.status === 'pending').length} 
          icon={<Calendar className="w-10 h-10" />} 
          color="from-red-500 to-red-600"
          bgColor="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded"></div>
            Recent Activities
          </h3>
          <div className="space-y-4">
            <ActivityItem text="System started successfully" time="Just now" color="text-green-600" />
            <ActivityItem text="Dashboard loaded" time="1 minute ago" color="text-blue-600" />
            <ActivityItem text="Database connected" time="2 minutes ago" color="text-purple-600" />
            <ActivityItem text="Welcome to Hostel Management" time="Today" color="text-gray-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl p-6 border border-blue-100">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <QuickActionBtn 
              onClick={() => { setCurrentView('students'); setShowStudentModal(true); setEditingStudent(null); }}
              icon={<Plus size={24} />}
              text="Add Student"
              color="from-blue-500 to-blue-600"
            />
            <QuickActionBtn 
              onClick={() => { setCurrentView('rooms'); setShowRoomModal(true); setEditingRoom(null); }} // ADDED setEditingRoom(null)
              icon={<Plus size={24} />}
              text="Add Room"
              color="from-green-500 to-green-600"
            />
            <QuickActionBtn 
              onClick={() => { setCurrentView('visitors'); setShowVisitorModal(true); }}
              icon={<Plus size={24} />}
              text="Add Visitor"
              color="from-purple-500 to-purple-600"
            />
            <QuickActionBtn 
              onClick={() => setCurrentView('requests')}
              icon={<Calendar size={24} />}
              text="View Requests"
              color="from-orange-500 to-orange-600"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Students Component
  const Students = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Students Management
        </h2>
        <button 
          onClick={() => { setShowStudentModal(true); setEditingStudent(null); }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:scale-105"
        >
          <Plus size={20} />
          Add New Student
        </button>
      </div>

      {students.length === 0 ? (
        <EmptyState 
          icon={<Users size={64} />}
          title="No Students Found"
          description="Start by adding your first student to the hostel"
          actionText="Add Student"
          onAction={() => setShowStudentModal(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map(student => (
                  <tr key={student._id} className="hover:bg-blue-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{student.rollNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.course}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.year}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.email}</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button 
                        onClick={() => setEditingStudent(student)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded-lg transition"
                        title="Edit Student"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteStudent(student._id)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-100 rounded-lg transition"
                        title="Delete Student"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Modal is rendered outside the component to avoid re-renders */}
    </div>
  );

  // Rooms Component
  const Rooms = () => {
      // Handler for View Details button (Simple Alert for now)
      const handleViewRoomDetails = (room) => {
          const details = `Room: ${room.roomNo}\nBlock: ${room.block}\nFloor: ${room.floor}\nType: ${room.roomType.name}\nCapacity: ${room.roomType.capacity}\nOccupied: ${room.occupied}`;
          alert('Room Details:\n\n' + details);
      };

      return (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Room Management
            </h2>
            <button 
              onClick={() => { setShowRoomModal(true); setEditingRoom(null); }}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:scale-105"
            >
              <Plus size={20} />
              Add New Room
            </button>
          </div>

          {rooms.length === 0 ? (
            <EmptyState 
              icon={<Bed size={64} />}
              title="No Rooms Found"
              description="Start by adding rooms to your hostel"
              actionText="Add Room"
              onAction={() => setShowRoomModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map(room => (
                <div key={room._id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{room.roomNo}</h3>
                      <p className="text-sm text-gray-600 mt-1">Block {room.block} • Floor {room.floor}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-xs font-bold shadow-md ${
                      room.occupied < room.roomType.capacity 
                        ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' 
                        : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                    }`}>
                      {room.occupied < room.roomType.capacity ? '✓ Available' : '✗ Full'}
                    </span>
                  </div>
                  <div className="space-y-3 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl">
                    <InfoRow label="Type" value={room.roomType.name} />
                    <InfoRow label="Capacity" value={room.roomType.capacity} />
                    <InfoRow label="Occupied" value={`${room.occupied}/${room.roomType.capacity}`} />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => handleViewRoomDetails(room)} // ADDED VIEW DETAILS FUNCTIONALITY
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg transition-all duration-300 text-sm font-semibold shadow-md"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => setEditingRoom(room)} // ADDED EDIT FUNCTIONALITY
                      className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-2 rounded-lg transition-all duration-300 text-sm font-semibold shadow-md"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
  };

  // Mess Menu Component
  const MessMenu = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Weekly Mess Menu
        </h2>
        <button 
          onClick={() => setShowMenuModal(true)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:scale-105"
        >
          <Plus size={20} />
          Add Menu
        </button>
      </div>
      
      {messMenu.length === 0 ? (
        <EmptyState 
          icon={<Utensils size={64} />}
          title="No Menu Found"
          description="Add weekly menu for the mess"
          actionText="Add Menu"
          onAction={() => setShowMenuModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {messMenu.map((menu) => (
            <div key={menu._id} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="w-3 h-10 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                {menu.dayOfWeek}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MealCard title="🌅 Breakfast" items={menu.breakfast} color="from-yellow-100 to-yellow-200" />
                <MealCard title="🍛 Lunch" items={menu.lunch} color="from-orange-100 to-orange-200" />
                <MealCard title="☕ Snacks" items={menu.snacks} color="from-green-100 to-green-200" />
                <MealCard title="🌙 Dinner" items={menu.dinner} color="from-blue-100 to-blue-200" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Requests Component
  const Requests = () => (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Out Requests
      </h2>
      
      {requests.length === 0 ? (
        <EmptyState 
          icon={<Calendar size={64} />}
          title="No Requests Found"
          description="No pending or approved requests"
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map(request => (
                  <tr key={request._id} className="hover:bg-purple-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{request.studentId?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{request.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{new Date(request.plannedOutTime).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{request.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold shadow-md ${
                        request.status === 'approved' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                        request.status === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                        'bg-gradient-to-r from-red-400 to-red-500 text-white'
                      }`}>
                        {request.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      {request.status === 'pending' && (
                        <>
                          <button className="text-green-600 hover:text-green-800 font-semibold px-3 py-1 hover:bg-green-100 rounded-lg transition">
                            Approve
                          </button>
                          <button className="text-red-600 hover:text-red-800 font-semibold px-3 py-1 hover:bg-red-100 rounded-lg transition">
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // Visitors Component
  const Visitors = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Visitor Management
        </h2>
        <button 
          onClick={() => setShowVisitorModal(true)}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:scale-105"
        >
          <Plus size={20} />
          Record Visitor
        </button>
      </div>

      {visitors.length === 0 ? (
        <EmptyState 
          icon={<UserCheck size={64} />}
          title="No Visitors Found"
          description="Record visitor entries here"
          actionText="Add Visitor"
          onAction={() => setShowVisitorModal(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Visitor Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Relation</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Check Out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visitors.map(visitor => (
                  <tr key={visitor._id} className="hover:bg-purple-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{visitor.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{visitor.relation}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{visitor.studentId?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{new Date(visitor.checkIn).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">
                      {visitor.checkOut ? (
                        <span className="text-gray-900">{new Date(visitor.checkOut).toLocaleString()}</span>
                      ) : (
                        <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold rounded-full shadow-md">
                          Currently Visiting
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // --- Modal Components (Defined inside main function to access state/handlers) ---

  const StudentModal = () => {
    // If editingStudent is set, we are in Edit mode, otherwise Add mode.
    const isEditing = !!editingStudent; 
    
    // Convert date object to YYYY-MM-DD format for input type="date"
    const formatDOB = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Ensure date parsing doesn't throw errors
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    };

    const initialFormData = editingStudent ? {
        ...editingStudent,
        dob: formatDOB(editingStudent.dob)
    } : {
        rollNo: '', name: '', dob: '', gender: 'M', contactPhone: '',
        email: '', course: '', year: 1, emergencyContactName: '', emergencyContactPhone: ''
    };

    const [formData, setFormData] = useState(initialFormData);

    const handleSubmit = (e) => {
      e.preventDefault();
      
      const payload = { ...formData };
      
      // Clean up fields before sending to MongoDB
      if (!payload.dob || payload.dob === '') delete payload.dob;
      // Convert year to number if it's a string, ensuring it doesn't break Mongoose
      payload.year = Number(payload.year) || 1;

      if (isEditing) {
        handleUpdateStudent(editingStudent._id, payload);
      } else {
        handleAddStudent(payload);
      }
    };
    
    const closeModal = () => {
        setShowStudentModal(false);
        setEditingStudent(null);
    };

    return (
      <Modal show={showStudentModal || !!editingStudent} onClose={closeModal} title={isEditing ? "Edit Student Record" : "Add New Student"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Roll Number" required value={formData.rollNo} onChange={(e) => setFormData({...formData, rollNo: e.target.value})} disabled={isEditing} />
            <Input label="Full Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date of Birth" type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
            <Select label="Gender" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} />
            <Input label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Course" required value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} />
            <Input label="Year" type="number" min="1" max="5" required value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Emergency Contact Name" value={formData.emergencyContactName} onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})} />
            <Input label="Emergency Contact Phone" value={formData.emergencyContactPhone} onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-2">
            <Save size={20} />
            {isEditing ? 'Update Record' : 'Save Student'}
          </button>
        </form>
      </Modal>
    );
  };

  const RoomModal = () => {
    const isEditing = !!editingRoom;
      
    const initialRoomType = editingRoom?.roomType?.name || 'Single';
    
    const [formData, setFormData] = useState(editingRoom ? {
      ...editingRoom,
      floor: editingRoom.floor.toString(),
      roomType: editingRoom.roomType,
    } : {
      roomNo: '',
      block: '',
      floor: 1,
      roomType: {
        name: 'Single',
        capacity: 1
      },
      occupied: 0
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      
      const payload = { ...formData };
      payload.floor = Number(payload.floor);
      
      if (isEditing) {
        handleUpdateRoom(editingRoom._id, payload);
      } else {
        handleAddRoom(payload);
      }
    };
    
    const closeModal = () => {
        setShowRoomModal(false);
        setEditingRoom(null);
    };

    return (
      <Modal show={showRoomModal || !!editingRoom} onClose={closeModal} title={isEditing ? "Edit Room Record" : "Add New Room"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Room Number" required value={formData.roomNo} onChange={(e) => setFormData({...formData, roomNo: e.target.value})} disabled={isEditing} />
            <Input label="Block" required value={formData.block} onChange={(e) => setFormData({...formData, block: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Floor" type="number" min="0" required value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} />
            <Select label="Room Type" value={formData.roomType.name} onChange={(e) => {
              const name = e.target.value;
              const capacity = name === 'Single' ? 1 : name === 'Double' ? 2 : 3;
              setFormData({...formData, roomType: { name, capacity }});
            }}>
              <option value="Single">Single (1 bed)</option>
              <option value="Double">Double (2 beds)</option>
              <option value="Triple">Triple (3 beds)</option>
            </Select>
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-2">
            <Save size={20} />
            {isEditing ? 'Update Room' : 'Save Room'}
          </button>
        </form>
      </Modal>
    );
  };

  const VisitorModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      relation: '',
      phone: '',
      studentId: students.length > 0 ? students[0]._id : ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleAddVisitor(formData);
    };

    return (
      <Modal show={showVisitorModal} onClose={() => setShowVisitorModal(false)} title="Record New Visitor">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Visitor Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <Input label="Relation" required value={formData.relation} onChange={(e) => setFormData({...formData, relation: e.target.value})} />
          <Input label="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          <Select label="Visiting Student" required value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})}>
            <option value="">Select Student</option>
            {students.map(student => (
              <option key={student._id} value={student._id}>{student.name} ({student.rollNo})</option>
            ))}
          </Select>
          <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-2">
            <Save size={20} />
            Record Visitor
          </button>
        </form>
      </Modal>
    );
  };

  const MenuModal = () => {
    const [formData, setFormData] = useState({
      dayOfWeek: 'Monday',
      breakfast: '',
      lunch: '',
      snacks: '',
      dinner: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleAddMenu(formData);
    };

    return (
      <Modal show={showMenuModal} onClose={() => setShowMenuModal(false)} title="Add Mess Menu">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Day of Week" required value={formData.dayOfWeek} onChange={(e) => setFormData({...formData, dayOfWeek: e.target.value})}>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </Select>
          <Input label="Breakfast" required value={formData.breakfast} onChange={(e) => setFormData({...formData, breakfast: e.target.value})} placeholder="e.g., Idli & Sambar" />
          <Input label="Lunch" required value={formData.lunch} onChange={(e) => setFormData({...formData, lunch: e.target.value})} placeholder="e.g., Rajma Chawal" />
          <Input label="Snacks" value={formData.snacks} onChange={(e) => setFormData({...formData, snacks: e.target.value})} placeholder="e.g., Samosa" />
          <Input label="Dinner" required value={formData.dinner} onChange={(e) => setFormData({...formData, dinner: e.target.value})} placeholder="e.g., Paneer Butter Masala" />
          <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-2">
            <Save size={20} />
            Save Menu
          </button>
        </form>
      </Modal>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
            <p className="mt-6 text-gray-600 text-lg font-semibold">Loading Hostel Data...</p>
          </div>
        </div>
      );
    }

    switch(currentView) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <Students />;
      case 'rooms': return <Rooms />;
      case 'mess': return <MessMenu />;
      case 'requests': return <Requests />;
      case 'visitors': return <Visitors />;
      default: return <Dashboard />;
    }
  };
  
  // Modal close handler
  const closeAllModals = () => {
    setShowStudentModal(false);
    setShowRoomModal(false);
    setShowVisitorModal(false);
    setShowMenuModal(false);
    setEditingStudent(null);
    setEditingRoom(null); // Clear editing room state
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 overflow-hidden shadow-2xl z-20`}>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Hostel MS</h1>
          <nav className="space-y-2">
            <NavItem icon={<Home size={22} />} text="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
            <NavItem icon={<Users size={22} />} text="Students" active={currentView === 'students'} onClick={() => setCurrentView('students')} />
            <NavItem icon={<Bed size={22} />} text="Rooms" active={currentView === 'rooms'} onClick={() => setCurrentView('rooms')} />
            <NavItem icon={<Utensils size={22} />} text="Mess Menu" active={currentView === 'mess'} onClick={() => setCurrentView('mess')} />
            <NavItem icon={<Calendar size={22} />} text="Requests" active={currentView === 'requests'} onClick={() => setCurrentView('requests')} />
            <NavItem icon={<UserCheck size={22} />} text="Visitors" active={currentView === 'visitors'} onClick={() => setCurrentView('visitors')} />
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-lg border-b border-gray-200 z-10">
          <div className="flex items-center justify-between px-8 py-5">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-3 rounded-xl transition-all duration-300">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-semibold text-lg">{user.name}</span>
              <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-bold shadow-lg">
                {user.role.toUpperCase()}
              </span>
              <button className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-3 rounded-xl transition-all duration-300">
                <LogOut size={22} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </main>
      </div>

      {/* Modals are controlled by their respective states */}
      {(showStudentModal || !!editingStudent) && <StudentModal />}
      {(showRoomModal || !!editingRoom) && <RoomModal />}
      {showVisitorModal && <VisitorModal />}
      {showMenuModal && <MenuModal />}
    </div>
  );
};


export default HostelManagementSystem;
