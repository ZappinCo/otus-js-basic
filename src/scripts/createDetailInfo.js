export function createDetailInfo(element, data) {
    const items = [
        { label: 'Температура',mainKey:'main', key: 'temp', unit: '°C' },
        { label: 'Давление',mainKey:'main', key: 'pressure', unit: 'гПа' },
        { label: 'Влажность',mainKey:'main', key: 'humidity', unit: '%' },
        { label: 'Ветер',mainKey:'wind', key: 'speed', unit: 'м/с' }
    ];

    const detailContainer = document.createElement("div");
    detailContainer.className = "details-container";
    element.appendChild(detailContainer);


    items.forEach(item => {
        const value = data[item.mainKey][item.key];
        const displayValue = `${value} ${item.unit}`;
            
        const div = createDetail(item.label, displayValue);
        detailContainer.appendChild(div);
    });
}


function createDetail(label, value) {
    const detailItem = document.createElement("div");
    detailItem.className = "detail-item";

    const detailLabel = document.createElement("div");
    detailLabel.className = "detail-label";
    detailLabel.innerText = label;
    detailItem.appendChild(detailLabel);

    const detailValue = document.createElement("div");
    detailValue.className = "detail-value";
    detailValue.innerText = value;
    detailItem.appendChild(detailValue);
    return detailItem;
}