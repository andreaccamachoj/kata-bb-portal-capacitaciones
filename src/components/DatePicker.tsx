import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

type ViewMode = "days" | "months" | "years";

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

const DAYS_OF_WEEK = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

export function DatePicker({ value, onChange, minDate, maxDate }: DatePickerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("days");
  const [viewDate, setViewDate] = useState(value || new Date());

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (!value) return false;
    return (
      date.getDate() === value.getDate() &&
      date.getMonth() === value.getMonth() &&
      date.getFullYear() === value.getFullYear()
    );
  };

  const handlePrevious = () => {
    if (viewMode === "days") {
      setViewDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (viewMode === "months") {
      setViewDate(new Date(currentYear - 1, currentMonth, 1));
    } else {
      setViewDate(new Date(currentYear - 10, currentMonth, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "days") {
      setViewDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (viewMode === "months") {
      setViewDate(new Date(currentYear + 1, currentMonth, 1));
    } else {
      setViewDate(new Date(currentYear + 10, currentMonth, 1));
    }
  };

  const handleHeaderClick = () => {
    if (viewMode === "days") {
      setViewMode("months");
    } else if (viewMode === "months") {
      setViewMode("years");
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    setViewDate(new Date(currentYear, monthIndex, 1));
    setViewMode("days");
  };

  const handleYearSelect = (year: number) => {
    setViewDate(new Date(year, currentMonth, 1));
    setViewMode("months");
  };

  const handleDaySelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    if (!isDateDisabled(selectedDate)) {
      onChange(selectedDate);
    }
  };

  const renderDaysView = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-9 h-9" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const disabled = isDateDisabled(date);
      const selected = isDateSelected(date);
      const isToday =
        day === new Date().getDate() &&
        currentMonth === new Date().getMonth() &&
        currentYear === new Date().getFullYear();

      days.push(
        <button
          key={day}
          onClick={() => handleDaySelect(day)}
          disabled={disabled}
          className={cn(
            "w-9 h-9 rounded-md text-sm font-normal transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            disabled && "text-muted-foreground opacity-50 cursor-not-allowed",
            selected && "bg-primary text-primary-foreground hover:bg-primary",
            isToday && !selected && "border-2 border-primary",
            !selected && !disabled && "text-foreground"
          )}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="w-9 h-9 text-center text-sm font-medium text-muted-foreground flex items-center justify-center"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  const renderMonthsView = () => {
    return (
      <div className="grid grid-cols-3 gap-2 p-2">
        {MONTHS.map((month, index) => {
          const isSelected = value && index === value.getMonth() && currentYear === value.getFullYear();
          return (
            <button
              key={month}
              onClick={() => handleMonthSelect(index)}
              className={cn(
                "py-3 px-4 rounded-md text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isSelected && "border-2 border-primary bg-primary/10"
              )}
            >
              {month}
            </button>
          );
        })}
      </div>
    );
  };

  const renderYearsView = () => {
    const startYear = Math.floor(currentYear / 10) * 10;
    const years = [];

    for (let i = 0; i < 10; i++) {
      const year = startYear + i;
      const isSelected = value && year === value.getFullYear();
      const isDisabled =
        (minDate && year < minDate.getFullYear()) ||
        (maxDate && year > maxDate.getFullYear());

      years.push(
        <button
          key={year}
          onClick={() => handleYearSelect(year)}
          disabled={isDisabled}
          className={cn(
            "py-3 px-4 rounded-md text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed",
            isSelected && "border-2 border-primary bg-primary/10"
          )}
        >
          {year}
        </button>
      );
    }

    return <div className="grid grid-cols-2 gap-2 p-2">{years}</div>;
  };

  const getHeaderText = () => {
    if (viewMode === "days") {
      return `${MONTHS[currentMonth]} ${currentYear}`;
    } else if (viewMode === "months") {
      return currentYear.toString();
    } else {
      const startYear = Math.floor(currentYear / 10) * 10;
      return `${startYear} - ${startYear + 9}`;
    }
  };

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 w-auto">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handlePrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <button
          onClick={handleHeaderClick}
          className="text-sm font-medium hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-accent"
        >
          {getHeaderText()}
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {viewMode === "days" && renderDaysView()}
      {viewMode === "months" && renderMonthsView()}
      {viewMode === "years" && renderYearsView()}
    </div>
  );
}
