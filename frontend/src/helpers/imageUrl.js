
import { buildImageUrl } from '../config/api.config.js';

export const ensureImageUrl = (url) => {
    return buildImageUrl(url);
};

export const cleanPath = (path) => {
    console.warn('cleanPath está deprecado. Usa ensureImageUrl en su lugar.');
    return ensureImageUrl(path);
};

export const debugImageUrl = (url) => {
    console.log('Debug imagen:', {
        original: url,
        processed: ensureImageUrl(url),
        isHttp: url?.startsWith('http'),
        isRelative: url?.startsWith('/'),
        containsUploads: url?.includes('uploads'),
        envApiUrl: import.meta.env.VITE_API_URL
    });
    return ensureImageUrl(url);
};