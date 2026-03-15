import { getCurrentWeather } from "./getCurrentWeater";

describe('getCurrentWeather', () => {
  const originalFetch = window.fetch;

  beforeEach(() => {
    window.fetch = jest.fn();
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  test('success', async () => {
    window.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ list: [1, 2, 3] })
    });

    const result = await getCurrentWeather('Moscow', 5);
    expect(result).toEqual({ list: [1, 2, 3] });
  });

  test('error', async () => {
    window.fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await getCurrentWeather('Moscow', 5);
    expect(result).toEqual({ list: [] });
  });
});