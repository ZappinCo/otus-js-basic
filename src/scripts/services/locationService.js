import { HttpService } from './httpService';

export class LocationService {
    constructor(httpService = null) {
        this.httpService = httpService || new HttpService();
    }

    async getCityByIp() {
        try {
            const url = 'https://ip-api.com/json/?fields=status,city';
            const data = await this.httpService.get(url);
            
            if (data.status === 'success') {
                return data.city;
            }
            return null;
        } catch (error) {
            console.warn('Ошибка определения города по IP:', error);
            return null;
        }
    }

    getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Геолокация не поддерживается'));
                return;
            }
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }
}