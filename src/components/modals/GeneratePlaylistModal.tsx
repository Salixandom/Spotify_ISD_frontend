import React, { useState } from "react";
import { Wand2, TrendingUp, Clock, Sparkles, Guitar } from "lucide-react";
import { Modal } from "../ui/Modal";
import { playlistAPI } from "../../api/playlists";

interface GeneratePlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type GenerationType = 'taste' | 'trending' | 'new_releases' | 'similar_song' | 'genre';

interface GenerationOption {
    type: GenerationType;
    title: string;
    description: string;
    icon: React.ReactNode;
}

const generationOptions: GenerationOption[] = [
    {
        type: 'taste',
        title: 'Based on Your Taste',
        description: 'Personalized recommendations based on your liked playlists and listening history',
        icon: <Sparkles size={24} />
    },
    {
        type: 'trending',
        title: 'Trending Now',
        description: 'Most popular songs right now',
        icon: <TrendingUp size={24} />
    },
    {
        type: 'new_releases',
        title: 'New Releases',
        description: 'Recently released songs from the last 90 days',
        icon: <Clock size={24} />
    },
    {
        type: 'genre',
        title: 'By Genre',
        description: 'Pick a genre and discover songs in that style',
        icon: <Guitar size={24} />
    },
];

export const GeneratePlaylistModal: React.FC<GeneratePlaylistModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [playlistName, setPlaylistName] = useState('');
    const [songCount, setSongCount] = useState(20);
    const [selectedType, setSelectedType] = useState<GenerationType>('taste');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const genres = [
        'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz',
        'Classical', 'R&B', 'Country', 'Metal', 'Blues',
        'Reggae', 'Latin', 'Indie', 'Folk', 'Soul'
    ];

    const handleGenerate = async () => {
        if (!selectedType) return;

        setIsGenerating(true);
        try {
            const payload: any = {
                generation_type: selectedType,
                track_limit: songCount,
            };

            if (playlistName) {
                payload.name = playlistName;
            }

            if (selectedType === 'genre' && selectedGenre) {
                payload.genre = selectedGenre;
            }

            await playlistAPI.generatePlaylist(payload);
            onSuccess();
            onClose();
            // Reset form
            setPlaylistName('');
            setSongCount(20);
            setSelectedType('taste');
            setSelectedGenre('');
        } catch (error) {
            console.error('Failed to generate playlist:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Reset form when modal closes
    React.useEffect(() => {
        if (!isOpen) {
            setPlaylistName('');
            setSongCount(20);
            setSelectedType('taste');
            setSelectedGenre('');
        }
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Generate Playlist"
            maxWidthClassName="max-w-xl"
        >
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
                {/* Generation Type Selection */}
                <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                        What kind of playlist?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {generationOptions.map((option) => (
                            <button
                                key={option.type}
                                onClick={() => setSelectedType(option.type)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all text-center ${
                                    selectedType === option.type
                                        ? 'bg-gradient-to-br from-[#1DB954]/20 to-transparent border-2 border-[#1DB954]/50'
                                        : 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                                }`}
                            >
                                <div className={`p-2 rounded-full ${
                                    selectedType === option.type
                                        ? 'bg-[#1DB954]/20 text-[#1DB954]'
                                        : 'bg-white/10 text-white/70'
                                }`}>
                                    {option.icon}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-semibold ${
                                        selectedType === option.type ? 'text-white' : 'text-white/90'
                                    }`}>{option.title}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Genre Selection (only for genre type) */}
                {selectedType === 'genre' && (
                    <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                            Select a Genre
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto pr-1">
                            {genres.map((genre) => (
                                <button
                                    key={genre}
                                    onClick={() => setSelectedGenre(genre)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        selectedGenre === genre
                                            ? 'bg-[#1DB954] text-black'
                                            : 'bg-white/[0.04] text-white/80 hover:bg-white/[0.08]'
                                    }`}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Playlist Name */}
                <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                        Name <span className="text-white/40 font-normal text-xs">(optional)</span>
                    </label>
                    <input
                        type="text"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                        placeholder={selectedType === 'taste' ? 'For You Mix' :
                                 selectedType === 'trending' ? 'Trending Now' :
                                 selectedType === 'new_releases' ? 'New Releases' :
                                 selectedGenre ? `${selectedGenre} Mix` : 'My Playlist'}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#1DB954]/60 focus:bg-white/[0.06] transition-all"
                    />
                </div>

                {/* Song Count */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-semibold text-white">
                            Songs
                        </label>
                        <span className="text-[#1DB954] font-semibold text-sm">{songCount}</span>
                    </div>
                    <input
                        type="range"
                        min="10"
                        max="50"
                        step="5"
                        value={songCount}
                        onChange={(e) => setSongCount(parseInt(e.target.value))}
                        className="w-full accent-[#1DB954]"
                    />
                    <div className="flex justify-between text-xs text-white/40 mt-1">
                        <span>10</span>
                        <span>50</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-white text-sm border border-white/16 hover:border-white/30 hover:bg-white/[0.06] transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || (selectedType === 'genre' && !selectedGenre)}
                        className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-black text-sm bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 size={16} />
                                Generate
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
