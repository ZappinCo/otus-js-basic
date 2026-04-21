export class MainWindow {
    #element;
    #cityInput;
    #findMeButton;
    #errorMessage;
    #weatherContainer;

    render(parentElement) {
        const mainCard = document.createElement("div");
        mainCard.className = "weather-card";
        
        const cityHeader = document.createElement("div");
        cityHeader.className = "city-header";
        mainCard.appendChild(cityHeader);
        
        const cityContainer = document.createElement("div");
        cityContainer.className = "city-container";
        mainCard.appendChild(cityContainer);
        
        this.#cityInput = document.createElement("input");
        this.#cityInput.className = "city-name";
        this.#cityInput.placeholder = "Введите город...";
        cityContainer.appendChild(this.#cityInput);
        
        this.#findMeButton = document.createElement("button");
        this.#findMeButton.className = "find-me-button";
        this.#findMeButton.title = "Определить мое местоположение";
        cityContainer.appendChild(this.#findMeButton);
        
        this.#errorMessage = document.createElement("div");
        this.#errorMessage.className = "error-message";
        mainCard.appendChild(this.#errorMessage);
        
        this.#weatherContainer = document.createElement("div");
        this.#weatherContainer.className = "weather-container";
        mainCard.appendChild(this.#weatherContainer);
        
        parentElement.appendChild(mainCard);
        
        this.#element = mainCard;
        return this.#weatherContainer;
    }

    setCityValue(city) {
        if (this.#cityInput) {
            this.#cityInput.value = city || '';
        }
    }

    getCityValue() {
        return this.#cityInput ? this.#cityInput.value : '';
    }

    showError(message) {
        if (this.#errorMessage) {
            this.#errorMessage.style.display = 'block';
            this.#errorMessage.textContent = message;
            
            setTimeout(() => {
                if (this.#errorMessage) {
                    this.#errorMessage.style.display = 'none';
                }
            }, 3000);
        }
    }

    setLoading(isLoading) {
        if (this.#findMeButton) {
            if (isLoading) {
                this.#findMeButton.classList.add('loading');
                this.#findMeButton.disabled = true;
            } else {
                this.#findMeButton.classList.remove('loading');
                this.#findMeButton.disabled = false;
            }
        }
    }

    bindCityInput(handler) {
        if (this.#cityInput) {
            this.#cityInput.addEventListener('input', handler);
        }
    }

    bindFindMeButton(handler) {
        if (this.#findMeButton) {
            this.#findMeButton.addEventListener('click', handler);
        }
    }

    getWeatherContainer() {
        return this.#weatherContainer;
    }

    destroy() {
        if (this.#element && this.#element.parentNode) {
            this.#element.parentNode.removeChild(this.#element);
        }
    }
}