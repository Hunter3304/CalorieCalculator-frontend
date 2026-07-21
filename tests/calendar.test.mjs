import assert from 'node:assert/strict'
import test from 'node:test'

import {
  addDays,
  getCalendarCells,
  isDateInRange,
  shiftMonth
} from '../src/utils/calendar.mjs'

test('adds days across month and year boundaries', () => {
  assert.equal(addDays('2026-07-31', 1), '2026-08-01')
  assert.equal(addDays('2026-01-01', -1), '2025-12-31')
})

test('shifts months across year boundaries', () => {
  assert.equal(shiftMonth('2026-12', 1), '2027-01')
  assert.equal(shiftMonth('2026-01', -1), '2025-12')
})

test('builds complete natural months with weekday alignment', () => {
  const february2028 = getCalendarCells('2028-02').filter(Boolean)
  const february2027 = getCalendarCells('2027-02').filter(Boolean)
  const april2026 = getCalendarCells('2026-04').filter(Boolean)
  const july2026 = getCalendarCells('2026-07').filter(Boolean)

  assert.equal(february2028.length, 29)
  assert.equal(february2027.length, 28)
  assert.equal(april2026.length, 30)
  assert.equal(july2026.length, 31)
  assert.equal(getCalendarCells('2026-07').indexOf('2026-07-01'), 3)
})

test('checks inclusive selectable date boundaries', () => {
  const minDate = '2025-07-21'
  const maxDate = '2026-07-28'

  assert.equal(isDateInRange(minDate, minDate, maxDate), true)
  assert.equal(isDateInRange(maxDate, minDate, maxDate), true)
  assert.equal(isDateInRange('2025-07-20', minDate, maxDate), false)
  assert.equal(isDateInRange('2026-07-29', minDate, maxDate), false)
})
