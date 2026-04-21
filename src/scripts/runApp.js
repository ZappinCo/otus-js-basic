import { WeatherModel } from './models/weatherModel.js';
import { WeatherView } from './views/weatherView.js';
import { WeatherController } from './controllers/weatherController.js';
import { WeatherService } from './services/weatherService.js';
import { LocationService } from './services/locationService.js';
import { StorageService } from './services/storageService.js';

export async function runApp(element) {
    const weatherService = new WeatherService();
    const locationService = new LocationService();
    const storageService = new StorageService();
    
    const model = new WeatherModel();
    const view = new WeatherView();
    view.render(element);
    const controller = new WeatherController(
        model, 
        view, 
        weatherService, 
        locationService, 
        storageService
    );
    
    await controller.initialize();
}