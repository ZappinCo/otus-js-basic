import eventBus from "../utils/eventBus";
import { HttpService } from './httpService';

export class LocationService {
    httpService: HttpService | null;

    constructor(httpService: HttpService | null = null) {
        this.httpService = httpService || new HttpService();
        this.#bindEvents();
    }

    #bindEvents() {
        eventBus.on("LocationService::getCityByIp", async () => {
            await this.#getCityByIp();
        });

        eventBus.on("LocationService::getUserLocation", () => {
            this.#getUserLocation();
        });
    }

    async #getCityByIp() {
        try {
            const url = 'https://ip-api.com/json/?fields=status,city';
            const data = await this.httpService?.get(url);

            if (data.status === 'success' && data.city) {
                eventBus.emit("LocationService::cityDetected", data.city);
            } else {
                eventBus.emit("LocationService::error", new Error('Не удалось определить город по IP'));
            }
        } catch (error) {
            console.warn('Ошибка определения города по IP:', error);
            if (error instanceof Error)
                eventBus.emit("LocationService::error", error);
        }
    }

    #getUserLocation() {
        if (!navigator.geolocation) {
            eventBus.emit("LocationService::error", new Error('Геолокация не поддерживается вашим браузером'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                let result = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                eventBus.emit("LocationService::userLocationReceived", result);
            },
            (error) => {
                console.warn('Geolocation error:', error);

                let errorMessage = 'Не удалось определить ваше местоположение';
                if (error.code === 1) {
                    errorMessage = 'Пользователь запретил доступ к геолокации';
                } else if (error.code === 2) {
                    errorMessage = 'Информация о местоположении недоступна';
                } else if (error.code === 3) {
                    errorMessage = 'Время получения геолокации истекло';
                }

                eventBus.emit("LocationService::error", new Error(errorMessage));
                eventBus.emit("LocationService::getCityByIp");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }
}