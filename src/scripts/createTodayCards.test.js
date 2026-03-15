import { createTodayCards } from "./createTodayCards";
import { translateWeatherDesc } from "./translateWeatherDesc";
import { formatDate } from "./formatDate";

jest.mock("./translateWeatherDesc");
jest.mock("./formatDate");

describe('createTodayCards', () => {
  let el;
  const data = [
    { dt_txt: "2026-03-15 09:00:00", main: { temp: 7 }, weather: [{ icon: "02d", description: "few clouds" }] },
    { dt_txt: "2026-03-15 12:00:00", main: { temp: 8 }, weather: [{ icon: "02d", description: "few clouds" }] },
    { dt_txt: "2026-03-16 09:00:00", main: { temp: 6 }, weather: [{ icon: "04n", description: "broken clouds" }] },
    { dt_txt: "2026-03-16 09:00:00", main: { temp: -5 }, weather: [{ icon: "04n", description: "broken clouds" }] }
  ];

  beforeEach(() => {
    el = document.createElement('div');
    formatDate.mockReturnValue('15 марта');
    translateWeatherDesc.mockReturnValue('малооблачно');
  });

  test('only first', () => {
    createTodayCards(el, data);
    expect(el.querySelectorAll('.today-item').length).toBe(2);
  });

  test('label with date', () => {
    createTodayCards(el, data);
    expect(el.querySelector('.today-title').innerText).toBe('Сегодня, 15 марта');
  });

  test('time and temp', () => {
    createTodayCards(el, [data[0]]);
    expect(el.querySelector('.today-time').innerText).toBe('09:00');
    expect(el.querySelector('.today-temp').innerText).toBe('+7°');
  });

  test('minus', () => {
    createTodayCards(el, [data[3]]);
    expect(el.querySelector('.today-temp').innerText).toBe('-5°');
  });

  test('icon and desc', () => {
    createTodayCards(el, [data[0]]);
    const img = el.querySelector('img');
    expect(img.src).toContain('02d.png');
    expect(img.alt).toBe('few clouds');
    expect(el.querySelector('.today-desc').innerText).toBe('малооблачно');
  });
});