import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildCircumferencePayload,
  capCircumferenceEndDate,
  createCircumferenceInputs,
  createEmptyCircumferenceSnapshot,
  getCircumferenceRangeStart,
  isValidCircumferenceInput,
  normalizeCircumferencePoints
} from '../src/utils/circumference.mjs'

test('circumference input accepts blanks and positive one-decimal values', () => {
  assert.equal(isValidCircumferenceInput(''), true)
  assert.equal(isValidCircumferenceInput('78'), true)
  assert.equal(isValidCircumferenceInput('78.5'), true)
  assert.equal(isValidCircumferenceInput('0'), false)
  assert.equal(isValidCircumferenceInput('-1'), false)
  assert.equal(isValidCircumferenceInput('78.55'), false)
})

test('editor inputs include only selected-date explicit values', () => {
  const snapshot = createEmptyCircumferenceSnapshot('2026-07-27')
  snapshot.chest = { valueCm: 92.5, sourceDate: '2026-07-20', recordedOnSelectedDate: false }
  snapshot.waist = { valueCm: 78, sourceDate: '2026-07-27', recordedOnSelectedDate: true }

  assert.deepEqual(createCircumferenceInputs(snapshot), {
    chest: '',
    waist: '78',
    hip: '',
    arm: '',
    thigh: '',
    calf: ''
  })
})

test('sparse payload sends values and explicit selected-date clears', () => {
  const snapshot = createEmptyCircumferenceSnapshot('2026-07-27')
  snapshot.chest = { valueCm: 92, sourceDate: '2026-07-27', recordedOnSelectedDate: true }
  const payload = buildCircumferencePayload({
    chest: '',
    waist: '78.5',
    hip: '',
    arm: '',
    thigh: '',
    calf: ''
  }, snapshot)

  assert.deepEqual(payload, { waistCm: 78.5, clearFields: ['chest'] })
})

test('rolling range uses inclusive day counts and caps future end dates', () => {
  assert.equal(getCircumferenceRangeStart('2026-07-27', 7), '2026-07-21')
  assert.equal(capCircumferenceEndDate('2026-07-30', '2026-07-27'), '2026-07-27')
})

test('trend normalization preserves blanks and converts numeric values', () => {
  assert.deepEqual(normalizeCircumferencePoints([
    { date: '2026-07-26', valueCm: null },
    { date: '2026-07-27', valueCm: '78.5' }
  ]), [
    { date: '2026-07-26', valueCm: null },
    { date: '2026-07-27', valueCm: 78.5 }
  ])
})
