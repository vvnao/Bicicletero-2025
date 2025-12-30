export const buildFileUrl = (req, filename, folder = 'evidence') => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/uploads/${folder}/${filename}`;
};

export const ensureAbsoluteUrl = (url, req = null) => {
    if (!url) return url;

    if (url.startsWith('http')) {
        return url;
    }

    const baseUrl = req
        ? (process.env.APP_URL || `${req.protocol}://${req.get('host')}`)
        : process.env.APP_URL || 'http://localhost:3000';

    if (url.includes('uploads')) {
        let relativePath = url;

        if (url.includes('\\uploads\\')) {
            relativePath = url.split('uploads')[1];
            relativePath = relativePath.replace(/\\/g, '/');
        } else if (url.includes('src/uploads/')) {
            relativePath = url.split('src/uploads')[1];
        } else if (url.startsWith('uploads/')) {
            relativePath = '/' + url;
        } else if (!url.startsWith('/') && url.includes('/uploads/')) {
            relativePath = url;
        }

        if (!relativePath.startsWith('/')) {
            relativePath = '/' + relativePath;
        }

        return `${baseUrl}${relativePath}`;
    }

    if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
    }

    return url;
};

export const transformEvidenceUrls = (evidences, req = null) => {
    if (!evidences || !Array.isArray(evidences)) return evidences;

    return evidences.map(evidence => ({
        ...evidence,
        url: ensureAbsoluteUrl(evidence.url, req)
    }));
};

export const transformObjectUrls = (obj, req = null) => {
    if (!obj) return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => transformObjectUrls(item, req));
    }

    if (typeof obj === 'object') {
        const transformed = { ...obj };

        for (const key in transformed) {
            if (key === 'url' ||
                key === 'photo' ||
                key === 'tnePhoto' ||
                key === 'personalPhoto' ||
                key === 'evidenceUrl' ||
                key === 'bicyclePhoto' ||
                key.includes('Photo') ||
                key.includes('photo')) {

                transformed[key] = ensureAbsoluteUrl(transformed[key], req);

            } else if (key === 'evidences' && Array.isArray(transformed[key])) {
                transformed[key] = transformed[key].map(evidence => ({
                    ...evidence,
                    url: ensureAbsoluteUrl(evidence.url, req)
                }));

            } else if (key === 'bicycle' && typeof transformed[key] === 'object') {
                transformed[key] = {
                    ...transformed[key],
                    photo: ensureAbsoluteUrl(transformed[key]?.photo, req)
                };

            } else if (typeof transformed[key] === 'object') {
                transformed[key] = transformObjectUrls(transformed[key], req);

            } else if (Array.isArray(transformed[key]) && transformed[key].length > 0) {
                transformed[key] = transformObjectUrls(transformed[key], req);
            }
        }

        return transformed;
    }

    return obj;
};