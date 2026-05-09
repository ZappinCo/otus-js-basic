import eventBus from './eventBus';
import { ForecastData } from '../../types/forecast';

describe('EventBus', () => {
    let bus: typeof eventBus;

    beforeEach(() => {
        bus = eventBus;
    });

    describe('singleton', () => {
        test('should return same instance', () => {
            const instance1 = eventBus;
            const instance2 = eventBus;
            expect(instance1).toBe(instance2);
        });
    });

    describe('on', () => {
        test('should subscribe to event', () => {
            const callback = jest.fn();
            bus.on('test', callback);

            bus.emit('test');
            expect(callback).toHaveBeenCalledTimes(1);
        });

        test('should return unsubscribe function', () => {
            const callback = jest.fn();
            const unsubscribe = bus.on('test', callback);

            unsubscribe();
            bus.emit('test');
            expect(callback).not.toHaveBeenCalled();
        });

        test('should allow multiple callbacks for same event', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            bus.on('test', callback1);
            bus.on('test', callback2);

            bus.emit('test');
            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);
        });

        test('should pass parameter to callback', () => {
            const callback = jest.fn();
            bus.on('test', callback);

            bus.emit('test', 'hello');
            expect(callback).toHaveBeenCalledWith('hello');
        });
    });

    describe('off', () => {
        test('should unsubscribe callback', () => {
            const callback = jest.fn();
            bus.on('test', callback);
            bus.off('test', callback);

            bus.emit('test');
            expect(callback).not.toHaveBeenCalled();
        });

        test('should do nothing for non-existent event', () => {
            expect(() => bus.off('non-existent', jest.fn())).not.toThrow();
        });

        test('should do nothing for non-existent callback', () => {
            const callback = jest.fn();
            bus.on('test', callback);
            bus.off('test', jest.fn());

            bus.emit('test');
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('emit', () => {
        test('should call all subscribers with arguments', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            bus.on('test', callback1);
            bus.on('test', callback2);

            bus.emit('test', 'data');

            expect(callback1).toHaveBeenCalledWith('data');
            expect(callback2).toHaveBeenCalledWith('data');
        });

        test('should do nothing for non-existent event', () => {
            expect(() => bus.emit('non-existent')).not.toThrow();
        });

        test('should handle no parameters', () => {
            const callback = jest.fn();
            bus.on('test', callback);

            bus.emit('test');
            expect(callback).toHaveBeenCalledWith(null);
        });

        test('should catch and log errors in callbacks', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const errorCallback = () => { throw new Error('Test error'); };
            const normalCallback = jest.fn();

            bus.on('test', errorCallback);
            bus.on('test', normalCallback);
            bus.emit('test');

            expect(consoleSpy).toHaveBeenCalled();
            expect(normalCallback).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('clear', () => {
        test('should clear specific event', () => {
            const callback = jest.fn();
            bus.on('test', callback);
            bus.clear('test');

            bus.emit('test');
            expect(callback).not.toHaveBeenCalled();
        });

        test('should do nothing for non-existent event', () => {
            expect(() => bus.clear('non-existent')).not.toThrow();
        });
    });

    describe('edge cases', () => {
        test('should handle subscribing and unsubscribing within callback', () => {
            const callback = jest.fn();
            let unsubscribe: (() => void) | undefined;

            unsubscribe = bus.on('test', () => {
                callback();
                if (unsubscribe) unsubscribe();
            });

            bus.emit('test');
            bus.emit('test');

            expect(callback).toHaveBeenCalledTimes(1);
        });

        test('should maintain correct order of callbacks', () => {
            const order: number[] = [];

            bus.on('test', () => { order.push(1); });
            bus.on('test', () => { order.push(2); });
            bus.on('test', () => { order.push(3); });
            bus.emit('test');

            expect(order).toEqual([1, 2, 3]);
        });

        test('should handle string parameter', () => {
            const callback = jest.fn();
            bus.on('test', callback);

            bus.emit('test', 'string value');
            expect(callback).toHaveBeenCalledWith('string value');
        });

        test('should handle boolean parameter', () => {
            const callback = jest.fn();
            bus.on('test', callback);

            bus.emit('test', true);
            expect(callback).toHaveBeenCalledWith(true);
        });

        test('should handle object parameter', () => {
            const callback = jest.fn();
            bus.on('test', callback);
            const obj = { key: 'value' };

            bus.emit('test', obj);
            expect(callback).toHaveBeenCalledWith(obj);
        });

        test('should handle null parameter', () => {
            const callback = jest.fn();
            bus.on('test', callback);

            bus.emit('test', null);
            expect(callback).toHaveBeenCalledWith(null);
        });

        test('should handle ForecastData array', () => {
            const callback = jest.fn();
            bus.on('test', callback);
            const forecastData: ForecastData[] = [{
                city: 'Moscow',
                dt: '2024-01-01',
                description: 'clear',
                icon: '01d',
                temp: 20,
                temp_min: 15,
                speed: 5,
                pressure: 1013,
                humidity: 65
            }];

            bus.emit('test', forecastData);
            expect(callback).toHaveBeenCalledWith(forecastData);
        });

        test('should handle Record<string, string>', () => {
            const callback = jest.fn();
            bus.on('test', callback);
            const record: Record<string, string> = { key: 'value', name: 'test' };

            bus.emit('test', record);
            expect(callback).toHaveBeenCalledWith(record);
        });

        test('should handle Error object', () => {
            const callback = jest.fn();
            bus.on('test', callback);
            const error = new Error('Test error');

            bus.emit('test', error);
            expect(callback).toHaveBeenCalledWith(error);
        });
    });
});