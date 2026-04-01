export type LocalPlaylistVisibility = "public" | "private";

export interface LocalDraftPlaylist {
    id: string;
    name: string;
    description: string;
    visibility: LocalPlaylistVisibility;
    created_at: string;
    updated_at: string;
}

const STORAGE_KEY = "local_draft_playlists_v1";
export const LOCAL_PLAYLISTS_UPDATED_EVENT = "local-playlists-updated";

export function getLocalDraftPlaylists(): LocalDraftPlaylist[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveLocalDraftPlaylists(playlists: LocalDraftPlaylist[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
    window.dispatchEvent(new Event(LOCAL_PLAYLISTS_UPDATED_EVENT));
}

export function createLocalDraftPlaylist(input: {
    name: string;
    description: string;
    visibility: LocalPlaylistVisibility;
}): LocalDraftPlaylist {
    const now = new Date().toISOString();
    const draft: LocalDraftPlaylist = {
        id: `local-${Date.now()}`,
        name: input.name.trim() || "Untitled Playlist",
        description: input.description.trim(),
        visibility: input.visibility,
        created_at: now,
        updated_at: now,
    };

    const current = getLocalDraftPlaylists();
    saveLocalDraftPlaylists([draft, ...current]);
    return draft;
}

export function getLocalDraftPlaylistById(id: string): LocalDraftPlaylist | null {
    const current = getLocalDraftPlaylists();
    return current.find((playlist) => playlist.id === id) ?? null;
}

export function deleteLocalDraftPlaylistById(id: string): void {
    const current = getLocalDraftPlaylists();
    const next = current.filter((playlist) => playlist.id !== id);
    saveLocalDraftPlaylists(next);
}
