import { runApp } from './runApp';
import { WeatherModel } from './models/weatherModel';
import { WeatherView } from './views/weatherView';
import { WeatherController } from './controllers/weatherController';
import { WeatherService } from './services/weatherService';
import { LocationService } from './services/locationService';
import { StorageService } from './services/storageService';
import { AboutPage } from './views/components/about';
import router from './utils/router';
import eventBus from './utils/eventBus';

jest.mock('./models/weatherModel');
jest.mock('./views/weatherView');
jest.mock('./controllers/weatherController');
jest.mock('./services/weatherService');
jest.mock('./services/locationService');
jest.mock('./services/storageService');
jest.mock('./views/components/about');
jest.mock('./utils/router');
jest.mock('./utils/eventBus');

describe('runApp', () => {
    let mockElement: HTMLElement;
    let mockWeatherPage: HTMLElement;
    let mockController: { initialize: jest.Mock };
    let mockAboutPage: { render: jest.Mock };
    let mockView: { render: jest.Mock };

    beforeEach(() => {
        jest.clearAllMocks();

        mockElement = {
            replaceChildren: jest.fn(),
            appendChild: jest.fn()
        } as unknown as HTMLElement;

        mockWeatherPage = document.createElement('div');

        mockAboutPage = {
            render: jest.fn()
        };

        mockController = {
            initialize: jest.fn()
        };

        mockView = {
            render: jest.fn().mockReturnValue(mockWeatherPage)
        };

        (router.addRoute as jest.Mock).mockReturnValue(router);

        (WeatherView as jest.Mock).mockImplementation(() => mockView);
        (WeatherController as jest.Mock).mockImplementation(() => mockController);
        (AboutPage as jest.Mock).mockImplementation(() => mockAboutPage);
        (WeatherService as jest.Mock).mockImplementation(() => ({}));
        (LocationService as jest.Mock).mockImplementation(() => ({}));
        (StorageService as jest.Mock).mockImplementation(() => ({}));
        (WeatherModel as jest.Mock).mockImplementation(() => ({}));
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
        await runApp(mockElement);

        expect(mockView.render).toHaveBeenCalledWith(mockElement);
    });

    test('should pass view to controller', async () => {
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
        let homeRouteHandler: ((params?: any) => void) | undefined;
        (router.addRoute as jest.Mock).mockImplementation((path: string, handler: any) => {
            if (path === '/') {
                homeRouteHandler = handler;
            }
            return router;
        });

        await runApp(mockElement);

        if (homeRouteHandler) {
            homeRouteHandler({});
        }

        expect(mockElement.replaceChildren).toHaveBeenCalledWith(mockWeatherPage);
        expect(mockController.initialize).toHaveBeenCalled();
    });

    test('should handle city route', async () => {
        let cityRouteHandler: ((params?: any) => void) | undefined;
        (router.addRoute as jest.Mock).mockImplementation((path: string, handler: any) => {
            if (path === '/city/:cityName') {
                cityRouteHandler = handler;
            }
            return router;
        });

        await runApp(mockElement);

        if (cityRouteHandler) {
            cityRouteHandler({ cityName: 'Moscow' });
        }

        expect(eventBus.emit).toHaveBeenCalledWith("WeatherController::cityChanged", "Moscow");
        expect(mockElement.replaceChildren).toHaveBeenCalledWith(mockWeatherPage);
    });

    test('should handle about route', async () => {
        let aboutRouteHandler: ((params?: any) => void) | undefined;
        (router.addRoute as jest.Mock).mockImplementation((path: string, handler: any) => {
            if (path === '/about') {
                aboutRouteHandler = handler;
            }
            return router;
        });

        await runApp(mockElement);

        if (aboutRouteHandler) {
            aboutRouteHandler({});
        }

        expect(AboutPage).toHaveBeenCalled();
        expect(mockAboutPage.render).toHaveBeenCalledWith(mockElement);
    });
});