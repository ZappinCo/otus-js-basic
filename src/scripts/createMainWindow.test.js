import { createMainWindow } from "./createMainWindow";

describe('createMainWindow', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('div');
    localStorage.clear();
  });

  test('return div', () => {
    const result = createMainWindow(element);
    expect(result.className).toBe('weather-container');
  });

  test('create elements', () => {
    createMainWindow(element);
    expect(element.querySelector('.weather-card')).toBeTruthy();
    expect(element.querySelector('.city-header')).toBeTruthy();
    expect(element.querySelector('.city-container')).toBeTruthy();
    expect(element.querySelector('.city-name')).toBeTruthy();
    expect(element.querySelector('.find-me-button')).toBeTruthy();
    expect(element.querySelector('.error-message')).toBeTruthy();
    expect(element.querySelector('.weather-container')).toBeTruthy();
  });

  test('city from local', () => {
    localStorage.setItem('city', 'London');
    createMainWindow(element);
    const input = element.querySelector('.city-name');
    expect(input.value).toBe('London');
  });

  test('empty local', () => {
    createMainWindow(element);
    const input = element.querySelector('.city-name');
    expect(input.value).toBe('');
  });
});