import { WeatherModel } from './models/weatherModel.js';
import { WeatherView } from './views/weatherView.js';
import { WeatherController } from './controllers/weatherController.js';
import { WeatherService } from './services/weatherService.js';
import { LocationService } from './services/locationService.js';
import { StorageService } from './services/storageService.js';

export async function runApp(element) {
    new WeatherService();
    new LocationService();
    new StorageService();
    
    new WeatherModel();
    const view = new WeatherView();
    view.render(element);
    
    new WeatherController(view).initialize();

}