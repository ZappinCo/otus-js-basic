import { WeatherModel } from './models/weatherModel';
import { WeatherView } from './views/weatherView';
import { WeatherController } from './controllers/weatherController';
import { WeatherService } from './services/weatherService';
import { LocationService } from './services/locationService';
import { StorageService } from './services/storageService';
import { AboutPage } from './views/components/about';
import router from './utils/router';
import eventBus from './utils/eventBus';

export async function runApp(element: HTMLElement) {
    new WeatherService();
    new LocationService();
    new StorageService();

    new WeatherModel();
    const view = new WeatherView();
    let weatherPage = view.render(element);

    let controller = new WeatherController(view);
    controller.initialize();

    router
        .addRoute('/', () => {
            element.replaceChildren(weatherPage);
            controller.initialize();
        })

        .addRoute('/city/:cityName', (params) => {
            if (params == undefined)
                return;
            const cityName = params.cityName;
            eventBus.emit("WeatherController::cityChanged", cityName);
            element.replaceChildren(weatherPage);
        }, true)

        .addRoute('/about', () => {
            let aboutPage = new AboutPage();
            aboutPage.render(element);
        });
}