/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Send, Trash2, Edit3, X, CornerDownRight } from "lucide-react";
import { commentsAPI, type PlaylistComment } from "../../api/comments";
import toast from "react-hot-toast";

interface PlaylistCommentsProps {
  playlistId: string | number;
  currentUserId: number;
  userRole: 'owner' | 'collaborator' | null;
  ownerId: number;
  userMap: Map<number, { id: number; username: string; display_name?: string; avatar_url?: string }>;
}

export const PlaylistComments: React.FC<PlaylistCommentsProps> = ({ playlistId, currentUserId, userRole, ownerId, userMap }) => {
  const [comments, setComments] = useState<PlaylistComment[]>([]);
  const [allComments, setAllComments] = useState<PlaylistComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [repliesMap, setRepliesMap] = useState<Map<number, PlaylistComment[]>>(new Map());
  const [loadingReplies, setLoadingReplies] = useState<Set<number>>(new Set());
  const [visibleCount, setVisibleCount] = useState(5);
  const [showAll, setShowAll] = useState(false);
  const COMMENTS_PER_PAGE = 5;

  useEffect(() => {
    loadComments();
  }, [playlistId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const data = await commentsAPI.getComments(playlistId);
      setAllComments(data);
      setComments(data.slice(0, visibleCount));
    } catch (error) {
      console.error("Failed to load comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const comment = await commentsAPI.createComment(playlistId, newComment);
      const newAllComments = [comment, ...allComments];
      setAllComments(newAllComments);
      if (showAll) {
        setComments(newAllComments);
      } else {
        setComments(newAllComments.slice(0, visibleCount));
      }
      setNewComment("");
      toast.success("Comment added");
    } catch (error) {
      console.error("Failed to create comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleLoadMore = () => {
    const newCount = visibleCount + COMMENTS_PER_PAGE;
    setVisibleCount(newCount);
    setComments(allComments.slice(0, newCount));
  };

  const handleHideComments = () => {
    setShowAll(false);
    setVisibleCount(COMMENTS_PER_PAGE);
    setComments(allComments.slice(0, COMMENTS_PER_PAGE));
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await commentsAPI.createComment(playlistId, replyContent, parentId);
      await loadComments();
      setReplyContent("");
      setReplyTo(null);
      toast.success("Reply added");
    } catch (error) {
      console.error("Failed to create reply:", error);
      toast.error("Failed to add reply");
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await commentsAPI.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const handleEdit = async (commentId: number) => {
    try {
      const updated = await commentsAPI.updateComment(commentId, editContent);
      setComments(comments.map(c => c.id === commentId ? updated : c));
      setEditingId(null);
      setEditContent("");
      toast.success("Comment updated");
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast.error("Failed to update comment");
    }
  };

  const handleLike = async (commentId: number, isLiked: boolean) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment && comment.user_id === currentUserId) {
      toast.error("You cannot like your own comment");
      return;
    }

    try {
      if (isLiked) {
        await commentsAPI.unlikeComment(commentId);
      } else {
        await commentsAPI.likeComment(commentId);
      }
      setComments(comments.map(c =>
        c.id === commentId
          ? { ...c, is_liked: !isLiked, likes_count: isLiked ? c.likes_count - 1 : c.likes_count + 1 }
          : c
      ));
    } catch (error: any) {
      console.error("Failed to toggle like:", error);
      if (error.response?.data?.message?.includes('Cannot like your own')) {
        toast.error("You cannot like your own comment");
      } else {
        toast.error("Failed to update like");
      }
    }
  };

  const toggleReplies = async (commentId: number) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
      setExpandedReplies(newExpanded);
    } else {
      newExpanded.add(commentId);
      setExpandedReplies(newExpanded);

      if (!repliesMap.has(commentId) && !loadingReplies.has(commentId)) {
        try {
          setLoadingReplies(prev => new Set(prev).add(commentId));
          const response = await commentsAPI.getReplies(commentId);
          setRepliesMap(prev => new Map(prev).set(commentId, response.replies));
        } catch (error) {
          console.error("Failed to load replies:", error);
          toast.error("Failed to load replies");
        } finally {
          setLoadingReplies(prev => {
            const newSet = new Set(prev);
            newSet.delete(commentId);
            return newSet;
          });
        }
      }
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();

      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'unknown time';
      }

      const dateMs = date.getTime();
      const nowMs = now.getTime();
      const seconds = Math.floor((nowMs - dateMs) / 1000);

      if (seconds < 0) return 'just now';
      if (seconds < 60) return 'just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'unknown time';
    }
  };

  const getDisplayName = (comment: PlaylistComment): string => {
    const userData = userMap.get(comment.user_id);
    return userData?.display_name || userData?.username || comment.username;
  };

  const getAvatarUrl = (comment: PlaylistComment): string => {
    const userData = userMap.get(comment.user_id);
    return userData?.avatar_url || '';
  };

  const canModerateComment = (commentUserId: number): boolean => {
    if (commentUserId === currentUserId) return true;
    if (userRole === 'owner') return true;
    if (userRole === 'collaborator' && commentUserId !== ownerId) return true;
    return false;
  };

  if (isLoading) {
    return (
      <div className="px-6 md:px-8 py-8 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          {/* Header skeleton */}
          <div className="flex items-center gap-2 mb-6 animate-pulse">
            <div className="w-6 h-6 bg-white/10 rounded" />
            <div className="h-6 bg-white/10 rounded w-32" />
          </div>

          {/* Comment input skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="w-full h-20 bg-white/5 rounded-lg border border-white/10" />
          </div>

          {/* Comments skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 rounded-lg border border-white/10 p-4 animate-pulse">
                <div className="flex gap-4">
                  {/* Avatar sidebar skeleton */}
                  <div className="flex-shrink-0 w-10">
                    <div className="w-10 h-10 bg-white/10 rounded-full mb-2" />
                    <div className="h-3 bg-white/10 rounded w-16 mb-1" />
                    <div className="h-2 bg-white/10 rounded w-12" />
                  </div>

                  {/* Vertical separator skeleton */}
                  <div className="w-px bg-white/10 flex-shrink-0" />

                  {/* Content skeleton */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-end mb-2">
                      <div className="flex gap-1">
                        <div className="w-6 h-6 bg-white/10 rounded" />
                        <div className="w-6 h-6 bg-white/10 rounded" />
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="h-3 bg-white/10 rounded w-full" />
                      <div className="h-3 bg-white/10 rounded w-4/5" />
                      <div className="h-3 bg-white/10 rounded w-3/5" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-white/10 rounded w-12" />
                      <div className="h-4 bg-white/10 rounded w-16" />
                      <div className="h-4 bg-white/10 rounded w-10" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 py-8 border-t border-white/10">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <MessageCircle size={22} />
        Comments ({comments.length})
      </h3>

      {/* Add comment form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-4 pr-14 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-spotify-green/50 focus:bg-white/10 transition-all resize-none"
            rows={2}
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="absolute right-3 bottom-3 p-2 bg-spotify-green hover:bg-spotify-green/90 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            title="Post comment"
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white/5 rounded-lg border border-white/10 hover:border-white/15 transition-colors">
              <div className="p-4">
                {/* Main comment layout with sidebar */}
                <div className="flex gap-4">
                  {/* Avatar sidebar with name and time */}
                  <div className="flex-shrink-0 w-10">
                    {getAvatarUrl(comment) ? (
                      <img
                        src={getAvatarUrl(comment)}
                        alt={getDisplayName(comment)}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                        {getDisplayName(comment).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p className="text-white font-semibold text-xs mt-2 truncate">{getDisplayName(comment)}</p>
                    <p className="text-white/40 text-[10px]">{formatTimeAgo(comment.created_at)}</p>
                  </div>

                  {/* Vertical separator */}
                  <div className="w-px bg-white/10 flex-shrink-0" />

                  {/* Content area */}
                  <div className="flex-1 min-w-0">
                    {/* Edit/Delete buttons */}
                    <div className="flex justify-end mb-2">
                      {canModerateComment(comment.user_id) && !comment.is_deleted && (
                        <div className="flex items-center gap-1">
                          {editingId === comment.id ? (
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditContent("");
                              }}
                              className="p-1 text-white/40 hover:text-white transition-colors"
                            >
                              <X size={12} />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingId(comment.id);
                                setEditContent(comment.content);
                              }}
                              className="p-1 text-white/40 hover:text-white transition-colors"
                            >
                              <Edit3 size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="p-1 text-white/40 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Comment content */}
                    {editingId === comment.id ? (
                      <div className="mb-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-spotify-green/50 resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleEdit(comment.id)}
                            disabled={!editContent.trim()}
                            className="px-3 py-1 bg-spotify-green text-black text-xs font-bold rounded-full disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditContent("");
                            }}
                            className="px-3 py-1 bg-white/10 text-white text-xs rounded-full hover:bg-white/15"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className={`text-white/90 text-sm mb-3 ${comment.is_deleted ? "line-through text-white/40" : ""}`}>
                        {comment.content}
                      </p>
                    )}

                    {/* Action buttons */}
                    {!comment.is_deleted && (
                      <div className="flex items-center gap-4">
                        {comment.user_id !== currentUserId && (
                          <button
                            onClick={() => handleLike(comment.id, comment.is_liked)}
                            className={`flex items-center gap-1.5 text-xs transition-colors ${
                              comment.is_liked ? "text-spotify-green" : "text-white/50 hover:text-white"
                            }`}
                          >
                            <Heart size={14} fill={comment.is_liked ? "currentColor" : "none"} />
                            {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
                          </button>
                        )}
                        {comment.replies_count > 0 && (
                          <button
                            onClick={() => toggleReplies(comment.id)}
                            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
                          >
                            <MessageCircle size={14} />
                            {comment.replies_count} {comment.replies_count === 1 ? "reply" : "replies"}
                          </button>
                        )}
                        <button
                          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                          className="text-xs text-white/50 hover:text-white transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reply form */}
              {replyTo === comment.id && (
                <div className="px-4 pb-4 ml-14">
                  <form onSubmit={(e) => handleSubmitReply(e, comment.id)}>
                    <div className="relative">
                      <input
                        type="text"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full px-3 pr-10 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-spotify-green/50"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!replyContent.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-spotify-green hover:bg-spotify-green/90 text-black rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        title="Send reply"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Replies */}
              {expandedReplies.has(comment.id) && comment.replies_count > 0 && (
                <div className="px-4 pb-4 space-y-3">
                  {loadingReplies.has(comment.id) ? (
                    <div className="flex items-center gap-2 ml-14">
                      <div className="w-4 h-4 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
                      <p className="text-white/40 text-xs">Loading replies...</p>
                    </div>
                  ) : repliesMap.has(comment.id) ? (
                    repliesMap.get(comment.id)?.map((reply, index) => (
                      <div key={reply.id} className="flex gap-3 ml-14 relative">
                        {/* Hierarchy tree icon */}
                        <div className="flex-shrink-0 flex flex-col items-center pt-1">
                          <CornerDownRight size={16} className="text-white/20" />
                          {index < (repliesMap.get(comment.id)?.length || 0) - 1 && (
                            <div className="w-px h-full bg-white/10 min-h-[60px]" />
                          )}
                        </div>

                        {/* Reply card */}
                        <div className="flex-1 bg-white/5 rounded-lg p-3 border border-white/5">
                          {/* Reply layout with sidebar */}
                          <div className="flex gap-3">
                            {/* Avatar sidebar with name and time */}
                            <div className="flex-shrink-0 w-8">
                              {getAvatarUrl(reply) ? (
                                <img
                                  src={getAvatarUrl(reply)}
                                  alt={getDisplayName(reply)}
                                  className="w-8 h-8 rounded-full object-cover border border-white/10"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                  {getDisplayName(reply).charAt(0).toUpperCase()}
                                </div>
                              )}
                              <p className="text-white/90 font-semibold text-[10px] mt-1.5 truncate">{getDisplayName(reply)}</p>
                              <p className="text-white/40 text-[9px]">{formatTimeAgo(reply.created_at)}</p>
                            </div>

                            {/* Vertical separator with padding */}
                            <div className="flex-shrink-0 px-2">
                              <div className="w-px bg-white/10 h-full" />
                            </div>

                            {/* Content area */}
                            <div className="flex-1 min-w-0">
                              {/* Edit/Delete buttons */}
                              <div className="flex justify-end mb-1">
                                {canModerateComment(reply.user_id) && !reply.is_deleted && (
                                  <div className="flex items-center gap-1">
                                    {editingId === reply.id ? (
                                      <button
                                        onClick={() => {
                                          setEditingId(null);
                                          setEditContent("");
                                        }}
                                        className="p-0.5 text-white/40 hover:text-white transition-colors"
                                      >
                                        <X size={10} />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setEditingId(reply.id);
                                          setEditContent(reply.content);
                                        }}
                                        className="p-0.5 text-white/40 hover:text-white transition-colors"
                                      >
                                        <Edit3 size={10} />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDelete(reply.id)}
                                      className="p-0.5 text-white/40 hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Reply content */}
                              {editingId === reply.id ? (
                                <div className="mb-2">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:border-spotify-green/50 resize-none"
                                    rows={2}
                                  />
                                  <div className="flex gap-2 mt-1">
                                    <button
                                      onClick={() => handleEdit(reply.id)}
                                      disabled={!editContent.trim()}
                                      className="px-2 py-1 bg-spotify-green text-black text-[10px] font-bold rounded-full disabled:opacity-50"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingId(null);
                                        setEditContent("");
                                      }}
                                      className="px-2 py-1 bg-white/10 text-white text-[10px] rounded-full hover:bg-white/15"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className={`text-white/80 text-xs mb-2 ${reply.is_deleted ? "line-through text-white/40" : ""}`}>
                                  {reply.content}
                                </p>
                              )}

                              {/* Reply actions */}
                              {!reply.is_deleted && (
                                <div className="flex items-center gap-3">
                                  {reply.user_id !== currentUserId && (
                                    <button
                                      onClick={() => handleLike(reply.id, reply.is_liked)}
                                      className={`flex items-center gap-1 text-[10px] transition-colors ${
                                        reply.is_liked ? "text-spotify-green" : "text-white/50 hover:text-white"
                                      }`}
                                    >
                                      <Heart size={12} fill={reply.is_liked ? "currentColor" : "none"} />
                                      {reply.likes_count > 0 && <span>{reply.likes_count}</span>}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/40 text-xs italic ml-14">No replies yet</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load more / Hide comments buttons */}
      {comments.length > 0 && allComments.length > COMMENTS_PER_PAGE && (
        <div className="mt-4 flex justify-center">
          {showAll ? (
            <button
              onClick={handleHideComments}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-full transition-colors"
            >
              Hide Comments
            </button>
          ) : (
            <button
              onClick={handleLoadMore}
              disabled={visibleCount >= allComments.length}
              className="px-4 py-2 bg-spotify-green hover:bg-spotify-green/90 text-black text-sm font-bold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {visibleCount >= allComments.length
                ? `All ${allComments.length} comments loaded`
                : `Load more comments (${allComments.length - visibleCount} remaining)`
              }
            </button>
          )}
        </div>
      )}
    </div>
  );
};
