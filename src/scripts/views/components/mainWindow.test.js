import { MainWindow } from './mainWindow.js';

describe('MainWindow', () => {
    let mainWindow;
    let parentElement;

    beforeEach(() => {
        mainWindow = new MainWindow();
        parentElement = document.createElement('div');
        document.body.appendChild(parentElement);
        jest.useFakeTimers();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.useRealTimers();
    });

    describe('render', () => {
        test('should create all DOM elements', () => {
            mainWindow.render(parentElement);

            expect(parentElement.querySelector('.weather-card')).toBeTruthy();
            expect(parentElement.querySelector('.city-header')).toBeTruthy();
            expect(parentElement.querySelector('.city-container')).toBeTruthy();
            expect(parentElement.querySelector('.city-name')).toBeTruthy();
            expect(parentElement.querySelector('.find-me-button')).toBeTruthy();
            expect(parentElement.querySelector('.error-message')).toBeTruthy();
            expect(parentElement.querySelector('.weather-container')).toBeTruthy();
        });

        test('should return weather container', () => {
            const result = mainWindow.render(parentElement);
            expect(result.className).toBe('weather-container');
        });

        test('should set input placeholder', () => {
            mainWindow.render(parentElement);
            const input = parentElement.querySelector('.city-name');
            expect(input.placeholder).toBe('Введите город...');
        });

        test('should set button title', () => {
            mainWindow.render(parentElement);
            const button = parentElement.querySelector('.find-me-button');
            expect(button.title).toBe('Определить мое местоположение');
        });
    });

    describe('setCityValue', () => {
        test('should set city value when input exists', () => {
            mainWindow.render(parentElement);
            mainWindow.setCityValue('Moscow');
            expect(mainWindow.getCityValue()).toBe('Moscow');
        });

        test('should handle empty string', () => {
            mainWindow.render(parentElement);
            mainWindow.setCityValue('');
            expect(mainWindow.getCityValue()).toBe('');
        });

        test('should handle null as empty string', () => {
            mainWindow.render(parentElement);
            mainWindow.setCityValue(null);
            expect(mainWindow.getCityValue()).toBe('');
        });

        test('should not throw when cityInput is null', () => {
            const windowWithoutRender = new MainWindow();
            expect(() => windowWithoutRender.setCityValue('Moscow')).not.toThrow();
        });
    });

    describe('getCityValue', () => {
        test('should return city value when input exists', () => {
            mainWindow.render(parentElement);
            const input = parentElement.querySelector('.city-name');
            input.value = 'London';
            expect(mainWindow.getCityValue()).toBe('London');
        });

        test('should return empty string when input is null', () => {
            const windowWithoutRender = new MainWindow();
            expect(windowWithoutRender.getCityValue()).toBe('');
        });
    });

    describe('showError', () => {
        test('should show error message', () => {
            mainWindow.render(parentElement);
            const errorDiv = parentElement.querySelector('.error-message');
            
            mainWindow.showError('Test error');
            
            expect(errorDiv.style.display).toBe('block');
            expect(errorDiv.textContent).toBe('Test error');
        });

        test('should hide error after 3 seconds', () => {
            mainWindow.render(parentElement);
            const errorDiv = parentElement.querySelector('.error-message');
            
            mainWindow.showError('Test error');
            expect(errorDiv.style.display).toBe('block');
            
            jest.advanceTimersByTime(3000);
            expect(errorDiv.style.display).toBe('none');
        });

        test('should not throw when errorMessage is null', () => {
            const windowWithoutRender = new MainWindow();
            expect(() => windowWithoutRender.showError('Error')).not.toThrow();
        });

        test('should handle timeout when errorMessage is removed', () => {
            mainWindow.render(parentElement);
            const errorDiv = parentElement.querySelector('.error-message');
            
            mainWindow.showError('Test');
            errorDiv.remove();
            
            expect(() => jest.advanceTimersByTime(3000)).not.toThrow();
        });
    });

    describe('setLoading', () => {
        test('should set loading true', () => {
            mainWindow.render(parentElement);
            const button = parentElement.querySelector('.find-me-button');
            
            mainWindow.setLoading(true);
            
            expect(button.classList.contains('loading')).toBe(true);
            expect(button.disabled).toBe(true);
        });

        test('should set loading false', () => {
            mainWindow.render(parentElement);
            const button = parentElement.querySelector('.find-me-button');
            
            mainWindow.setLoading(false);
            
            expect(button.classList.contains('loading')).toBe(false);
            expect(button.disabled).toBe(false);
        });

        test('should not throw when findMeButton is null', () => {
            const windowWithoutRender = new MainWindow();
            expect(() => windowWithoutRender.setLoading(true)).not.toThrow();
            expect(() => windowWithoutRender.setLoading(false)).not.toThrow();
        });
    });

    describe('bindCityInput', () => {
        test('should bind input event', () => {
            mainWindow.render(parentElement);
            const handler = jest.fn();
            const input = parentElement.querySelector('.city-name');
            
            mainWindow.bindCityInput(handler);
            input.dispatchEvent(new Event('input'));
            
            expect(handler).toHaveBeenCalled();
        });

        test('should not throw when cityInput is null', () => {
            const windowWithoutRender = new MainWindow();
            expect(() => windowWithoutRender.bindCityInput(jest.fn())).not.toThrow();
        });
    });

    describe('bindFindMeButton', () => {
        test('should bind click event', () => {
            mainWindow.render(parentElement);
            const handler = jest.fn();
            const button = parentElement.querySelector('.find-me-button');
            
            mainWindow.bindFindMeButton(handler);
            button.click();
            
            expect(handler).toHaveBeenCalled();
        });

        test('should not throw when findMeButton is null', () => {
            const windowWithoutRender = new MainWindow();
            expect(() => windowWithoutRender.bindFindMeButton(jest.fn())).not.toThrow();
        });
    });

    describe('getWeatherContainer', () => {
        test('should return weather container', () => {
            mainWindow.render(parentElement);
            const container = mainWindow.getWeatherContainer();
            expect(container.className).toBe('weather-container');
        });
    });

    describe('destroy', () => {
        test('should remove element from DOM', () => {
            mainWindow.render(parentElement);
            expect(parentElement.querySelector('.weather-card')).toBeTruthy();
            
            mainWindow.destroy();
            
            expect(parentElement.querySelector('.weather-card')).toBeFalsy();
        });

        test('should not throw when element is null', () => {
            const windowWithoutRender = new MainWindow();
            expect(() => windowWithoutRender.destroy()).not.toThrow();
        });

        test('should not throw when element has no parent', () => {
            mainWindow.render(parentElement);
            const element = parentElement.querySelector('.weather-card');
            element.remove();
            
            expect(() => mainWindow.destroy()).not.toThrow();
        });
    });
});