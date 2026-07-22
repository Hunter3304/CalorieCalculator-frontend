import assert from 'node:assert/strict'
import test from 'node:test'

import {
  capWeightEndDate,
  getWeightRangeStart,
  isValidWeightInput,
  normalizeWeightPoints
} from '../src/utils/weightTrend.mjs'

test('caps a future selected end date at today', () => {
  assert.equal(capWeightEndDate('2026-07-29', '2026-07-22'), '2026-07-22')
  assert.equal(capWeightEndDate('2026-07-20', '2026-07-22'), '2026-07-20')
})

test('builds inclusive rolling date ranges', () => {
  assert.equal(getWeightRangeStart('2026-07-22', 7), '2026-07-16')
  assert.equal(getWeightRangeStart('2026-07-22', 30), '2026-06-23')
  assert.equal(getWeightRangeStart('2026-07-22', 365), '2025-07-23')
})

test('validates positive kilogram values with one decimal place', () => {
  assert.equal(isValidWeightInput('65'), true)
  assert.equal(isValidWeightInput('65.5'), true)
  assert.equal(isValidWeightInput('65.55'), false)
  assert.equal(isValidWeightInput('0'), false)
  assert.equal(isValidWeightInput('-1'), false)
})

test('normalizes API decimal values for chart rendering', () => {
  assert.deepEqual(normalizeWeightPoints([
    { date: '2026-07-21', weightKg: null },
    { date: '2026-07-22', weightKg: '65.5' }
  ]), [
    { date: '2026-07-21', weightKg: null },
    { date: '2026-07-22', weightKg: 65.5 }
  ])
})
