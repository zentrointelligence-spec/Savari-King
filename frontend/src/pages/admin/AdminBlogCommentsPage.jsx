import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminBlogService from '../../services/adminBlogService';

const AdminBlogCommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch pending comments
  useEffect(() => {
    fetchPendingComments();
  }, []);

  const fetchPendingComments = async () => {
    setLoading(true);
    try {
      const data = await adminBlogService.getPendingComments();
      setComments(data);
    } catch (error) {
      console.error('Error fetching pending comments:', error);
      toast.error('Failed to load pending comments');
    } finally {
      setLoading(false);
    }
  };

  // Handle approve comment
  const handleApprove = async (commentId) => {
    setActionLoading(commentId);
    try {
      await adminBlogService.approveComment(commentId);
      toast.success('Comment approved successfully');
      // Remove from list
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error approving comment:', error);
      toast.error('Failed to approve comment');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete comment
  const handleDelete = async (commentId, userName) => {
    if (!window.confirm(`Are you sure you want to delete the comment by ${userName}? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(commentId);
    try {
      await adminBlogService.deleteComment(commentId);
      toast.success('Comment deleted successfully');
      // Remove from list
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setActionLoading(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/admin/blog"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Blog Management
            </Link>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Comment Moderation</h1>
              <p className="mt-2 text-gray-600">
                Review and moderate pending blog comments
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-600">{comments.length}</div>
              <div className="text-sm text-gray-600">Pending Comments</div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-600">No pending comments to review.</p>
            <Link
              to="/admin/blog"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Blog Management
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  {/* Comment Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {/* User Avatar */}
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                        {comment.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{comment.user_name}</div>
                        <div className="text-sm text-gray-500">{comment.user_email}</div>
                      </div>
                    </div>

                    {/* Post Info */}
                    <div className="ml-13 mb-3">
                      <div className="text-sm text-gray-600">
                        Commented on:{' '}
                        <Link
                          to={`/blog/${comment.post_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {comment.post_title}
                        </Link>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div className="ml-13 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => handleApprove(comment.id)}
                      disabled={actionLoading === comment.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                    >
                      {actionLoading === comment.id ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </span>
                      ) : (
                        '✓ Approve'
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id, comment.user_name)}
                      disabled={actionLoading === comment.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                    >
                      {actionLoading === comment.id ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </span>
                      ) : (
                        '✗ Delete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Moderation Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Approve comments that are constructive, respectful, and relevant to the blog post</li>
            <li>• Delete comments containing spam, offensive language, or inappropriate content</li>
            <li>• Approved comments will be immediately visible on the blog post</li>
            <li>• Deleted comments cannot be recovered</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogCommentsPage;
