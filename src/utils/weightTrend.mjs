import { addDays } from './calendar.mjs'

export const WEIGHT_RANGE_DAYS = { week: 7, month: 30, year: 365 }

export const capWeightEndDate = (selectedDate, today) => (
  selectedDate > today ? today : selectedDate
)

export const getWeightRangeStart = (endDate, days) => {
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw new Error('Weight range must contain between 1 and 365 days')
  }
  return addDays(endDate, 1 - days)
}

export const isValidWeightInput = (value) => {
  const text = String(value).trim()
  return /^\d+(\.\d)?$/.test(text) && Number(text) > 0
}

export const normalizeWeightPoints = (points = []) => points.map((point) => ({
  ...point,
  weightKg: point.weightKg === null || point.weightKg === undefined ? null : Number(point.weightKg)
}))
