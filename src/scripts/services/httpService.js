export class HttpService {
    constructor(baseUrl = null) {
        this.baseUrl = baseUrl;
    }

    async get(url, options = {}) {
        const fullUrl = this.baseUrl ? `${this.baseUrl}${url}` : url;
        try {
            const response = await fetch(fullUrl, {
                method: 'GET',
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('HTTP GET error:', error);
            throw error;
        }
    }
}