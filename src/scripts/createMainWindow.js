export function createMainWindow(element){

    const mainCard = document.createElement("div");
    mainCard.className = "weather-card";
    element.appendChild(mainCard);

    const cityHeader = document.createElement("div");
    cityHeader.className = "city-header";
    mainCard.appendChild(cityHeader);

    
    const cityName = document.createElement("input");
    cityName.className = "city-name";
    cityName.value = "Москва";
    mainCard.appendChild(cityName);

    const errorMessage = document.createElement("div");
    errorMessage.className = "error-message";
    mainCard.appendChild(errorMessage);

    const container = document.createElement("div");
    container.className = "weather-container";
    mainCard.appendChild(container);

    return container;
}