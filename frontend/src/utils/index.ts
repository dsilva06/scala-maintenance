
const APP_BASE_PATH = '/app';

export function createPageUrl(pageName: string) {
    const normalized = pageName.trim();
    if (!normalized) {
        return APP_BASE_PATH;
    }

    if (normalized.toLowerCase() === 'dashboard') {
        return APP_BASE_PATH;
    }

    const slug = normalized
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .replace(/^-+/, '');

    if (!slug) {
        return APP_BASE_PATH;
    }

    return `${APP_BASE_PATH}/${slug}`;
}
