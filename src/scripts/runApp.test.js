import { runApp } from './runApp.js';
import { WeatherModel } from './models/weatherModel.js';
import { WeatherView } from './views/weatherView.js';
import { WeatherController } from './controllers/weatherController.js';
import { WeatherService } from './services/weatherService.js';
import { LocationService } from './services/locationService.js';
import { StorageService } from './services/storageService.js';
import { AboutPage } from './views/components/about.js';
import router from './utils/router.js';
import eventBus from './utils/eventBus.js';

jest.mock('./models/weatherModel.js');
jest.mock('./views/weatherView.js');
jest.mock('./controllers/weatherController.js');
jest.mock('./services/weatherService.js');
jest.mock('./services/locationService.js');
jest.mock('./services/storageService.js');
jest.mock('./views/components/about.js');
jest.mock('./utils/router.js');
jest.mock('./utils/eventBus.js');

describe('runApp', () => {
    let mockElement;
    let mockWeatherPage;
    let mockController;
    let mockAboutPage;

    beforeEach(() => {
        jest.clearAllMocks();
        mockElement = {
            replaceChildren: jest.fn(),
            appendChild: jest.fn()
        };
        mockWeatherPage = document.createElement('div');
        mockAboutPage = {
            render: jest.fn()
        };
        
        router.addRoute = jest.fn().mockReturnValue(router);
        
        WeatherView.mockImplementation(() => ({
            render: jest.fn().mockReturnValue(mockWeatherPage)
        }));
        
        mockController = {
            initialize: jest.fn()
        };
        WeatherController.mockImplementation(() => mockController);
        
        AboutPage.mockImplementation(() => mockAboutPage);
    });

    test('should create all services and components', async () => {
        await runApp(mockElement);

        expect(WeatherService).toHaveBeenCalled();
        expect(LocationService).toHaveBeenCalled();
        expect(StorageService).toHaveBeenCalled();
        expect(WeatherModel).toHaveBeenCalled();
        expect(WeatherView).toHaveBeenCalled();
        expect(WeatherController).toHaveBeenCalled();
    });

    test('should render view with element', async () => {
        const mockRender = jest.fn().mockReturnValue(mockWeatherPage);
        WeatherView.mockImplementation(() => ({ render: mockRender }));

        await runApp(mockElement);

        expect(mockRender).toHaveBeenCalledWith(mockElement);
    });

    test('should pass view to controller', async () => {
        const mockView = { render: jest.fn().mockReturnValue(mockWeatherPage) };
        WeatherView.mockImplementation(() => mockView);

        await runApp(mockElement);

        expect(WeatherController).toHaveBeenCalledWith(mockView);
    });

    test('should initialize controller', async () => {
        await runApp(mockElement);

        expect(mockController.initialize).toHaveBeenCalled();
    });

    test('should add routes to router', async () => {
        await runApp(mockElement);

        expect(router.addRoute).toHaveBeenCalledTimes(3);
        expect(router.addRoute).toHaveBeenCalledWith('/', expect.any(Function));
        expect(router.addRoute).toHaveBeenCalledWith('/city/:cityName', expect.any(Function), true);
        expect(router.addRoute).toHaveBeenCalledWith('/about', expect.any(Function));
    });

    test('should handle home route', async () => {
        let homeRouteHandler;
        router.addRoute.mockImplementation((path, handler) => {
            if (path === '/') {
                homeRouteHandler = handler;
            }
            return router;
        });
        
        await runApp(mockElement);
        
        homeRouteHandler({});
        
        expect(mockElement.replaceChildren).toHaveBeenCalledWith(mockWeatherPage);
        expect(mockController.initialize).toHaveBeenCalled();
    });

    test('should handle city route', async () => {
        let cityRouteHandler;
        router.addRoute.mockImplementation((path, handler) => {
            if (path === '/city/:cityName') {
                cityRouteHandler = handler;
            }
            return router;
        });
        
        await runApp(mockElement);
        
        cityRouteHandler({ cityName: 'Moscow' });
        
        expect(eventBus.emit).toHaveBeenCalledWith("WeatherController::cityChanged", "Moscow");
        expect(mockElement.replaceChildren).toHaveBeenCalledWith(mockWeatherPage);
        expect(mockController.initialize).toHaveBeenCalled();
    });

    test('should handle about route', async () => {
        let aboutRouteHandler;
        router.addRoute.mockImplementation((path, handler) => {
            if (path === '/about') {
                aboutRouteHandler = handler;
            }
            return router;
        });
        
        await runApp(mockElement);
        
        aboutRouteHandler({});
        
        expect(AboutPage).toHaveBeenCalled();
        expect(mockAboutPage.render).toHaveBeenCalledWith(mockElement);
        expect(mockElement.replaceChildren).not.toHaveBeenCalled();
    });
});