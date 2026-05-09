export interface StorageData{
    city:string;
    searchHistory:string[];
}

export function isStorageData(data: unknown): data is StorageData {
    if (!data || typeof data !== 'object') return false;
    
    const s = data as Record<string, unknown>;
    
    return (
        typeof s.city === 'string' &&
        Array.isArray(s.searchHistory) &&
        s.searchHistory.every((item: unknown) => typeof item === 'string')
    );
}