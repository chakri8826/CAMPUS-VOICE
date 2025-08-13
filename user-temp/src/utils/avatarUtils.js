export const getAvatarUrl = (avatar) => {
    if (!avatar) return null;

    // If it's already a full URL (Cloudinary), use it directly
    if (avatar.startsWith('http')) {
        return avatar;
    }

    // For local files, use relative URL (works in both dev and production)
    // Remove any leading slashes and normalize path
    const cleanPath = avatar.replace(/^[\/\\]+/, '').replace(/\\/g, '/');
    return `/${cleanPath}`;
};
