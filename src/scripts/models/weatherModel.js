import EventBus from "../utils/eventBus";

export class WeatherModel {
    #currentWeather = null;
    #forecastList = [];
    #loading = false;
    #error = null;
    #city = null;

    constructor() {
        this.#bindEvents();
    }

    #bindEvents() {
        EventBus.on("WeatherModel::setLoading", (loading) => {
            this.setLoading(loading);
        });

        EventBus.on("WeatherModel::setError", (error) => {
            this.setError(error);
        });

        EventBus.on("WeatherModel::setWeatherData", (data) => {
            this.setWeatherData(data);
        });

        EventBus.on("WeatherModel::clearData", () => {
            this.clearData();
        });

        EventBus.on("WeatherModel::getSnapshot", (callback) => {
            if (callback) callback(this.getSnapshot());
        });
    }

    #emitChange() {
        EventBus.emit("WeatherModel::modelChanged", this.getSnapshot());
    }

    setLoading(loading) {
        if (this.#loading !== loading) {
            this.#loading = loading;
            this.#emitChange();
        }
    }

    isLoading() {
        return this.#loading;
    }

    setError(error) {
        this.#error = error;
        this.#loading = false;
        this.#emitChange();
    }

    getError() {
        return this.#error;
    }

    hasError() {
        return this.#error !== null;
    }

    setWeatherData(data) {
        if (this.#isValidWeatherData(data)) {
            this.#currentWeather = data.list[0];
            this.#forecastList = data.list;
            this.#error = null;
            this.#loading = false;
            
            if (data.city && data.city.name) {
                this.#city = data.city.name;
            }
        } else {
            this.setError('Нет данных о погоде');
        }
        this.#emitChange();
    }

    clearData() {
        this.#currentWeather = null;
        this.#forecastList = [];
        this.#error = null;
        this.#loading = false;
        this.#city = null;
        this.#emitChange();
    }

    #isValidWeatherData(data) {
        return data && data.list && Array.isArray(data.list) && data.list.length > 0;
    }

    getCurrentWeather() {
        return this.#currentWeather;
    }

    getForecastList() {
        return this.#forecastList;
    }

    getCity() {
        return this.#city;
    }

    hasData() {
        return this.#forecastList.length > 0;
    }

    getTodayForecast() {
        if (!this.#hasValidForecastList()) return [];
        const today = this.#getDateFromForecast(0);
        return this.#filterForecastByDate(today);
    }

    getNextDaysForecast() {
        if (!this.#hasValidForecastList()) return [];
        const today = this.#getDateFromForecast(0);
        const result = [];
        let prevDate = today;
        for (const item of this.#forecastList) {
            const date = this.#getDateFromItem(item);
            const time = this.#getTimeFromItem(item);
            if (this.#isNextDayForecast(date, today, prevDate, time)) {
                result.push(item);
                prevDate = date;
            }
        }
        return result;
    }

    getSnapshot() {
        return {
            currentWeather: this.#currentWeather,
            forecastList: this.#forecastList,
            loading: this.#loading,
            error: this.#error,
            city: this.#city,
            hasData: this.hasData(),
            hasError: this.hasError(),
            todayForecast: this.getTodayForecast(),
            nextDaysForecast: this.getNextDaysForecast()
        };
    }

    #hasValidForecastList() {
        return this.#forecastList && this.#forecastList.length > 0;
    }

    #getDateFromForecast(index) {
        return this.#forecastList[index].dt_txt.split(' ')[0];
    }

    #getDateFromItem(item) {
        return item.dt_txt.split(' ')[0];
    }

    #getTimeFromItem(item) {
        return item.dt_txt.split(' ')[1];
    }

    #filterForecastByDate(date) {
        return this.#forecastList.filter(item => this.#getDateFromItem(item) === date);
    }

    #isNextDayForecast(date, today, prevDate, time) {
        return date !== today && date !== prevDate && time === "15:00:00";
    }
}