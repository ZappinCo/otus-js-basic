import { translateWeatherDesc } from "./translateWeatherDesc";

test('translateWeatherDesc', () => {
  expect(translateWeatherDesc('clear sky')).toBe('ясно');
  expect(translateWeatherDesc('few clouds')).toBe('малооблачно');
  expect(translateWeatherDesc('rain')).toBe('дождь');
  expect(translateWeatherDesc('snow')).toBe('снег');
  expect(translateWeatherDesc('unknown')).toBe('unknown');
});