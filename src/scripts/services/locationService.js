import EventBus from "../utils/eventBus";
import { HttpService } from './httpService';

export class LocationService {
    constructor(httpService = null) {
        this.httpService = httpService || new HttpService();
        this.#bindEvents();
    }

    #bindEvents() {
        EventBus.on("LocationService::getCityByIp", async () => {
            await this.#getCityByIp();
        });

        EventBus.on("LocationService::getUserLocation", () => {
            this.#getUserLocation();
        });
    }

    async #getCityByIp() {
        try {
            const url = 'https://ip-api.com/json/?fields=status,city';
            const data = await this.httpService.get(url);
            
            if (data.status === 'success' && data.city) {
                EventBus.emit("LocationService::cityDetected", data.city);
            } else {
                EventBus.emit("LocationService::error", new Error('Не удалось определить город по IP'));
            }
        } catch (error) {
            console.warn('Ошибка определения города по IP:', error);
            EventBus.emit("LocationService::error", error);
        }
    }

    #getUserLocation() {
        if (!navigator.geolocation) {
            EventBus.emit("LocationService::error", new Error('Геолокация не поддерживается вашим браузером'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                EventBus.emit("LocationService::userLocationReceived", position);
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
                
                EventBus.emit("LocationService::error", new Error(errorMessage));
                EventBus.emit("LocationService::getCityByIp");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }
}