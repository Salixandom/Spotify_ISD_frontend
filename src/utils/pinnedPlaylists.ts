const PINNED_PLAYLISTS_KEY = 'spotify_pinned_playlists';
const PINNED_PLAYLISTS_UPDATED_EVENT = 'pinnedPlaylistsUpdated';

export interface PinnedPlaylist {
    id: string;
    title: string;
    pinnedAt: number;
}

export const getPinnedPlaylists = (): PinnedPlaylist[] => {
    try {
        const stored = localStorage.getItem(PINNED_PLAYLISTS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

export const isPlaylistPinned = (id: string): boolean => {
    const pinned = getPinnedPlaylists();
    return pinned.some(p => p.id === id);
};

export const pinPlaylist = (id: string, title: string): void => {
    const pinned = getPinnedPlaylists();

    // Don't duplicate if already pinned
    if (pinned.some(p => p.id === id)) {
        return;
    }

    const newPinned = [
        ...pinned,
        {
            id,
            title,
            pinnedAt: Date.now(),
        },
    ];

    localStorage.setItem(PINNED_PLAYLISTS_KEY, JSON.stringify(newPinned));
    window.dispatchEvent(new Event(PINNED_PLAYLISTS_UPDATED_EVENT));
};

export const unpinPlaylist = (id: string): void => {
    const pinned = getPinnedPlaylists();
    const newPinned = pinned.filter(p => p.id !== id);
    localStorage.setItem(PINNED_PLAYLISTS_KEY, JSON.stringify(newPinned));
    window.dispatchEvent(new Event(PINNED_PLAYLISTS_UPDATED_EVENT));
};

export const togglePlaylistPin = (id: string, title: string): void => {
    if (isPlaylistPinned(id)) {
        unpinPlaylist(id);
    } else {
        pinPlaylist(id, title);
    }
};

export { PINNED_PLAYLISTS_UPDATED_EVENT };
