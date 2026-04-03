/**
 * Helper functions to safely extract string values from potentially nested objects
 * Handles cases where backend returns objects instead of primitive strings
 */

export const getArtistName = (artist: unknown): string => {
  if (typeof artist === 'string') return artist;
  if (typeof artist === 'object' && artist !== null && 'name' in artist) {
    return String((artist as Record<string, unknown>).name);
  }
  return 'Unknown Artist';
};

export const getAlbumName = (album: unknown): string => {
  if (typeof album === 'string') return album;
  if (typeof album === 'object' && album !== null && 'name' in album) {
    return String((album as Record<string, unknown>).name);
  }
  return 'Unknown Album';
};
