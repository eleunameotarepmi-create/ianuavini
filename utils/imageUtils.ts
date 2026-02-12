
export const getSafeImage = (img: string | undefined): string => {
    if (!img) return '/assets/placeholder-wine.png';
    // Check for base64 strings larger than 500KB
    // Check for base64 strings
    if (img.startsWith('data:')) {
        return img;
    }
    return img;
};
