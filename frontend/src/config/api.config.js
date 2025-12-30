
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api',

    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',

    UPLOADS_URL: import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/uploads`
        : 'http://localhost:3000/uploads'
};

export const buildImageUrl = (path) => {
    if (!path) return null;

    if (path.startsWith('http')) {
        return path;
    }

    const base = API_CONFIG.API_URL;

    let normalizedPath = path;

    if (normalizedPath.includes('\\')) {
        normalizedPath = normalizedPath.replace(/\\/g, '/');
    }

    if (normalizedPath.startsWith('src/')) {
        normalizedPath = normalizedPath.substring(4);
    }

    if (!normalizedPath.startsWith('/')) {
        normalizedPath = '/' + normalizedPath;
    }

    return `${base}${normalizedPath}`;
};

export const ensureAbsoluteUrl = (url) => buildImageUrl(url);