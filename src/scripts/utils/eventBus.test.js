import EventBusClass from './eventBus.js';

const EventBus = EventBusClass.constructor;

describe('EventBus', () => {
    let eventBus;

    beforeEach(() => {
        EventBus.instance = null;
        eventBus = new EventBus();
    });

    describe('constructor and singleton', () => {
        test('should create new instance', () => {
            expect(eventBus).toBeInstanceOf(EventBus);
        });

        test('should return same instance (singleton)', () => {
            const instance1 = new EventBus();
            const instance2 = new EventBus();
            expect(instance1).toBe(instance2);
        });

        test('should initialize events map', () => {
            expect(eventBus.events).toBeInstanceOf(Map);
        });
    });

    describe('on', () => {
        test('should subscribe to event', () => {
            const callback = jest.fn();
            eventBus.on('test', callback);
            
            eventBus.emit('test');
            expect(callback).toHaveBeenCalledTimes(1);
        });

        test('should return unsubscribe function', () => {
            const callback = jest.fn();
            const unsubscribe = eventBus.on('test', callback);
            
            unsubscribe();
            eventBus.emit('test');
            expect(callback).not.toHaveBeenCalled();
        });

        test('should allow multiple callbacks for same event', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            
            eventBus.on('test', callback1);
            eventBus.on('test', callback2);
            
            eventBus.emit('test');
            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);
        });
    });

    describe('once', () => {
        test('should call callback only once', () => {
            const callback = jest.fn();
            eventBus.once('test', callback);
            
            eventBus.emit('test');
            eventBus.emit('test');
            eventBus.emit('test');
            
            expect(callback).toHaveBeenCalledTimes(1);
        });

        test('should pass arguments to callback', () => {
            const callback = jest.fn();
            eventBus.once('test', callback);
            
            eventBus.emit('test', 'arg1', 'arg2');
            expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
        });

        test('should auto-unsubscribe after call', () => {
            const callback = jest.fn();
            eventBus.once('test', callback);
            
            eventBus.emit('test');
            eventBus.emit('test');
            
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('off', () => {
        test('should unsubscribe callback', () => {
            const callback = jest.fn();
            eventBus.on('test', callback);
            eventBus.off('test', callback);
            
            eventBus.emit('test');
            expect(callback).not.toHaveBeenCalled();
        });

        test('should remove event when no callbacks left', () => {
            const callback = jest.fn();
            eventBus.on('test', callback);
            eventBus.off('test', callback);
            
            eventBus.emit('test');
            expect(eventBus.events.has('test')).toBe(false);
        });

        test('should do nothing for non-existent event', () => {
            expect(() => eventBus.off('non-existent', jest.fn())).not.toThrow();
        });

        test('should do nothing for non-existent callback', () => {
            const callback = jest.fn();
            eventBus.on('test', callback);
            eventBus.off('test', jest.fn());
            
            expect(eventBus.events.get('test').size).toBe(1);
        });
    });

    describe('emit', () => {
        test('should call all subscribers with arguments', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            
            eventBus.on('test', callback1);
            eventBus.on('test', callback2);
            
            eventBus.emit('test', 'data', 123);
            
            expect(callback1).toHaveBeenCalledWith('data', 123);
            expect(callback2).toHaveBeenCalledWith('data', 123);
        });

        test('should do nothing for non-existent event', () => {
            expect(() => eventBus.emit('non-existent')).not.toThrow();
        });

        test('should catch and log errors in callbacks', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const errorCallback = () => { throw new Error('Test error'); };
            const normalCallback = jest.fn();
            
            eventBus.on('test', errorCallback);
            eventBus.on('test', normalCallback);
            eventBus.emit('test');
            
            expect(consoleSpy).toHaveBeenCalled();
            expect(normalCallback).toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });
    });

    describe('clear', () => {
        beforeEach(() => {
            eventBus.on('event1', jest.fn());
            eventBus.on('event2', jest.fn());
            eventBus.on('event3', jest.fn());
        });

        test('should clear specific event', () => {
            eventBus.clear('event1');
            
            expect(eventBus.events.has('event1')).toBe(false);
            expect(eventBus.events.has('event2')).toBe(true);
            expect(eventBus.events.has('event3')).toBe(true);
        });

        test('should clear all events when no argument', () => {
            eventBus.clear();
            
            expect(eventBus.events.size).toBe(0);
        });

        test('should do nothing for non-existent event', () => {
            expect(() => eventBus.clear('non-existent')).not.toThrow();
        });
    });

    describe('edge cases', () => {
        test('should handle subscribing and unsubscribing within callback', () => {
            const callback = jest.fn();
            let unsubscribe;
            
            unsubscribe = eventBus.on('test', () => {
                callback();
                unsubscribe();
            });
            
            eventBus.emit('test');
            eventBus.emit('test');
            
            expect(callback).toHaveBeenCalledTimes(1);
        });

        test('should handle once with unsubscribe', () => {
            const callback = jest.fn();
            const unsubscribe = eventBus.once('test', callback);
            
            unsubscribe();
            eventBus.emit('test');
            
            expect(callback).not.toHaveBeenCalled();
        });

        test('should maintain correct order of callbacks', () => {
            const order = [];
            
            eventBus.on('test', () => order.push(1));
            eventBus.on('test', () => order.push(2));
            eventBus.on('test', () => order.push(3));
            eventBus.emit('test');
            
            expect(order).toEqual([1, 2, 3]);
        });

        test('should handle undefined or null arguments', () => {
            const callback = jest.fn();
            eventBus.on('test', callback);
            eventBus.emit('test', undefined, null, 0, false, '');
            
            expect(callback).toHaveBeenCalledWith(undefined, null, 0, false, '');
        });
    });
});