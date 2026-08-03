import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import type { Ticket, LookupItem } from "../types/tickets";

interface TicketsResponse {
  data: Ticket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const PAGE_SIZE = 20;

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statuses, setStatuses] = useState<LookupItem[]>([]);
  const [priorities, setPriorities] = useState<LookupItem[]>([]);
  const [categories, setCategories] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const [ticketsRes, statusesRes, prioritiesRes, categoriesRes] = await Promise.all([
          api.get<TicketsResponse>("/tickets", { params: { page, limit: PAGE_SIZE } }),
          api.get<LookupItem[]>("/statuses"),
          api.get<LookupItem[]>("/priorities"),
          api.get<LookupItem[]>("/categories"),
        ]);

        const body = ticketsRes.data;
        if (!body?.pagination) {
          throw new Error("Unexpected response shape from /tickets — expected { data, pagination }");
        }

        setTickets(body.data);
        const serverTotalPages = body.pagination.totalPages;
        setTotalPages(serverTotalPages);

        if (serverTotalPages > 0 && page > serverTotalPages) {
          setPage(serverTotalPages);
          return;
        }

        setStatuses(statusesRes.data);
        setPriorities(prioritiesRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        setLoadError(true);
        toast.error(getErrorMessage(err, "Failed to load tickets"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const statusName = (id: number) =>
    statuses.find((s) => s.id === id)?.name ?? "Unknown";
  const priorityName = (id: number) =>
    priorities.find((p) => p.id === id)?.name ?? "Unknown";
  const categoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name ?? "Unknown";

  if (loading) {
    return <div className="flex justify-center p-8">Loading tickets...</div>;
  }

  if (loadError) {
    return (
      <div className="max-w-5xl mx-auto text-center py-12">
        <p className="text-error mb-2">Couldn't load tickets.</p>
        <p className="text-base-content/60 text-sm">
          Check your connection and refresh the page to try again.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <Link to="/tickets/new" className="btn btn-primary btn-sm">
          New ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center text-base-content/60 py-12">
          No tickets yet.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-base-100 rounded-box shadow-sm">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover">
                    <td>
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="link link-primary"
                      >
                        {ticket.ticket_number}
                      </Link>
                    </td>
                    <td>{ticket.title}</td>
                    <td>{categoryName(ticket.category_id)}</td>
                    <td>
                      <span className="badge badge-outline">
                        {statusName(ticket.status_id)}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-outline">
                        {priorityName(ticket.priority_id)}
                      </span>
                    </td>
                    <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                className="btn btn-sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="text-sm text-base-content/60">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
