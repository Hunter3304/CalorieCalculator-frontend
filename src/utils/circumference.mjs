import { addDays } from './calendar.mjs'

export const CIRCUMFERENCE_FIELDS = [
  { key: 'chest', requestKey: 'chestCm', label: '胸围' },
  { key: 'waist', requestKey: 'waistCm', label: '腰围' },
  { key: 'hip', requestKey: 'hipCm', label: '臀围' },
  { key: 'arm', requestKey: 'armCm', label: '臂围' },
  { key: 'thigh', requestKey: 'thighCm', label: '大腿围' },
  { key: 'calf', requestKey: 'calfCm', label: '小腿围' }
]

export const CIRCUMFERENCE_RANGE_DAYS = { week: 7, month: 30, year: 365 }

export const capCircumferenceEndDate = (selectedDate, today) => (
  selectedDate > today ? today : selectedDate
)

export const getCircumferenceRangeStart = (endDate, days) => {
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw new Error('Circumference range must contain between 1 and 365 days')
  }
  return addDays(endDate, 1 - days)
}

export const isValidCircumferenceInput = (value) => {
  const text = String(value || '').trim()
  return text === '' || (/^\d+(\.\d)?$/.test(text) && Number(text) > 0)
}

export const createEmptyCircumferenceSnapshot = (date) => {
  const snapshot = { selectedDate: date, recordId: null }
  CIRCUMFERENCE_FIELDS.forEach((field) => {
    snapshot[field.key] = {
      valueCm: null,
      sourceDate: null,
      recordedOnSelectedDate: false
    }
  })
  return snapshot
}

export const createCircumferenceInputs = (snapshot) => {
  const inputs = {}
  CIRCUMFERENCE_FIELDS.forEach((field) => {
    const value = snapshot && snapshot[field.key]
    inputs[field.key] = value && value.recordedOnSelectedDate && value.valueCm !== null
      ? String(value.valueCm)
      : ''
  })
  return inputs
}

export const buildCircumferencePayload = (inputs, originalSnapshot) => {
  const payload = {}
  const clearFields = []
  CIRCUMFERENCE_FIELDS.forEach((field) => {
    const text = String(inputs[field.key] || '').trim()
    const original = originalSnapshot && originalSnapshot[field.key]
    if (text !== '') payload[field.requestKey] = Number(text)
    else if (original && original.recordedOnSelectedDate) clearFields.push(field.key)
  })
  if (clearFields.length > 0) payload.clearFields = clearFields
  return payload
}

export const normalizeCircumferencePoints = (points = []) => points.map((point) => ({
  ...point,
  valueCm: point.valueCm === null || point.valueCm === undefined
    ? null
    : Number(point.valueCm)
}))
