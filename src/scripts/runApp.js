import { WeatherModel } from './models/weatherModel.js';
import { WeatherView } from './views/weatherView.js';
import { WeatherController } from './controllers/weatherController.js';
import { WeatherService } from './services/weatherService.js';
import { LocationService } from './services/locationService.js';
import { StorageService } from './services/storageService.js';
import { AboutPage } from './views/components/about.js';
import router from './utils/router.js';
import eventBus from './utils/eventBus.js';

export async function runApp(element) {
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
        const cityName = params.cityName;
        eventBus.emit("WeatherController::cityChanged", cityName);
        element.replaceChildren(weatherPage);
    }, true)

    .addRoute('/about', (params) => {

        console.log('О приложении', params);
        let aboutPage = new AboutPage();
        aboutPage.render(element);
    });
}