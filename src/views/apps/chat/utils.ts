import { formatDate } from '@/utils/date'

const isToday = (date: Date | string) => {
  const today = new Date()
  const d = new Date(date)

  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
}

export const formatDateToMonthShort = (value: Date | string, toTimeForCurrentDay = true) => {
  const date = new Date(value)

  if (toTimeForCurrentDay && isToday(date)) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(date)
  }

  return formatDate(value, { month: 'short', day: 'numeric' })
}
