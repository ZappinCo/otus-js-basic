import { ForecastData, isForecastDataArray } from "../../types/forecast";
import { WeatherModelSnapshot } from "../../types/weathermodelsnapshot";
import eventBus from "../utils/eventBus";


export class WeatherModel {
    #currentWeather: ForecastData | null = null;
    #forecastList: ForecastData[] = [];
    #loading = false;
    #error: string | null = null;
    #city: string | null = null;

    constructor() {
        this.#bindEvents();
    }

    #bindEvents() {
        eventBus.on("WeatherModel::setLoading", (loading) => {
            if (typeof (loading) != "boolean")
                return;

            this.setLoading(loading);
        });

        eventBus.on("WeatherModel::setError", (error) => {
            if (typeof (error) != "string")
                return;

            this.setError(error);
        });

        eventBus.on("WeatherModel::setWeatherData", (data) => {
            if (!isForecastDataArray(data))
                return;

            this.setWeatherData(data);
        });

        eventBus.on("WeatherModel::clearData", () => {
            this.clearData();
        });

        eventBus.on("WeatherModel::getSnapshot", () => {
            eventBus.emit("WeatherModel::setSnapshot", this.getSnapshot());
        });
    }

    #emitChange() {
        eventBus.emit("WeatherModel::modelChanged", this.getSnapshot());
    }

    setLoading(loading: boolean) {
        if (this.#loading !== loading) {
            this.#loading = loading;
            this.#emitChange();
        }
    }

    isLoading() {
        return this.#loading;
    }

    setError(error: string) {
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

    setWeatherData(data: ForecastData[]) {
        if (data.length > 0) {
            this.#currentWeather = data[0];
            this.#forecastList = data;
            this.#error = null;
            this.#loading = false;
            this.#city = this.#currentWeather.city;

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

    getSnapshot(): WeatherModelSnapshot {
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

    #getDateFromForecast(index: number) {
        return this.#forecastList[index].dt.split(' ')[0];
    }

    #getDateFromItem(item: ForecastData) {
        return item.dt.split(' ')[0];
    }

    #getTimeFromItem(item: ForecastData) {
        return item.dt.split(' ')[1];
    }

    #filterForecastByDate(date: string) {
        return this.#forecastList.filter(item => this.#getDateFromItem(item) === date);
    }

    #isNextDayForecast(date: string, today: string, prevDate: string, time: string) {
        return date !== today && date !== prevDate && time === "15:00:00";
    }
}