/**
 * Tests for validation utilities
 */

import { describe, expect,it } from 'vitest'

import { isValidHexColor } from './validation'

describe('isValidHexColor', () => {
	it('should accept valid 6-digit hex colors', () => {
		expect(isValidHexColor('#000000')).toBe(true)
		expect(isValidHexColor('#ffffff')).toBe(true)
		expect(isValidHexColor('#3b82f6')).toBe(true)
		expect(isValidHexColor('#8B5CF6')).toBe(true)
		expect(isValidHexColor('#FF00FF')).toBe(true)
	})

	it('should reject 3-digit hex colors', () => {
		expect(isValidHexColor('#fff')).toBe(false)
		expect(isValidHexColor('#000')).toBe(false)
		expect(isValidHexColor('#f0f')).toBe(false)
	})

	it('should reject invalid hex characters', () => {
		expect(isValidHexColor('#gggggg')).toBe(false)
		expect(isValidHexColor('#12345g')).toBe(false)
		expect(isValidHexColor('#zzzzzz')).toBe(false)
	})

	it('should reject colors without hash prefix', () => {
		expect(isValidHexColor('ffffff')).toBe(false)
		expect(isValidHexColor('000000')).toBe(false)
	})

	it('should reject named colors', () => {
		expect(isValidHexColor('red')).toBe(false)
		expect(isValidHexColor('blue')).toBe(false)
		expect(isValidHexColor('white')).toBe(false)
	})

	it('should reject empty strings', () => {
		expect(isValidHexColor('')).toBe(false)
	})

	it('should reject colors with wrong length', () => {
		expect(isValidHexColor('#12345')).toBe(false)
		expect(isValidHexColor('#1234567')).toBe(false)
	})
})
