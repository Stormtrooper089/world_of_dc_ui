import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { complaintService } from "../../services/complaintService";
import api from "../../services/api";
import { Comment, CommentUpdateRequest, CommentAttachment } from "../../types";
import {
  MessageCircle,
  Edit2,
  Trash2,
  Send,
  Image,
  Video,
  File,
  Paperclip,
  X,
} from "lucide-react";

interface CommentSectionProps {
  complaintId: string;
  initialComments?: Comment[];
}

const CommentSection: React.FC<CommentSectionProps> = ({
  complaintId,
  initialComments,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch comments when component mounts (only if not provided via props)
  useEffect(() => {
    if (!initialComments) {
      fetchComments();
    } else {
      setComments(initialComments);
    }
  }, [complaintId, initialComments]);

  const fetchComments = async () => {
    try {
      const fetchedComments = await complaintService.getComments(complaintId);
      setComments(fetchedComments || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      // Always use FormData since the backend expects multipart/form-data
      const formData = new FormData();
      formData.append("text", newComment.trim());

      // Add files if any
      attachments.forEach((file) => {
        formData.append("files", file);
      });

      // Use axios directly for FormData
      const response = await api.post(
        `/complaints/${complaintId}/comments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const newCommentData: Comment = response.data.data;

      setComments((prev) => [...prev, newCommentData]);
      setNewComment("");
      setAttachments([]);
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;

    setLoading(true);
    try {
      const updateData: CommentUpdateRequest = {
        commentId,
        text: editText,
      };

      const updatedComment = await complaintService.updateComment(updateData);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updatedComment : c))
      );
      setEditingComment(null);
      setEditText("");
    } catch (error) {
      console.error("Failed to update comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setLoading(true);
    try {
      await complaintService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAttachment = async (attachment: CommentAttachment) => {
    try {
      // Use the full filePath as stored in the database
      const downloadUrl = `/api/files/download/${attachment.filePath}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = attachment.fileName;
      link.style.display = "none";

      // Add authorization header for the download request
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");

      // For same-origin requests, we need to handle auth differently
      // Let's use fetch instead to properly handle authentication
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to download file:", response.statusText);
        // Fallback to direct link if fetch fails
        window.open(downloadUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to download attachment:", error);
      // Fallback to direct link
      window.open(`/api/files/download/${attachment.filePath}`, "_blank");
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    setShowAttachmentOptions(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditText("");
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "DISTRICT_COMMISSIONER":
        return "District Commissioner";
      case "OFFICER":
        return "Officer";
      case "CITIZEN":
        return "Citizen";
      default:
        return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
        <span className="text-sm text-gray-500">({comments.length})</span>
      </div>

      {/* Comments List */}
      <div className="space-y-4 mb-6">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No comments yet.</p>
            <p className="text-sm text-gray-400">
              Be the first to share your thoughts below!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {(comment.commenterName || comment.commenterId)
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">
                        {comment.commenterName || comment.commenterId}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {getRoleDisplayName(comment.commenterRole)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  {editingComment === comment.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditComment(comment.id);
                          }}
                          disabled={loading}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            cancelEditing();
                          }}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  )}

                  {/* Attachments would go here */}
                  {comment.attachments && comment.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {comment.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center space-x-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleDownloadAttachment(attachment)}
                          title="Click to download"
                        >
                          {attachment.attachmentType === "image" && (
                            <Image className="h-4 w-4 text-blue-500" />
                          )}
                          {attachment.attachmentType === "video" && (
                            <Video className="h-4 w-4 text-blue-500" />
                          )}
                          {attachment.attachmentType === "document" && (
                            <File className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="text-sm text-blue-600 hover:text-blue-800 underline">
                            {attachment.fileName}
                          </span>
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comment Actions */}
                {comment.commenterId === user?.id &&
                  editingComment !== comment.id && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startEditing(comment);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteComment(comment.id);
                        }}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <div className="border-t pt-4 bg-gray-50 -mx-6 px-6 pb-4 rounded-b-lg">
        <h4 className="text-md font-medium text-gray-900 mb-3">
          Add a Comment
        </h4>
        <div className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment here..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                >
                  {file.type.startsWith("image/") && (
                    <Image className="h-4 w-4" />
                  )}
                  {file.type.startsWith("video/") && (
                    <Video className="h-4 w-4" />
                  )}
                  {!file.type.startsWith("image/") &&
                    !file.type.startsWith("video/") && (
                      <File className="h-4 w-4" />
                    )}
                  <span className="text-sm text-gray-600 flex-1">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeAttachment(index);
                    }}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Attachment Options */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAttachmentOptions(!showAttachmentOptions);
                }}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 flex items-center space-x-2"
              >
                <Paperclip className="h-5 w-5" />
                <span className="text-sm">Attach</span>
              </button>
              {showAttachmentOptions && (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-blue-500 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50"
                    title="Add image"
                  >
                    <Image className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-blue-500 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50"
                    title="Add video"
                  >
                    <Video className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddComment();
              }}
              disabled={loading || !newComment.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? "Posting..." : "Comment"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
