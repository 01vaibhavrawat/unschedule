import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export function PostCard({ post, currentUserId, onPostDeleted }: { post: any; currentUserId?: string; onPostDeleted?: () => void }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [reactionCount, setReactionCount] = useState(post.reaction_count || 0);
  const [userReacted, setUserReacted] = useState(post.user_reacted || false);
  const [commentCount, setCommentCount] = useState(post.comment_count || 0);

  const toggleReaction = async () => {
    try {
      const res = await api.toggleReaction(post.id);
      if (res.status === 'added') {
        setUserReacted(true);
        setReactionCount((prev: number) => prev + 1);
      } else {
        setUserReacted(false);
        setReactionCount((prev: number) => prev - 1);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadComments = async () => {
    try {
      const data = await api.getComments(post.id);
      setComments(data);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      const created = await api.createComment(post.id, newComment);
      setComments((prev: any[]) => [...prev, created]);
      setCommentCount((prev: number) => prev + 1);
      setNewComment('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.deleteComment(commentId);
      setComments((prev: any[]) => prev.filter((c: any) => c.id !== commentId));
      setCommentCount((prev: number) => prev - 1);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md mb-4">
      <div className="flex justify-between items-start mb-2">
        <Link href={`/profile/${post.user_id}`} className="font-semibold text-gray-900 hover:text-[var(--color-brand-primary)]">
          {post.user_name}
        </Link>
        {currentUserId === post.user_id && onPostDeleted && (
          <button onClick={onPostDeleted} className="text-red-400 hover:text-red-600 text-sm">
            Delete
          </button>
        )}
      </div>

      {post.activity_type && post.activity_snapshot && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600 mb-3 flex items-center gap-3">
          <div className="bg-[var(--color-brand-primary)] text-white p-2 rounded-full shadow-sm">
            {post.activity_type === 'habit' ? '🔥' : '🎯'}
          </div>
          <div>
            <div className="font-medium text-gray-800">
              {post.activity_type === 'habit' ? 'Habit Milestone' : 'Goal Update'}
            </div>
            <div>
              {post.activity_type === 'habit'
                ? `Reached a milestone on "${post.activity_snapshot.title || 'habit'}"!`
                : `Updated goal progress on "${post.activity_snapshot.title || 'goal'}"`}
            </div>
          </div>
        </div>
      )}

      {post.content && (
        <div 
          className="text-gray-700 prose prose-sm max-w-none mb-3" 
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      )}

      <div className="mt-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleReaction}
            className={`flex items-center gap-1 hover:text-[var(--color-brand-primary)] transition-colors ${userReacted ? 'text-[var(--color-brand-primary)] font-medium' : ''}`}
          >
            <span>{userReacted ? '❤️' : '🤍'}</span>
            <span>{reactionCount}</span>
          </button>
          <button
            onClick={toggleComments}
            className="flex items-center gap-1 hover:text-[var(--color-brand-primary)] transition-colors"
          >
            <span>💬</span>
            <span>{commentCount}</span>
          </button>
        </div>
        <div>
          {new Date(post.created_at).toLocaleString()}
        </div>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="space-y-3 mb-4">
            {comments.map(c => (
              <div key={c.id} className="text-sm">
                <span className="font-semibold text-gray-800 mr-2">{c.user_name}</span>
                <span className="text-gray-600">{c.content}</span>
                {currentUserId === c.user_id && (
                  <button onClick={() => handleDeleteComment(c.id)} className="text-xs text-red-400 ml-2 hover:underline">delete</button>
                )}
              </div>
            ))}
            {comments.length === 0 && <div className="text-xs text-gray-400">No comments yet.</div>}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)]"
            />
            <button
              onClick={handlePostComment}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
