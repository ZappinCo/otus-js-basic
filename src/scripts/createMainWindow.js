export function createMainWindow(element) {
    const mainCard = document.createElement("div");
    mainCard.className = "weather-card";
    element.appendChild(mainCard);

    const cityHeader = document.createElement("div");
    cityHeader.className = "city-header";
    mainCard.appendChild(cityHeader);


    const cityContainer = document.createElement("div");
    cityContainer.className = "city-container";
    mainCard.appendChild(cityContainer);

    const cityName = document.createElement("input");
    cityName.className = "city-name";
    cityName.value = localStorage.getItem("city");;
    cityContainer.appendChild(cityName);

    const findMeButton = document.createElement("button");
    findMeButton.className = "find-me-button";
    cityContainer.appendChild(findMeButton);

    const errorMessage = document.createElement("div");
    errorMessage.className = "error-message";
    mainCard.appendChild(errorMessage);

    const container = document.createElement("div");
    container.className = "weather-container";
    mainCard.appendChild(container);

    return container;
}