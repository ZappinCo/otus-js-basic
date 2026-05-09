import { LocationService } from './locationService';
import eventBus from '../utils/eventBus';

jest.mock('../utils/eventBus');

describe('LocationService', () => {
    let mockHttpService: any;
    let mockEmit: jest.Mock;
    let getCityByIpHandler: any;
    let getUserLocationHandler: any;
    let mockGeolocation: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockEmit = eventBus.emit as jest.Mock;
        mockHttpService = { get: jest.fn() };

        mockGeolocation = {
            getCurrentPosition: jest.fn()
        };

        Object.defineProperty(global.navigator, 'geolocation', {
            value: mockGeolocation,
            writable: true,
            configurable: true
        });

        (eventBus.on as jest.Mock).mockImplementation((event: string, handler: any) => {
            if (event === 'LocationService::getCityByIp') {
                getCityByIpHandler = handler;
            }
            if (event === 'LocationService::getUserLocation') {
                getUserLocationHandler = handler;
            }
        });

        new LocationService(mockHttpService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getCityByIp', () => {
        test('should emit cityDetected on success', async () => {
            mockHttpService.get.mockResolvedValue({ status: 'success', city: 'Moscow' });
            await getCityByIpHandler();

            expect(mockEmit).toHaveBeenCalledWith('LocationService::cityDetected', 'Moscow');
        });

        test('should emit error on fail', async () => {
            mockHttpService.get.mockResolvedValue({ status: 'fail' });
            await getCityByIpHandler();

            expect(mockEmit).toHaveBeenCalledWith('LocationService::error', expect.any(Error));
        });

        test('should emit error on network error', async () => {
            mockHttpService.get.mockRejectedValue(new Error('Network error'));
            await getCityByIpHandler();

            expect(mockEmit).toHaveBeenCalledWith('LocationService::error', expect.any(Error));
        });
    });

    describe('getUserLocation', () => {
        test('should emit userLocationReceived on success', () => {
            const mockPosition = {
                coords: {
                    latitude: 55.75,
                    longitude: 37.62
                }
            };

            mockGeolocation.getCurrentPosition.mockImplementation((success: any) => {
                success(mockPosition);
            });

            getUserLocationHandler();

            expect(mockEmit).toHaveBeenCalledWith('LocationService::userLocationReceived', {
                lat: 55.75,
                lon: 37.62
            });
        });

        test('should emit error when user denies location', () => {
            const error = { code: 1, message: 'User denied' };

            mockGeolocation.getCurrentPosition.mockImplementation((_: any, errorFn: any) => {
                errorFn(error);
            });

            getUserLocationHandler();

            expect(mockEmit).toHaveBeenCalledWith('LocationService::error', expect.any(Error));
            expect(mockEmit).toHaveBeenCalledWith('LocationService::getCityByIp');
        });

        test('should emit error when location unavailable (code 2)', () => {
            const error = { code: 2, message: 'Position unavailable' };

            mockGeolocation.getCurrentPosition.mockImplementation((_: any, errorFn: any) => {
                errorFn(error);
            });

            getUserLocationHandler();

            expect(mockEmit).toHaveBeenCalledWith('LocationService::error', expect.any(Error));
            expect(mockEmit).toHaveBeenCalledWith('LocationService::getCityByIp');
        });

        test('should emit error on timeout (code 3)', () => {
            const error = { code: 3, message: 'Timeout' };

            mockGeolocation.getCurrentPosition.mockImplementation((_: any, errorFn: any) => {
                errorFn(error);
            });

            getUserLocationHandler();

            expect(mockEmit).toHaveBeenCalledWith('LocationService::error', expect.any(Error));
            expect(mockEmit).toHaveBeenCalledWith('LocationService::getCityByIp');
        });

        test('should emit error when geolocation not supported', () => {
            Object.defineProperty(global.navigator, 'geolocation', {
                value: undefined,
                writable: true,
                configurable: true
            });

            let handler: any;
            (eventBus.on as jest.Mock).mockImplementation((event: string, h: any) => {
                if (event === 'LocationService::getUserLocation') {
                    handler = h;
                }
            });

            new LocationService(mockHttpService);

            handler();

            expect(mockEmit).toHaveBeenCalledWith('LocationService::error', expect.any(Error));
        });
    });
});