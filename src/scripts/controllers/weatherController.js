export class WeatherController {
    #model;
    #view;
    #weatherService;
    #locationService;
    #storageService;
    #debounceTimer;

    constructor(model, view, weatherService, locationService, storageService) {
        this.#model = model;
        this.#view = view;
        this.#weatherService = weatherService;
        this.#locationService = locationService;
        this.#storageService = storageService;
        
        this.#debounceTimer = null;
        this.#bindEvents();
        this.#subscribeToModel();
    }


    async initialize() {
        const savedCity = this.#storageService.getCity();
        
        if (savedCity) {
            this.#view.setCity(savedCity);
            await this.#loadWeather(savedCity);
        } else {
            await this.#loadWeatherByIp();
        }
    }

    #bindEvents() {
        this.#view.bindCityInput((event) => this.#onCityInputWithDebounce(event));
        this.#view.bindFindMeButton(() => this.#onFindMeClick());
    }

    #subscribeToModel() {
        this.#model.addObserver(() => this.#onModelChange());
    }


    #onCityInputWithDebounce(event) {
        if (this.#debounceTimer) {
            clearTimeout(this.#debounceTimer);
        }
        
        this.#debounceTimer = setTimeout(() => {
            this.#onCityInput(event);
        }, 500);
    }

    async #onCityInput(event) {
        const city = event.target.value;
        
        if (!city || city.trim() === '') {
            return;
        }
        
        this.#storageService.saveCity(city);
        await this.#loadWeather(city);
    }

    async #onFindMeClick() {
        if (this.#model.isLoading()) {
            return;
        }
        
        this.#view.setLoading(true);
        try {
            const position = await this.#locationService.getUserLocation();
            const weatherData = await this.#weatherService.getWeatherByLocation(
                position.coords.latitude,
                position.coords.longitude
            );
            
            await this.#handleWeatherData(weatherData);
        } catch (error) {
            console.warn('Geolocation error:', error);
            await this.#fallbackToIpLocation();
        } finally {
            this.#view.setLoading(false);
        }
    }

    #onModelChange() {
        this.#view.updateWeather(this.#model);
        
        if (this.#model.hasError()) {
            this.#view.showError(this.#model.getError());
        }
    }

    async #loadWeather(city) {
        if (!city || city.trim() === '') {
            return;
        }
        this.#model.setLoading(true);
        
        try {
            const weatherData = await this.#weatherService.getWeatherByCity(city);
            
            if (weatherData && weatherData.list && weatherData.list.length > 0) {
                this.#model.setWeatherData(weatherData);
            } else {
                this.#model.setError(`Нет данных о погоде для города ${city}`);
            }
        } catch (error) {
            console.error('Load weather error:', error);
            this.#model.setError('Ошибка загрузки данных о погоде');
        }
    }

    async #loadWeatherByIp() {
        this.#model.setLoading(true);
        
        try {
            const city = await this.#locationService.getCityByIp();
            
            if (city) {
                this.#storageService.saveCity(city);
                this.#view.setCity(city);
                await this.#loadWeather(city);
            } else {
                this.#model.setError('Не удалось определить ваше местоположение');
                this.#view.setLoading(false);
            }
        } catch (error) {
            console.error('IP location error:', error);
            this.#model.setError('Ошибка определения местоположения');
            this.#view.setLoading(false);
        }
    }

    async #fallbackToIpLocation() {
        const city = await this.#locationService.getCityByIp();
        
        if (city) {
            this.#storageService.saveCity(city);
            this.#view.setCity(city);
            await this.#loadWeather(city);
        } else {
            this.#model.setError('Не удалось определить ваше местоположение');
        }
    }

    async #handleWeatherData(weatherData) {
        if (weatherData && weatherData.city) {
            this.#storageService.saveCity(weatherData.city.name);
            this.#view.setCity(weatherData.city.name);
            this.#model.setWeatherData(weatherData);
        } else {
            this.#model.setError('Не удалось получить данные о погоде');
        }
    }
}