'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  minDate?: string;
  disabledDates?: string[];
}

export default function Calendar({ 
  selectedDate, 
  onDateChange, 
  minDate,
  disabledDates = [] 
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isDateDisabled = (date: string) => {
    if (minDate && date < minDate) return true;
    if (disabledDates.includes(date)) return true;
    return false;
  };

  const isDateSelected = (date: string) => {
    return date === selectedDate;
  };

  const isToday = (date: string) => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const handleDateClick = (date: string) => {
    if (!isDateDisabled(date)) {
      onDateChange(date);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const disabled = isDateDisabled(date);
      const selected = isDateSelected(date);
      const today = isToday(date);

      days.push(
        <button
          key={date}
          onClick={() => handleDateClick(date)}
          disabled={disabled}
          className={`
            h-10 w-10 rounded-lg text-sm font-medium transition-colors
            ${disabled 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'hover:bg-blue-50 cursor-pointer'
            }
            ${selected 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : today
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-700'
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthYear = currentMonth.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900 capitalize">
          {monthYear}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="h-8 text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span>Hoje</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>Selecionado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span>Indisponível</span>
          </div>
        </div>
      </div>
    </div>
  );
}
