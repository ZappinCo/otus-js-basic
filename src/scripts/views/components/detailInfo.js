export class DetailInfo {
    #items;

    constructor() {
        this.#items = [
            { label: 'Температура', mainKey: 'main', key: 'temp', unit: '°C' },
            { label: 'Давление', mainKey: 'main', key: 'pressure', unit: 'гПа' },
            { label: 'Влажность', mainKey: 'main', key: 'humidity', unit: '%' },
            { label: 'Ветер', mainKey: 'wind', key: 'speed', unit: 'м/с' }
        ];
    }

    render(container, data) {
        if (!data) return;
        
        const detailContainer = this.#createDetailContainer(data);
        container.appendChild(detailContainer);
    }

    #createDetailContainer(data) {
        const detailContainer = document.createElement("div");
        detailContainer.className = "details-container";
        
        this.#items.forEach(item => {
            const detailItem = this.#createDetailItem(data, item);
            detailContainer.appendChild(detailItem);
        });
        
        return detailContainer;
    }

    #createDetailItem(data, item) {
        const value = data[item.mainKey][item.key];
        const displayValue = `${value} ${item.unit}`;
        
        const detailItem = document.createElement("div");
        detailItem.className = "detail-item";
        
        const detailLabel = this.#createLabel(item.label);
        detailItem.appendChild(detailLabel);
        
        const detailValue = this.#createValue(displayValue);
        detailItem.appendChild(detailValue);
        
        return detailItem;
    }

    #createLabel(label) {
        const detailLabel = document.createElement("div");
        detailLabel.className = "detail-label";
        detailLabel.innerText = label;
        return detailLabel;
    }

    #createValue(value) {
        const detailValue = document.createElement("div");
        detailValue.className = "detail-value";
        detailValue.innerText = value;
        return detailValue;
    }
}