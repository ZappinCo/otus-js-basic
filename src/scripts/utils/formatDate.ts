export function formatDate(dateStr: string) {
    const [, month, day] = dateStr.split('-');
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    const monthIndex = parseInt(month, 10) - 1;
    const dayFormatted = parseInt(day, 10);
    return `${dayFormatted} ${months[monthIndex]}`;
}