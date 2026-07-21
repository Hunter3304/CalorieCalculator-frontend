const pad = (value) => String(value).padStart(2, '0')

export const formatLocalDate = (date) => (
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
)

export const parseLocalDate = (dateText) => {
  const parts = dateText.split('-').map(Number)
  return new Date(parts[0], parts[1] - 1, parts[2], 12)
}

export const addDays = (dateText, amount) => {
  const date = parseLocalDate(dateText)
  date.setDate(date.getDate() + amount)
  return formatLocalDate(date)
}

export const getMonthKey = (dateText) => dateText.slice(0, 7)

export const shiftMonth = (monthText, amount) => {
  const parts = monthText.split('-').map(Number)
  const date = new Date(parts[0], parts[1] - 1 + amount, 1, 12)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

export const getCalendarCells = (monthText) => {
  const parts = monthText.split('-').map(Number)
  const year = parts[0]
  const monthIndex = parts[1] - 1
  const firstWeekday = new Date(year, monthIndex, 1, 12).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0, 12).getDate()
  const cells = Array(firstWeekday).fill(null)

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(`${year}-${pad(monthIndex + 1)}-${pad(day)}`)
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export const isDateInRange = (dateText, minDate, maxDate) => (
  Boolean(dateText && minDate && maxDate && dateText >= minDate && dateText <= maxDate)
)

export const formatDisplayDate = (dateText) => {
  const parts = dateText.split('-').map(Number)
  return `${parts[0]}年${parts[1]}月${parts[2]}日`
}

export const formatMonth = (monthText) => {
  const parts = monthText.split('-').map(Number)
  return `${parts[0]}年${parts[1]}月`
}
