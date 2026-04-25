import {
  calcularDistanciaHaversine,
  calculateFreeSpaceAtenuation,
  parseStringToRectangularCoordinates,
} from '../../helpers/helper'

describe('helpers', () => {
  test('calcularDistanciaHaversine retorna 0 para pontos iguais', () => {
    expect(calcularDistanciaHaversine(0, 0, 0, 0)).toBeCloseTo(0, 8)
  })

  test('calcularDistanciaHaversine retorna > 0 para pontos distintos', () => {
    expect(calcularDistanciaHaversine(0, 0, 0, 1)).toBeGreaterThan(0)
  })

  test('parseStringToRectangularCoordinates parseia "lat,lng"', () => {
    expect(parseStringToRectangularCoordinates('10, 20')).toEqual({
      latitude: 10,
      longitude: 20,
    })
  })

  test('parseStringToRectangularCoordinates retorna null para inválido', () => {
    expect(parseStringToRectangularCoordinates('abc')).toBeNull()
    expect(parseStringToRectangularCoordinates('1, x')).toBeNull()
  })

  test('calculateFreeSpaceAtenuation lança erro com inputs inválidos', () => {
    expect(() => calculateFreeSpaceAtenuation(0, 1)).toThrow()
    expect(() => calculateFreeSpaceAtenuation(1, 0)).toThrow()
  })

  test('calculateFreeSpaceAtenuation retorna número finito para inputs válidos', () => {
    const v = calculateFreeSpaceAtenuation(1, 8)
    expect(Number.isFinite(v)).toBe(true)
  })
})

