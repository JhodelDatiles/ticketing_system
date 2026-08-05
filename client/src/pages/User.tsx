import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/auth-context";
import type { Role, User } from "../types/useAuth";
import type { PaginatedResponse } from "../types/tickets";

interface EditState {
  first_name: string;
  last_name: string;
  email: string;
}

const ROLE_ENDPOINT: Record<Role, string> = {
  admin: "admins",
  agent: "agents",
  customer: "customers",
};

const EMPTY_CREATE_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  role: "customer" as Role,
};

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditState>({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const [adminsRes, agentsRes, customersRes] = await Promise.all([
          api.get<PaginatedResponse<Omit<User, "role">>>("/users/admins", {
            params: { limit: 200 },
          }),
          api.get<PaginatedResponse<Omit<User, "role">>>("/users/agents", {
            params: { limit: 200 },
          }),
          api.get<PaginatedResponse<Omit<User, "role">>>("/users/customers", {
            params: { limit: 200 },
          }),
        ]);

        setUsers([
          ...adminsRes.data.data.map((u) => ({ ...u, role: "admin" as const })),
          ...agentsRes.data.data.map((u) => ({ ...u, role: "agent" as const })),
          ...customersRes.data.data.map((u) => ({
            ...u,
            role: "customer" as const,
          })),
        ]);
      } catch (err) {
        setLoadError(true);
        toast.error(getErrorMessage(err, "Failed to load users"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const startEdit = (u: User) => {
    setEditingId(u.id);
    setEditForm({
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
    });
  };

  const cancelEdit = () => setEditingId(null);

  const handleEditChange =
    (field: keyof EditState) => (e: ChangeEvent<HTMLInputElement>) => {
      setEditForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const saveEdit = async (u: User) => {
    setSavingId(u.id);
    try {
      await api.put(`/users/${ROLE_ENDPOINT[u.role]}/${u.id}`, editForm);
      setUsers((prev) =>
        prev.map((existing) =>
          existing.id === u.id ? { ...existing, ...editForm } : existing,
        ),
      );
      setEditingId(null);
      toast.success("User updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update user"));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (u: User) => {
    if (u.id === currentUser?.id) {
      toast.error("You can't delete your own account");
      return;
    }
    if (
      !window.confirm(
        `Delete ${u.first_name} ${u.last_name}? This can't be undone.`,
      )
    )
      return;

    setDeletingId(u.id);
    try {
      await api.delete(`/users/${ROLE_ENDPOINT[u.role]}/${u.id}`);
      setUsers((prev) => prev.filter((existing) => existing.id !== u.id));
      toast.success("User deleted");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete user"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateChange =
    (field: keyof typeof EMPTY_CREATE_FORM) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setCreateForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post<User>("/users", createForm);
      setUsers((prev) => [...prev, data]);
      setCreateForm(EMPTY_CREATE_FORM);
      setShowCreate(false);
      toast.success("User created");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create user"));
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading users...</div>;
  }

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-error mb-2">Couldn't load users.</p>
        <p className="text-base-content/60 text-sm">
          Check your connection and refresh the page to try again.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Users</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreate((v) => !v)}
        >
          {showCreate ? "Cancel" : "New user"}
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreateSubmit}
          className="card bg-base-100 shadow-sm mb-6"
        >
          <div className="card-body gap-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="form-control">
                <span className="label-text">First name</span>
                <input
                  className="input input-bordered w-full"
                  value={createForm.first_name}
                  onChange={handleCreateChange("first_name")}
                  required
                />
              </label>
              <label className="form-control">
                <span className="label-text">Last name</span>
                <input
                  className="input input-bordered w-full"
                  value={createForm.last_name}
                  onChange={handleCreateChange("last_name")}
                  required
                />
              </label>
            </div>

            <label className="form-control">
              <span className="label-text">Email</span>
              <input
                type="email"
                className="input input-bordered w-full"
                value={createForm.email}
                onChange={handleCreateChange("email")}
                required
              />
            </label>

            <label className="form-control">
              <span className="label-text">Password</span>
              <input
                type="password"
                className="input input-bordered w-full"
                value={createForm.password}
                onChange={handleCreateChange("password")}
                required
              />
            </label>

            <label className="form-control">
              <span className="label-text">Role</span>
              <select
                className="select select-bordered w-full"
                value={createForm.role}
                onChange={handleCreateChange("role")}
              >
                <option value="customer">Customer</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create user"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto bg-base-100 rounded-box shadow-sm">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isEditing = editingId === u.id;
              return (
                <tr key={u.id} className="hover">
                  {isEditing ? (
                    <>
                      <td className="flex gap-2">
                        <input
                          className="input input-bordered input-sm w-24"
                          value={editForm.first_name}
                          onChange={handleEditChange("first_name")}
                        />
                        <input
                          className="input input-bordered input-sm w-24"
                          value={editForm.last_name}
                          onChange={handleEditChange("last_name")}
                        />
                      </td>
                      <td>
                        <input
                          type="email"
                          className="input input-bordered input-sm w-full"
                          value={editForm.email}
                          onChange={handleEditChange("email")}
                        />
                      </td>
                      <td>
                        <span className="badge badge-outline">{u.role}</span>
                      </td>
                      <td className="flex gap-2">
                        <button
                          className="btn btn-xs btn-primary"
                          onClick={() => saveEdit(u)}
                          disabled={savingId === u.id}
                        >
                          {savingId === u.id ? "Saving..." : "Save"}
                        </button>
                        <button
                          className="btn btn-xs btn-ghost"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        {u.first_name} {u.last_name}
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className="badge badge-outline">{u.role}</span>
                      </td>
                      <td className="flex gap-2">
                        <button
                          className="btn btn-xs btn-outline"
                          onClick={() => startEdit(u)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-xs btn-error btn-outline"
                          onClick={() => handleDelete(u)}
                          disabled={deletingId === u.id}
                        >
                          {deletingId === u.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}