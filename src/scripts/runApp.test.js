import { runApp } from "./runApp";
import { getCurrentWeather } from "./getCurrentWeater";
import { showErrorMessage } from "./showErrorMessage";

jest.mock("./getCurrentWeater");
jest.mock("./showErrorMessage");

describe('runApp', () => {
  beforeEach(() => {
    document.body.innerHTML = '<input class="city-name" value="Moscow"><div class="weather-container"></div>';
  });

    const data = [
    { dt_txt: "2026-03-15 09:00:00", main: { temp: 7 }, weather: [{ icon: "02d", description: "few clouds" }],wind:{speed:3} },
    { dt_txt: "2026-03-15 12:00:00", main: { temp: 8 }, weather: [{ icon: "02d", description: "few clouds" }],wind:{speed:3} },
    { dt_txt: "2026-03-16 09:00:00", main: { temp: 6 }, weather: [{ icon: "04n", description: "broken clouds" }],wind:{speed:3} },
    { dt_txt: "2026-03-16 09:00:00", main: { temp: -5 }, weather: [{ icon: "04n", description: "broken clouds" }],wind:{speed:3} }
  ];

  test('data', async () => {
    getCurrentWeather.mockResolvedValue({ list: data });
    await runApp(document.createElement('div'));
    expect(getCurrentWeather).toHaveBeenCalled();
  });

  test('without data', async () => {
    getCurrentWeather.mockResolvedValue({ list: [] });
    await runApp(document.createElement('div'));
    expect(showErrorMessage).toHaveBeenCalled();
  });
});