import type { PlaylistTrack } from "../types";
import { getAlbumName, getArtistName } from "./trackHelpers";

function asNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toPlayerTrack(
  songLike: any,
  playlistId = 0,
  position = 1,
): PlaylistTrack {
  const song = songLike?.song ?? songLike;
  const songId = asNumber(song?.id, Date.now());
  const albumName = getAlbumName(song?.album);
  const artistName = getArtistName(song?.artist);

  return {
    id: songId,
    playlist_id: playlistId,
    added_by_id: 0,
    position,
    added_at: new Date().toISOString(),
    song: {
      id: songId,
      title: String(song?.title ?? "Unknown Title"),
      artist: {
        id: asNumber(song?.artist?.id, 0),
        name: artistName,
      },
      album: albumName
        ? {
            id: asNumber(song?.album?.id, 0),
            name: albumName,
            artist: { id: asNumber(song?.artist?.id, 0), name: artistName },
          }
        : null,
      genre: String(song?.genre ?? ""),
      release_year: song?.release_year ?? null,
      duration_seconds: asNumber(song?.duration_seconds, 0),
      cover_url: String(song?.cover_url ?? song?.imageUrl ?? ""),
      audio_url: String(song?.audio_url ?? ""),
      storage_path: String(song?.storage_path ?? ""),
    },
  };
}