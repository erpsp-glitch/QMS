// // Menubar/TopNavbar.tsx
// import React, { useState, useRef, useEffect } from 'react';

// interface TopNavbarProps {
//   userEmail?: string;
//   userName?: string;
//   userRole?: string;
//   onLogout?: () => void;
//   backgroundColor?: string;
//   textColor?: string;
//   primaryColor?: string;
//   accentColor?: string;
//   showNotifications?: boolean;
//   notificationCount?: number;
//   onNotificationsClick?: () => void;
// }

// const TopNavbar: React.FC<TopNavbarProps> = ({
//   userEmail = 'user@example.com',
//   userName = 'John Doe',
//   userRole = 'Administrator',
//   onLogout = () => console.log('Logout clicked'),
//   backgroundColor = '#ffffff',
//   textColor = '#1f2937',
//   primaryColor = '#2563eb',
//   accentColor = '#3b82f6',
//   showNotifications = true,
//   notificationCount = 3,
//   onNotificationsClick = () => console.log('Notifications clicked')
// }) => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const toggleDropdown = () => {
//     setIsDropdownOpen(!isDropdownOpen);
//   };

//   return (
//     <nav 
//       className="fixed top-0 left-0 right-0 z-30 shadow-sm backdrop-blur-sm bg-opacity-95 border-b transition-all duration-300"
//       style={{ 
//         backgroundColor, 
//         borderColor: 'rgba(0, 0, 0, 0.08)',
//         height: '70px'
//       }}
//     >
//       <div className="flex items-center justify-between h-full px-6">
//         {/* Left side - Logo or app name */}
//         <div className="flex items-center">
//           <div className="flex items-center mr-8">
//             <div 
//               className="w-8 h-8 rounded-md flex items-center justify-center mr-3 shadow-sm"
//               style={{ backgroundColor: primaryColor }}
//             >
//               <i className="fas fa-briefcase text-white"></i>
//             </div>
//             <span 
//               className="text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
//               style={{ 
//                 backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` 
//               }}
//             >
//               HR Management
//             </span>
//           </div>
          
//         </div>

//        {/* Right side - Icons and user account dropdown */}
//         <div className="flex items-center space-x-4">
//           {/* Notifications Bell */}
//           {showNotifications && (
//             <button
//               onClick={onNotificationsClick}
//               className="relative p-2 rounded-full transition-all duration-200 hover:scale-110"
//               style={{ 
//                 color: textColor,
//                 backgroundColor: 'transparent'
//               }}
//               aria-label="Notifications"
//             >
//               <i className="fas fa-bell text-lg"></i>
//               {notificationCount > 0 && (
//                 <span 
//                   className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white shadow-sm"
//                   style={{ backgroundColor: '#ef4444' }}
//                 >
//                   {notificationCount > 9 ? '9+' : notificationCount}
//                 </span>
//               )}
//             </button>
//           )}
          
//           {/* Search Icon */}
//           {/* <button
//             className="p-2 rounded-full transition-all duration-200 hover:scale-110"
//             style={{ 
//               color: textColor,
//               backgroundColor: 'transparent'
//             }}
//             aria-label="Search"
//           >
//             <i className="fas fa-search text-lg"></i>
//           </button> */}

//           {/* Theme Toggle (Light/Dark Mode) */}
//           {/* <button
//             className="p-2 rounded-full transition-all duration-200 hover:scale-110"
//             style={{ 
//               color: textColor,
//               backgroundColor: 'transparent'
//             }}
//             aria-label="Toggle theme"
//           >
//             <i className="fas fa-moon text-lg"></i>
//           </button> */}

//           {/* User account dropdown */}
//           <div className="relative" ref={dropdownRef}>
//             <button
//               onClick={toggleDropdown}
//               className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:shadow-md"
//               style={{ 
//                 backgroundColor: isDropdownOpen ? '#f1f5f9' : 'transparent',
//                 color: textColor,
//                 border: `2px solid ${isDropdownOpen ? primaryColor : 'transparent'}`
//               }}
//               aria-label="Account menu"
//               aria-expanded={isDropdownOpen}
//             >
//               <div 
//                 className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold shadow-sm"
//                 style={{ backgroundColor: primaryColor }}
//               >
//                 {userName.charAt(0).toUpperCase()}
//               </div>
//             </button>

//             {/* Dropdown menu */}
//             {isDropdownOpen && (
//               <div 
//                 className="absolute right-0 top-14 mt-1 w-72 bg-white rounded-xl shadow-xl border py-2 z-50 overflow-hidden animate-fade-in"
//                 style={{ 
//                   backgroundColor: '#ffffff',
//                   color: textColor,
//                   borderColor: 'rgba(0, 0, 0, 0.08)',
//                   boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
//                 }}
//               >
//                 {/* User info section */}
//                 <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}>
//                   <div className="flex items-center">
//                     <div 
//                       className="flex items-center justify-center w-12 h-12 rounded-full mr-3 text-white font-bold text-lg shadow-md"
//                       style={{ backgroundColor: primaryColor }}
//                     >
//                       {userName.charAt(0).toUpperCase()}
//                     </div>
//                     <div className="overflow-hidden">
//                       <p className="text-sm font-semibold truncate" style={{ color: textColor }}>
//                         {userName}
//                       </p>
//                       <p className="text-xs truncate text-gray-500 mt-1">{userEmail}</p>
//                       <div 
//                         className="inline-block px-2 py-1 rounded-full text-xs font-medium mt-2"
//                         style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
//                       >
//                         {userRole}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Dropdown items */}
//                 <div className="py-2">
//                   <a
//                     href="/profile"
//                     className="flex items-center px-4 py-3 text-sm transition-colors hover:bg-gray-50"
//                     style={{ color: textColor }}
//                   >
//                     <i className="fas fa-user-circle mr-3 w-5 text-center" style={{ color: '#64748b' }}></i>
//                     <span>Your Profile</span>
//                   </a>
//                   <a
//                     href="/settings"
//                     className="flex items-center px-4 py-3 text-sm transition-colors hover:bg-gray-50"
//                     style={{ color: textColor }}
//                   >
//                     <i className="fas fa-cog mr-3 w-5 text-center" style={{ color: '#64748b' }}></i>
//                     <span>Settings</span>
//                   </a>
//                   <a
//                     href="/help"
//                     className="flex items-center px-4 py-3 text-sm transition-colors hover:bg-gray-50"
//                     style={{ color: textColor }}
//                   >
//                     <i className="fas fa-question-circle mr-3 w-5 text-center" style={{ color: '#64748b' }}></i>
//                     <span>Help & Support</span>
//                   </a>
//                 </div>

//                 {/* Logout button */}
//                 <div className="px-2 py-2 border-t" style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}>
//                   <button
//                     onClick={onLogout}
//                     className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
//                     style={{ 
//                       backgroundColor: `${primaryColor}10`, 
//                       color: primaryColor 
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.backgroundColor = `${primaryColor}20`;
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.backgroundColor = `${primaryColor}10`;
//                     }}
//                   >
//                     <i className="fas fa-sign-out-alt mr-2"></i>
//                     Sign out
//                   </button>
//                 </div>

//                 {/* Additional options can be added here */}
//                 <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}>
//                   <div className="text-xs text-gray-500 flex justify-between">
//                     <span>v2.1.0</span>
//                     <span>© 2024 HR System</span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Add some custom styles for animations */}
//       <style>{`
//         @keyframes fade-in {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fade-in {
//           animation: fade-in 0.2s ease-out forwards;
//         }
//       `}</style>
//     </nav>
//   );
// };

// export default TopNavbar;
// Menubar/TopNavbar.tsx
import React, { useState, useRef, useEffect } from 'react';


interface TopNavbarProps {
  userEmail?: string;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
  backgroundColor?: string;
  textColor?: string;
  primaryColor?: string;
  accentColor?: string;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotificationsClick?: () => void;
  onEventAdd?: (event: CalendarEvent) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'meeting' | 'reminder' | 'task' | 'holiday';
}

const TopNavbar: React.FC<TopNavbarProps> = ({
  userEmail = 'user@example.com',
  userName = 'John Doe',
  userRole = 'Administrator',
  onLogout = () => console.log('Logout clicked'),
  backgroundColor = '#ffffff',
  textColor = '#1f2937',
  primaryColor = '#2563eb',
  accentColor = '#3b82f6',
  showNotifications = true,
  notificationCount = 3,
  onNotificationsClick = () => console.log('Notifications clicked'),
  onEventAdd = (event) => console.log('Event added:', event)
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<CalendarEvent['type']>('meeting');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (isCalendarOpen) setIsCalendarOpen(false);
  };

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
    if (isDropdownOpen) setIsDropdownOpen(false);
    if (!isCalendarOpen) {
      setSelectedDate(null);
      setEventTitle('');
    }
  };

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Check if a date has an event
  const hasEvent = (date: Date) => {
    return events.some(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const dateEvents = getEventsForDate(date);
    if (dateEvents.length > 0) {
      setEventTitle(dateEvents[0].title);
      setEventType(dateEvents[0].type);
    } else {
      setEventTitle('');
      setEventType('meeting');
    }
  };

  // Add or update event
  const handleAddEvent = () => {
    if (!selectedDate || !eventTitle.trim()) return;

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventTitle,
      date: selectedDate,
      type: eventType
    };

    // Remove any existing event for this date
    const updatedEvents = events.filter(event => 
      !(event.date.getDate() === selectedDate.getDate() &&
        event.date.getMonth() === selectedDate.getMonth() &&
        event.date.getFullYear() === selectedDate.getFullYear())
    );

    // Add new event
    updatedEvents.push(newEvent);
    setEvents(updatedEvents);
    
    // Notify parent component
    onEventAdd(newEvent);
    
    // Reset form
    setEventTitle('');
    setSelectedDate(null);
  };

  // Remove event
  const handleRemoveEvent = () => {
    if (!selectedDate) return;

    const updatedEvents = events.filter(event => 
      !(event.date.getDate() === selectedDate.getDate() &&
        event.date.getMonth() === selectedDate.getMonth() &&
        event.date.getFullYear() === selectedDate.getFullYear())
    );

    setEvents(updatedEvents);
    setEventTitle('');
    setSelectedDate(null);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startingDay; i++) {
      const day = prevMonthLastDay - startingDay + i + 1;
      const date = new Date(year, month - 1, day);
      days.push(
        <div key={`prev-${i}`} className="text-center text-gray-400 py-2">
          {day}
        </div>
      );
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
      const hasEvent = events.some(event => event.date.toDateString() === date.toDateString());
      
      days.push(
        <div
          key={`current-${i}`}
          className={`text-center py-2 rounded-full cursor-pointer transition-all ${
            isSelected ? 'text-white font-bold scale-110' : 
            isToday ? 'font-bold border-2' : 
            hasEvent ? 'font-semibold' : ''
          }`}
          style={{
            backgroundColor: isSelected ? primaryColor : 'transparent',
            color: isSelected ? '#fff' : (isToday ? primaryColor : (hasEvent ? accentColor : textColor)),
            borderColor: isToday ? primaryColor : 'transparent'
          }}
          onClick={() => handleDateSelect(date)}
        >
          {i}
          {hasEvent && (
            <div className="w-1 h-1 mx-auto mt-1 rounded-full" style={{ backgroundColor: accentColor }}></div>
          )}
        </div>
      );
    }
    
    // Next month's days
    const totalCells = 42; // 6 weeks of 7 days
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      days.push(
        <div key={`next-${i}`} className="text-center text-gray-400 py-2">
          {i}
        </div>
      );
    }
    
    return days;
  };

  // Calendar component
  const CalendarModal = () => {
    if (!isCalendarOpen) return null;

    const monthName = currentMonth.toLocaleString('default', { month: 'long' });
    const year = currentMonth.getFullYear();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div 
        ref={calendarRef}
        className="absolute right-0 top-14 mt-1 w-80 bg-white rounded-xl shadow-xl border py-4 z-50 overflow-hidden animate-fade-in"
        style={{ 
          backgroundColor: '#ffffff',
          color: textColor,
          borderColor: 'rgba(0, 0, 0, 0.08)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="px-4 pb-3 border-b" style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={goToPreviousMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <h3 className="text-lg font-semibold">
              {monthName} {year}
            </h3>
            
            <button 
              onClick={goToNextMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays()}
          </div>
        </div>
        
        {selectedDate && (
          <div className="px-4 py-3">
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Add event for {selectedDate.toLocaleDateString()}</label>
           <input
  type="text"
  value={eventTitle}
  onChange={(e) => setEventTitle(e.target.value)}
  placeholder="Event title"
  className="w-full px-3 py-2 border rounded-lg focus:outline-none custom-focus"
  style={{ 
    borderColor: 'rgba(0, 0, 0, 0.1)',
    '--primary-color': primaryColor 
  } as React.CSSProperties}
/>

<select
  value={eventType}
  onChange={(e) => setEventType(e.target.value as CalendarEvent['type'])}
  className="w-full px-3 py-2 border rounded-lg focus:outline-none custom-focus"
  style={{ 
    borderColor: 'rgba(0, 0, 0, 0.1)',
    '--primary-color': primaryColor 
  } as React.CSSProperties}
>

                <option value="meeting">Meeting</option>
                <option value="reminder">Reminder</option>
                <option value="task">Task</option>
                <option value="holiday">Holiday</option>
              </select>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleAddEvent}
                disabled={!eventTitle.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: primaryColor, 
                  color: '#fff'
                }}
              >
                {getEventsForDate(selectedDate).length > 0 ? 'Update' : 'Add'} Event
              </button>
              
              {getEventsForDate(selectedDate).length > 0 && (
                <button
                  onClick={handleRemoveEvent}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: '#ef4444', 
                    color: '#fff'
                  }}
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </div>
          </div>
        )}
        
        {!selectedDate && (
          <div className="px-4 py-3 text-center text-sm text-gray-500">
            Select a date to add or view events
          </div>
        )}
      </div>
    );
  };

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-30 shadow-sm backdrop-blur-sm bg-opacity-95 border-b transition-all duration-300"
      style={{ 
        backgroundColor, 
        borderColor: 'rgba(0, 0, 0, 0.08)',
        height: '70px'
      }}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Logo or app name */}
        <div className="flex items-center">
          <div className="flex items-center mr-8">
            <div 
              className="w-8 h-8 rounded-md flex items-center justify-center mr-3 shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              <i className="fas fa-briefcase text-white"></i>
            </div>
            <span 
              className="text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
              style={{ 
                backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` 
              }}
            >
              Quality Management System
            </span>
          </div>
          
          
        </div>

        {/* Right side - Icons and user account dropdown */}
        <div className="flex items-center space-x-4">
          {/* Calendar Icon */}
          <div className="relative">
            <button
              onClick={toggleCalendar}
              className="relative p-2 rounded-full transition-all duration-200 hover:scale-110"
              style={{ 
                color: isCalendarOpen ? primaryColor : textColor,
                backgroundColor: 'transparent'
              }}
              aria-label="Calendar"
            >
              <i className="fas fa-calendar-alt text-lg"></i>
              {events.length > 0 && (
                <span 
                  className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  {events.length > 9 ? '9+' : events.length}
                </span>
              )}
            </button>
            <CalendarModal />
          </div>
          
          {/* Notifications Bell */}
          {showNotifications && (
            <button
              onClick={onNotificationsClick}
              className="relative p-2 rounded-full transition-all duration-200 hover:scale-110"
              style={{ 
                color: textColor,
                backgroundColor: 'transparent'
              }}
              aria-label="Notifications"
            >
              <i className="fas fa-bell text-lg"></i>
              {notificationCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          )}
          
          {/* Search Icon */}
          <button
            className="p-2 rounded-full transition-all duration-200 hover:scale-110"
            style={{ 
              color: textColor,
              backgroundColor: 'transparent'
            }}
            aria-label="Search"
          >
            <i className="fas fa-search text-lg"></i>
          </button>

          {/* User account dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:shadow-md"
              style={{ 
                backgroundColor: isDropdownOpen ? '#f1f5f9' : 'transparent',
                color: textColor,
                border: `2px solid ${isDropdownOpen ? primaryColor : 'transparent'}`
              }}
              aria-label="Account menu"
              aria-expanded={isDropdownOpen}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div 
                className="absolute right-0 top-14 mt-1 w-72 bg-white rounded-xl shadow-xl border py-2 z-50 overflow-hidden animate-fade-in"
                style={{ 
                  backgroundColor: '#ffffff',
                  color: textColor,
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* User info section */}
                <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}>
                  <div className="flex items-center">
                    <div 
                      className="flex items-center justify-center w-12 h-12 rounded-full mr-3 text-white font-bold text-lg shadow-md"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold truncate" style={{ color: textColor }}>
                        {userName}
                      </p>
                      <p className="text-xs truncate text-gray-500 mt-1">{userEmail}</p>
                      <div 
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium mt-2"
                        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                      >
                        {userRole}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dropdown items */}
                <div className="py-2">
                  <a
                    href="/profile"
                    className="flex items-center px-4 py-3 text-sm transition-colors hover:bg-gray-50"
                    style={{ color: textColor }}
                  >
                    <i className="fas fa-user-circle mr-3 w-5 text-center" style={{ color: '#64748b' }}></i>
                    <span>Your Profile</span>
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center px-4 py-3 text-sm transition-colors hover:bg-gray-50"
                    style={{ color: textColor }}
                  >
                    <i className="fas fa-cog mr-3 w-5 text-center" style={{ color: '#64748b' }}></i>
                    <span>Settings</span>
                  </a>
                  <a
                    href="/help"
                    className="flex items-center px-4 py-3 text-sm transition-colors hover:bg-gray-50"
                    style={{ color: textColor }}
                  >
                    <i className="fas fa-question-circle mr-3 w-5 text-center" style={{ color: '#64748b' }}></i>
                    <span>Help & Support</span>
                  </a>
                </div>

                {/* Logout button */}
                <div className="px-2 py-2 border-t" style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                    style={{ 
                      backgroundColor: `${primaryColor}10`, 
                      color: primaryColor 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${primaryColor}20`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `${primaryColor}10`;
                    }}
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Sign out
                  </button>
                </div>

                {/* Additional options can be added here */}
                <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}>
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>v2.1.0</span>
                    <span>© 2024 HR System</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add some custom styles for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </nav>
  );
};

export default TopNavbar;