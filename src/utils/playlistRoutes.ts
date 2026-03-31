export const DEMO_PLAYLIST_ID = "demo-main";

export const getPlaylistRoute = (playlistId: string | number): string =>
    `/playlist/${String(playlistId)}`;

export const getDemoPlaylistRoute = (): string => getPlaylistRoute(DEMO_PLAYLIST_ID);
