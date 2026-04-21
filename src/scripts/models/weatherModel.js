export class WeatherModel {
    #currentWeather = null;
    #forecastList = [];
    #loading = false;
    #error = null;
    #observers = [];

    constructor() {
    }


    addObserver(observer) {
        if (typeof observer !== 'function') {
            throw new Error('Observer must be a function');
        }
        this.#observers.push(observer);
    }


    #notifyObservers() {
        this.#observers.forEach(observer => {
            try {
                observer(this);
            } catch (error) {
                console.error('Observer notification error:', error);
            }
        });
    }


    setLoading(loading) {
        if (this.#loading !== loading) {
            this.#loading = loading;
            this.#notifyObservers();
        }
    }


    isLoading() {
        return this.#loading;
    }

    setError(error) {
        this.#error = error;
        this.#loading = false;
        this.#notifyObservers();
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
        } else {
            this.setError('Нет данных о погоде');
        }
        this.#notifyObservers();
    }


    #isValidWeatherData(data) {
        return data &&
            data.list &&
            Array.isArray(data.list) &&
            data.list.length > 0;
    }


    getCurrentWeather() {
        return this.#currentWeather;
    }


    getForecastList() {
        return this.#forecastList;
    }


    hasData() {
        return this.#forecastList.length > 0;
    }


    getTodayForecast() {
        if (!this.#hasValidForecastList()) {
            return [];
        }

        const today = this.#getDateFromForecast(0);
        return this.#filterForecastByDate(today);
    }


    getNextDaysForecast() {
        if (!this.#hasValidForecastList()) {
            return [];
        }

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
        return this.#forecastList.filter(item => {
            const itemDate = this.#getDateFromItem(item);
            return itemDate === date;
        });
    }


    #isNextDayForecast(date, today, prevDate, time) {
        return date !== today &&
            date !== prevDate &&
            time === "15:00:00";
    }
}