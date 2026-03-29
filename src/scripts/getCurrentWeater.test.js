import { getCurrentWeatherByCity, getCurrentWeatherByLocation, getCurrentWeatherByIp } from "./getCurrentWeater";

describe('getCurrentWeather', () => {
  const originalFetch = window.fetch;

  beforeEach(() => {
    window.fetch = jest.fn();
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  test('getCurrentWeatherByCity: success', async () => {
    const mockData = { list: [1, 2, 3] };
    window.fetch.mockResolvedValue({ ok: true, json: async () => mockData });
    const result = await getCurrentWeatherByCity('Moscow');
    expect(result).toEqual(mockData);
  });

  test('getCurrentWeatherByCity: error', async () => {
    window.fetch.mockRejectedValue(new Error('Network error'));
    const result = await getCurrentWeatherByCity('Moscow');
    expect(result).toBeNull();
  });

  test('getCurrentWeatherByLocation: success', async () => {
    const mockData = { list: [] };
    window.fetch.mockResolvedValue({ ok: true, json: async () => mockData });
    const result = await getCurrentWeatherByLocation(55.75, 37.62);
    expect(result).toEqual(mockData);
  });

  test('getCurrentWeatherByLocation: error', async () => {
    window.fetch.mockResolvedValue({ ok: false, status: 404 });
    const result = await getCurrentWeatherByLocation(55.75, 37.62);
    expect(result).toBeNull();
  });

  test('getCurrentWeatherByIp: success', async () => {
    window.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'success', city: 'Berlin' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ list: [{}] }) });
    const result = await getCurrentWeatherByIp();
    expect(result).toEqual({ list: [{}] });
  });

  test('getCurrentWeatherByIp: error', async () => {
    window.fetch.mockResolvedValue({ ok: true, json: async () => ({ status: 'fail' }) });
    const result = await getCurrentWeatherByIp();
    expect(result).toBeNull();
  });

  test('getCurrentWeatherByIp: error network', async () => {
    window.fetch.mockRejectedValue(new Error('Network error'));
    const result = await getCurrentWeatherByIp();
    expect(result).toBeNull();
  });
});