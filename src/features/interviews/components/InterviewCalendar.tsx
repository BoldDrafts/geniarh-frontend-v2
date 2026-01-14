import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Users, BrainCircuit, ChevronDown } from 'lucide-react';
import { Interview } from '../types/interview';

interface InterviewCalendarProps {
  interviews: Interview[];
  onInterviewSelect: (interview: Interview) => void;
  loading?: boolean;
}

const InterviewCalendar: React.FC<InterviewCalendarProps> = ({
  interviews,
  onInterviewSelect,
  loading = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDateSelector, setShowDateSelector] = useState(false);

  // Get calendar data
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Get interviews for a specific date
  const getInterviewsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return interviews.filter(interview => interview.date === dateStr);
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle date selector changes
  const handleYearChange = (year: number) => {
    setCurrentDate(new Date(year, month, 1));
  };

  const handleMonthChange = (monthIndex: number) => {
    setCurrentDate(new Date(year, monthIndex, 1));
  };

  // Generate year options (current year ± 5 years)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'hr': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cultural': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'ai': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technical': return <User className="h-3 w-3" />;
      case 'hr': return <Users className="h-3 w-3" />;
      case 'cultural': return <Users className="h-3 w-3" />;
      case 'ai': return <BrainCircuit className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  // Check if date is today
  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading calendar...</span>
        </div>
      </div>
    );
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Date Selector Button */}
            <div className="relative">
              <button
                onClick={() => setShowDateSelector(!showDateSelector)}
                className="flex items-center space-x-2 px-3 py-2 text-lg font-semibold text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <span>{monthNames[month]} {year}</span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showDateSelector ? 'rotate-180' : ''}`} />
              </button>

              {/* Date Selector Dropdown */}
              {showDateSelector && (
                <>
                  {/* Click outside to close */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDateSelector(false)}
                  ></div>
                  
                  <div className="absolute z-20 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-80">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Year Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <select
                          value={year}
                          onChange={(e) => handleYearChange(parseInt(e.target.value))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          {generateYearOptions().map(yearOption => (
                            <option key={yearOption} value={yearOption}>
                              {yearOption}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Month Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                        <select
                          value={month}
                          onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          {monthNames.map((monthName, index) => (
                            <option key={index} value={index}>
                              {monthName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between">
                      <button
                        onClick={() => {
                          setCurrentDate(new Date());
                          setShowDateSelector(false);
                        }}
                        className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        Go to Today
                      </button>
                      <button
                        onClick={() => setShowDateSelector(false)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
            >
              Today
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={index} className="h-24 p-1"></div>;
            }

            const dayInterviews = getInterviewsForDate(day);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day}
                className={`h-24 p-1 border border-gray-100 rounded-md hover:bg-gray-50 transition-colors ${
                  isCurrentDay ? 'bg-blue-50 border-blue-200' : 'bg-white'
                }`}
              >
                <div className="h-full flex flex-col">
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentDay ? 'text-blue-700' : 'text-gray-900'
                  }`}>
                    {day}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-1">
                    {dayInterviews.slice(0, 2).map((interview) => (
                      <button
                        key={interview.id}
                        onClick={() => onInterviewSelect(interview)}
                        className={`w-full text-left p-1 rounded text-xs border ${getTypeColor(interview.type)} hover:opacity-80 transition-opacity`}
                      >
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(interview.type)}
                          <span className="truncate font-medium">
                            {interview.time}
                          </span>
                        </div>
                        <div className="truncate text-xs opacity-90">
                          {interview.candidateName}
                        </div>
                      </button>
                    ))}
                    
                    {dayInterviews.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayInterviews.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-4 border-t border-gray-100">
        <div className="flex items-center justify-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-purple-100 border border-purple-200"></div>
            <span className="text-gray-600">Technical</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
            <span className="text-gray-600">HR</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-teal-100 border border-teal-200"></div>
            <span className="text-gray-600">Cultural</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-indigo-100 border border-indigo-200"></div>
            <span className="text-gray-600">AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCalendar;