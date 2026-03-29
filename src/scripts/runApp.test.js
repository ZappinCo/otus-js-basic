import { runApp } from './runApp';
import { createMainWindow } from './createMainWindow';
import { createTodayCards } from './createTodayCards';
import { createDetailInfo } from './createDetailInfo';
import { createForecatList } from './createForecatList';
import { getCurrentWeatherByIp, getCurrentWeatherByCity, getCurrentWeatherByLocation } from './getCurrentWeater';

jest.mock('./createMainWindow');
jest.mock('./createTodayCards');
jest.mock('./createDetailInfo');
jest.mock('./createForecatList');
jest.mock('./getCurrentWeater');
jest.mock('./showErrorMessage');

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const mockGeolocation = {
  getCurrentPosition: jest.fn(),
};
Object.defineProperty(global.navigator, 'geolocation', { value: mockGeolocation });

function setupDOM() {
  document.body.innerHTML = `
    <div id="app"></div>
    <input class="city-name" value="Moscow" />
    <button class="find-me-button"></button>
    <div class="weather-container"></div>
  `;
  return document.querySelector('#app');
}

describe('runApp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDOM();
  });

  it('should create main window and attach event listeners', async () => {
    const element = document.querySelector('#app');
    await runApp(element);

    expect(createMainWindow).toHaveBeenCalledWith(element);
  });

  it('should update weather on input event', async () => {
    const element = document.querySelector('#app');
    await runApp(element);

    const input = document.querySelector('.city-name');
    const mockWeatherData = { list: [{ main: {}, weather: [{}] }] };
    getCurrentWeatherByCity.mockResolvedValue(mockWeatherData);

    input.value = 'London';
    input.dispatchEvent(new Event('input'));

    await new Promise(process.nextTick);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('city', 'London');
    expect(getCurrentWeatherByCity).toHaveBeenCalledWith('London');
    expect(createTodayCards).toHaveBeenCalled();
    expect(createDetailInfo).toHaveBeenCalled();
    expect(createForecatList).toHaveBeenCalled();
  });

  it('should update weather on find-me button click using geolocation', async () => {
    const element = document.querySelector('#app');
    await runApp(element);

    const button = document.querySelector('.find-me-button');
    const mockPosition = {
      coords: { latitude: 55.75, longitude: 37.62 }
    };
    const mockWeatherData = { list: [], city: { name: 'Moscow' } };
    getCurrentWeatherByLocation.mockResolvedValue(mockWeatherData);
    mockGeolocation.getCurrentPosition.mockImplementation((success) => success(mockPosition));

    button.click();
    expect(button.classList.contains('loading')).toBe(true);

    await new Promise(process.nextTick);

    expect(getCurrentWeatherByLocation).toHaveBeenCalledWith(55.75, 37.62);
    expect(button.classList.contains('loading')).toBe(false);
    expect(document.querySelector('.city-name').value).toBe('Moscow');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('city', 'Moscow');
  });

  it('should fallback to IP geolocation when browser geolocation fails', async () => {
    const element = document.querySelector('#app');
    await runApp(element);

    const button = document.querySelector('.find-me-button');
    const mockWeatherData = { list: [], city: { name: 'FallbackCity' } };
    getCurrentWeatherByIp.mockResolvedValue(mockWeatherData);

    mockGeolocation.getCurrentPosition.mockImplementation((_, error) => error(new Error('denied')));

    button.click();
    await new Promise(process.nextTick);

    expect(getCurrentWeatherByIp).toHaveBeenCalled();
    expect(document.querySelector('.city-name').value).toBe('FallbackCity');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('city', 'FallbackCity');
  });
});