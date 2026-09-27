import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { CommentInput } from './CommentInput';
import { MessageSquare } from 'lucide-react';

export function CommentThread({ taskId, changeRecordId, changeRequestId }) {
  const { getUser } = useAuth();
  const { comments, addComment } = useData();

  const relevantComments = comments.filter((c) => {
    if (changeRecordId) return c.changeRecordId === changeRecordId || c.taskId === taskId;
    if (taskId) return c.taskId === taskId;
    if (changeRequestId) return c.changeRequestId === changeRequestId;
    return false;
  });

  const rootComments = relevantComments.filter((c) => !c.parentCommentId);

  const handleAddComment = (content, parentCommentId = null) => {
    addComment({
      taskId,
      changeRecordId,
      changeRequestId,
      content,
      parentCommentId,
    });
  };

  return (
    <div>
      {rootComments.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: '8px 0' }}>
          No comments yet. Start the discussion below.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rootComments.map((comment) => {
            const author = getUser(comment.authorId);
            const replies = relevantComments.filter((c) => c.parentCommentId === comment.id);

            return (
              <div key={comment.id} className="comment">
                <div
                  className="avatar avatar-sm"
                  style={{ background: author?.color || 'var(--accent-primary)' }}
                >
                  {author?.initials || 'U'}
                </div>

                <div className="comment__body">
                  <div className="comment__author">
                    <span>{author?.name || 'Teammate'}</span>
                    <span className="comment__time">
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="comment__content">{comment.content}</div>

                  {/* Replies */}
                  {replies.map((reply) => {
                    const replyAuthor = getUser(reply.authorId);
                    return (
                      <div key={reply.id} className="comment comment--reply" style={{ marginTop: 8 }}>
                        <div
                          className="avatar avatar-sm"
                          style={{
                            background: replyAuthor?.color || 'var(--accent-primary)',
                            width: 20,
                            height: 20,
                            fontSize: 10,
                          }}
                        >
                          {replyAuthor?.initials || 'U'}
                        </div>
                        <div className="comment__body">
                          <div className="comment__author" style={{ fontSize: 12 }}>
                            <span>{replyAuthor?.name || 'Teammate'}</span>
                            <span className="comment__time">
                              {new Date(reply.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="comment__content" style={{ fontSize: 12 }}>
                            {reply.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CommentInput onSubmit={(content) => handleAddComment(content)} />
    </div>
  );
}
