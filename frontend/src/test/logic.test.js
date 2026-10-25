import { describe, expect, test } from 'bun:test';
import logic from '../logic/logic.js';

const { noteCheck1, noteCheck2, noteCheck3, noteCheck4, noteCheck5 } = logic;

describe('Tests the props from Note', () => {
  test('x exists', () => {
    expect(noteCheck1(true)).toBe(true);
  });
  test('y exists', () => {
    expect(noteCheck2(true)).toBe(true);
  });
  test('w exists', () => {
    expect(noteCheck3(true)).toBe(true);
  });
  test('h exists', () => {
    expect(noteCheck4(true)).toBe(true);
  });
  test('masterId exists', () => {
    expect(noteCheck5(true)).toBe(true);
  });
});

const { favoritesCheck1, favoritesCheck2, favoritesCheck3, favoritesCheck4, favoritesCheck5 } =
  logic;

describe('Tests the props from Favorites', () => {
  test('x exists', () => {
    expect(favoritesCheck1(true)).toBe(true);
  });
  test('y exists', () => {
    expect(favoritesCheck2(true)).toBe(true);
  });
  test('w exists', () => {
    expect(favoritesCheck3(true)).toBe(true);
  });
  test('h exists', () => {
    expect(favoritesCheck4(true)).toBe(true);
  });
  test('masterId exists', () => {
    expect(favoritesCheck5(true)).toBe(true);
  });
});

const { clockCheck1, clockCheck2, clockCheck3, clockCheck4, clockCheck5 } = logic;

describe('Tests the props from clock', () => {
  test('x exists', () => {
    expect(clockCheck1(true)).toBe(true);
  });
  test('y exists', () => {
    expect(clockCheck2(true)).toBe(true);
  });
  test('w exists', () => {
    expect(clockCheck3(true)).toBe(true);
  });
  test('h exists', () => {
    expect(clockCheck4(true)).toBe(true);
  });
  test('masterId exists', () => {
    expect(clockCheck5(true)).toBe(true);
  });
});

//Adams tests
const { weatherCheck1, weatherCheck2, weatherCheck3, weatherCheck4, weatherCheck5 } = logic;

describe('Tests the props from weather', () => {
  test('x exists', () => {
    expect(weatherCheck1(true)).toBe(true);
  });
  test('y exists', () => {
    expect(weatherCheck2(true)).toBe(true);
  });
  test('w exists', () => {
    expect(weatherCheck3(true)).toBe(true);
  });
  test('h exists', () => {
    expect(weatherCheck4(true)).toBe(true);
  });
  test('masterId exists', () => {
    expect(weatherCheck5(true)).toBe(true);
  });
});
