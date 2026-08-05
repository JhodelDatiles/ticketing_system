import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/auth-context";
import type {
  Ticket,
  LookupItem,
  Comment,
  Attachment,
  PaginatedResponse,
} from "../types/tickets";

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [statuses, setStatuses] = useState<LookupItem[]>([]);
  const [priorities, setPriorities] = useState<LookupItem[]>([]);
  const [categories, setCategories] = useState<LookupItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const [
          ticketRes,
          commentsRes,
          attachmentsRes,
          statusesRes,
          prioritiesRes,
          categoriesRes,
        ] = await Promise.all([
          api.get<Ticket>(`/tickets/${id}`),
          api.get<Comment[]>(`/tickets/${id}/comments`),
          api.get<Attachment[]>(`/tickets/${id}/attachments`),
          api.get<PaginatedResponse<LookupItem>>("/statuses", {
            params: { limit: 200 },
          }),
          api.get<PaginatedResponse<LookupItem>>("/priorities", {
            params: { limit: 200 },
          }),
          api.get<PaginatedResponse<LookupItem>>("/categories", {
            params: { limit: 200 },
          }),
        ]);
        setTicket(ticketRes.data);
        setComments(commentsRes.data);
        setAttachments(attachmentsRes.data);
        setStatuses(statusesRes.data.data);
        setPriorities(prioritiesRes.data.data);
        setCategories(categoriesRes.data.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error(getErrorMessage(err, "Failed to load ticket"));
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const statusName = (statusId: number) =>
    statuses.find((s) => s.id === statusId)?.name ?? "Unknown";
  const priorityName = (priorityId: number) =>
    priorities.find((p) => p.id === priorityId)?.name ?? "Unknown";
  const categoryName = (categoryId: number) =>
    categories.find((c) => c.id === categoryId)?.name ?? "Unknown";

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await api.post<Comment>(`/tickets/${id}/comments`, {
        user_id: user.id,
        message: newComment.trim(),
      });
      setComments((prev) => [...prev, data]);
      setNewComment("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to add comment"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const { data } = await api.post<Attachment>(
        `/tickets/${id}/attachments`,
        formData,
      );
      setAttachments((prev) => [data, ...prev]);
      toast.success("File uploaded");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload file"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const res = await api.get(`/attachments/${attachment.id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to download attachment"));
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading ticket...</div>;
  }

  if (notFound || !ticket) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-base-content/60 mb-4">Ticket not found.</p>
        <Link to="/" className="link link-primary">
          Back to tickets
        </Link>
      </div>
    );
  }

  const canEdit =
    !!user &&
    (user.role === "admin" ||
      user.role === "agent" ||
      (user.id === ticket.created_by && !ticket.closed_at));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link to="/" className="link link-primary text-sm">
          Back to tickets
        </Link>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold">{ticket.title}</h1>
              <p className="text-sm text-base-content/60">
                {ticket.ticket_number}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="badge badge-outline">
                {statusName(ticket.status_id)}
              </span>
              <span className="badge badge-outline">
                {priorityName(ticket.priority_id)}
              </span>
              {canEdit && (
                <Link
                  to={`/tickets/${ticket.id}/edit`}
                  className="btn btn-xs btn-outline"
                >
                  Edit
                </Link>
              )}
            </div>
          </div>

          <div className="text-sm text-base-content/60">
            {categoryName(ticket.category_id)} · Opened{" "}
            {new Date(ticket.created_at).toLocaleDateString()}
          </div>

          <p className="mt-2 whitespace-pre-wrap">{ticket.description}</p>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="font-semibold mb-2">Attachments</h2>
          {attachments.length === 0 ? (
            <p className="text-sm text-base-content/60 mb-3">No attachments.</p>
          ) : (
            <ul className="space-y-1 text-sm mb-3">
              {attachments.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => handleDownload(a)}
                    className="link link-primary text-left"
                  >
                    {a.file_name}
                  </button>
                  <span className="text-base-content/50 ml-2">
                    {(a.file_size / 1024).toFixed(1)} KB
                  </span>
                </li>
              ))}
            </ul>
          )}
          <input
            type="file"
            className="file-input file-input-bordered file-input-sm w-full max-w-xs"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="font-semibold mb-2">Comments</h2>

          {comments.length === 0 ? (
            <p className="text-sm text-base-content/60 mb-4">
              No comments yet.
            </p>
          ) : (
            <ul className="space-y-3 mb-4">
              {comments.map((c) => (
                <li key={c.id} className="bg-base-200 rounded-box p-3">
                  <p className="text-sm">{c.message}</p>
                  <p className="text-xs text-base-content/50 mt-1">
                    {new Date(c.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              className="input input-bordered flex-1"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
