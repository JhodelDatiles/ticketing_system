import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/auth-context";
import type { Ticket, LookupItem, PaginatedResponse } from "../types/tickets";

interface FormState {
  title: string;
  description: string;
  category_id: string;
  priority_id: string;
  status_id: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  category_id: "",
  priority_id: "",
  status_id: "",
};

export default function TicketForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "agent";

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [categories, setCategories] = useState<LookupItem[]>([]);
  const [priorities, setPriorities] = useState<LookupItem[]>([]);
  const [statuses, setStatuses] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [categoriesRes, prioritiesRes, statusesRes] = await Promise.all([
          api.get<PaginatedResponse<LookupItem>>("/categories", {
            params: { limit: 200 },
          }),
          api.get<PaginatedResponse<LookupItem>>("/priorities", {
            params: { limit: 200 },
          }),
          api.get<PaginatedResponse<LookupItem>>("/statuses", {
            params: { limit: 200 },
          }),
        ]);
        setCategories(categoriesRes.data.data);
        setPriorities(prioritiesRes.data.data);
        setStatuses(statusesRes.data.data);

        if (isEdit && id) {
          const { data } = await api.get<Ticket>(`/tickets/${id}`);
          const isOwner = user?.id === data.created_by;

          if (!isStaff && (!isOwner || data.closed_at)) {
            toast.error("You don't have permission to edit this ticket");
            navigate(`/tickets/${id}`);
            return;
          }

          setForm({
            title: data.title,
            description: data.description,
            category_id: String(data.category_id),
            priority_id: String(data.priority_id),
            status_id: String(data.status_id),
          });
        }
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to load form data"));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const handleChange =
    (field: keyof FormState) =>
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      if (isEdit && id) {
        const payload: Partial<FormState> = {
          title: form.title,
          description: form.description,
          category_id: form.category_id,
          priority_id: form.priority_id,
        };
        if (isStaff) {
          payload.status_id = form.status_id;
        }

        const { data } = await api.put<Ticket>(`/tickets/${id}`, {
          category_id: Number(form.category_id),
          priority_id: Number(form.priority_id),
          ...(isStaff ? { status_id: Number(form.status_id) } : {}),
        });
        toast.success("Ticket updated");
        navigate(`/tickets/${data.id}`);
      } else {
        const { data } = await api.post<Ticket>("/tickets", {
          title: form.title,
          description: form.description,
          category_id: Number(form.category_id),
          priority_id: Number(form.priority_id),
        });
        toast.success("Ticket created");
        navigate(`/tickets/${data.id}`);
      }
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          isEdit ? "Failed to update ticket" : "Failed to create ticket",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link to="/" className="link link-primary text-sm">
          Back to tickets
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-sm">
        <div className="card-body gap-4">
          <h1 className="text-xl font-semibold">
            {isEdit ? "Edit ticket" : "New ticket"}
          </h1>

          <label className="form-control">
            <span className="label-text">Title</span>
            <input
              className="input input-bordered w-full"
              value={form.title}
              onChange={handleChange("title")}
              required
            />
          </label>

          <label className="form-control">
            <span className="label-text">Description</span>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={5}
              value={form.description}
              onChange={handleChange("description")}
              required
            />
          </label>

          <label className="form-control">
            <span className="label-text">Category</span>
            <select
              className="select select-bordered w-full"
              value={form.category_id}
              onChange={handleChange("category_id")}
              required
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control">
            <span className="label-text">Priority</span>
            <select
              className="select select-bordered w-full"
              value={form.priority_id}
              onChange={handleChange("priority_id")}
              required
            >
              <option value="" disabled>
                Select priority
              </option>
              {priorities.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          {isEdit && isStaff && (
            <label className="form-control">
              <span className="label-text">Status</span>
              <select
                className="select select-bordered w-full"
                value={form.status_id}
                onChange={handleChange("status_id")}
                required
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting
              ? "Saving..."
              : isEdit
                ? "Save changes"
                : "Create ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
