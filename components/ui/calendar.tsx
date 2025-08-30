import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"

export interface CalendarProps {
  mode?: "single" | "multiple" | "range"
  selected?: Date | Date[]
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  className?: string
}

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  className,
  ...props
}: CalendarProps & React.HTMLAttributes<HTMLDivElement>) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onSelect?.(selectedDate)
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (selected instanceof Date) {
      return date.toDateString() === selected.toDateString()
    }
    return false
  }

  const isDisabled = (day: number) => {
    if (!disabled) return false
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return disabled(date)
  }

  const renderCalendarDays = () => {
    const days = []
    const totalCells = 42 // 6 weeks * 7 days

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDayOfMonth + 1
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth

      days.push(
        <div
          key={i}
          className={`
            h-8 w-8 flex items-center justify-center text-sm cursor-pointer rounded-md
            ${isCurrentMonth ? 'hover:bg-gray-100' : 'text-gray-300'}
            ${isSelected(dayNumber) ? 'bg-blue-600 text-white' : ''}
            ${isDisabled(dayNumber) ? 'cursor-not-allowed opacity-50' : ''}
          `}
          onClick={() => isCurrentMonth && !isDisabled(dayNumber) && handleDateClick(dayNumber)}
        >
          {isCurrentMonth ? dayNumber : ''}
        </div>
      )
    }

    return days
  }

  return (
    <div className={`p-3 bg-white border rounded-lg shadow-lg ${className}`} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
    </div>
  )
}

// Export as CalendarComponent for backward compatibility
export { Calendar as CalendarComponent }
