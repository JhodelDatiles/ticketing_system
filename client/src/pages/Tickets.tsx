import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/api";
import { getErrorMessage } from "../lib/api";
import type { Ticket, LookupItem } from "../types/tickets";

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statuses, setStatuses] = useState<LookupItem[]>([]);
  const [priorities, setPriorities] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ticketsRes, statusesRes, prioritiesRes] = await Promise.all([
          api.get<Ticket[]>("/tickets"),
          api.get<LookupItem[]>("/statuses"),
          api.get<LookupItem[]>("/priorities"),
        ]);
        setTickets(ticketsRes.data);
        setStatuses(statusesRes.data);
        setPriorities(prioritiesRes.data);
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to load tickets"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statusName = (id: number) => statuses.find((s) => s.id === id)?.name ?? "Unknown";
  const priorityName = (id: number) => priorities.find((p) => p.id === id)?.name ?? "Unknown";

  if (loading) {
    return <div className="flex justify-center p-8">Loading tickets...</div>;
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
        <div className="overflow-x-auto bg-base-100 rounded-box shadow-sm">
          <table className="table">
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover">
                  <td>
                    <Link to={`/tickets/${ticket.id}`} className="link link-primary">
                      {ticket.ticket_number}
                    </Link>
                  </td>
                  <td>{ticket.title}</td>
                  <td>
                    <span className="badge badge-outline">{statusName(ticket.status_id)}</span>
                  </td>
                  <td>
                    <span className="badge badge-outline">{priorityName(ticket.priority_id)}</span>
                  </td>
                  <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}