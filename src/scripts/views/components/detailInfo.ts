import { ForecastData } from "../../../types/forecast";

interface DetailInfoItem {
    label: string;
    key: string;
    unit: string;
}

export class DetailInfo {
    #items: DetailInfoItem[];

    constructor() {
        this.#items = [
            { label: 'Температура', key: 'temp', unit: '°C' },
            { label: 'Давление', key: 'pressure', unit: 'гПа' },
            { label: 'Влажность', key: 'humidity', unit: '%' },
            { label: 'Ветер', key: 'speed', unit: 'м/с' }
        ];
    }

    render(container: HTMLDivElement, data: ForecastData) {
        if (!data) return;

        const detailContainer = this.#createDetailContainer(data);
        container.appendChild(detailContainer);
    }

    #createDetailContainer(data: ForecastData) {
        const detailContainer = document.createElement("div");
        detailContainer.className = "details-container";

        this.#items.forEach(item => {
            const detailItem = this.#createDetailItem(data, item);
            detailContainer.appendChild(detailItem);
        });

        return detailContainer;
    }

    #createDetailItem(data: ForecastData, item: DetailInfoItem) {
        const value = data[item.key as keyof ForecastData];
        const displayValue = `${value} ${item.unit}`;

        const detailItem = document.createElement("div");
        detailItem.className = "detail-item";

        const detailLabel = this.#createLabel(item.label);
        detailItem.appendChild(detailLabel);

        const detailValue = this.#createValue(displayValue);
        detailItem.appendChild(detailValue);

        return detailItem;
    }

    #createLabel(label: string) {
        const detailLabel = document.createElement("div");
        detailLabel.className = "detail-label";
        detailLabel.innerText = label;
        return detailLabel;
    }

    #createValue(value: string) {
        const detailValue = document.createElement("div");
        detailValue.className = "detail-value";
        detailValue.innerText = value;
        return detailValue;
    }
}