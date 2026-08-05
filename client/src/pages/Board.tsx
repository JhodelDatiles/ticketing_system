import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import type { BoardTicket, LookupItem } from "../types/tickets";

export default function Board() {
  const [tickets, setTickets] = useState<BoardTicket[]>([]);
  const [statuses, setStatuses] = useState<LookupItem[]>([]);
  const [priorities, setPriorities] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [dragTicketId, setDragTicketId] = useState<number | null>(null);
  const [dragOverTicketId, setDragOverTicketId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const [ticketsRes, statusesRes, prioritiesRes] = await Promise.all([
          api.get<BoardTicket[]>("/tickets/board"),
          api.get<LookupItem[]>("/statuses"),
          api.get<LookupItem[]>("/priorities"),
        ]);
        setTickets(ticketsRes.data);
        setStatuses(statusesRes.data);
        setPriorities(prioritiesRes.data);
      } catch (err) {
        setLoadError(true);
        toast.error(getErrorMessage(err, "Failed to load board"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const priorityName = (id: number) =>
    priorities.find((p) => p.id === id)?.name ?? "Unknown";

  const handleDrop = async (
    columnStatusId: number,
    targetTicketId: number | null,
  ) => {
    if (dragTicketId === null) return;
    const draggedId = dragTicketId;
    setDragTicketId(null);
    setDragOverTicketId(null);

    const previous = tickets;
    const dragged = previous.find((t) => t.id === draggedId);
    if (!dragged) return;

    const without = previous.filter((t) => t.id !== draggedId);
    const updatedDragged = { ...dragged, status_id: columnStatusId };

    let insertAt: number;
    if (targetTicketId === null) {
      let lastIdx = -1;
      without.forEach((t, i) => {
        if (t.status_id === columnStatusId) lastIdx = i;
      });
      insertAt = lastIdx + 1;
    } else {
      insertAt = without.findIndex((t) => t.id === targetTicketId);
      if (insertAt === -1) insertAt = without.length;
    }

    const next = [
      ...without.slice(0, insertAt),
      updatedDragged,
      ...without.slice(insertAt),
    ];

    setTickets(next);

    const columnOrderIds = next
      .filter((t) => t.status_id === columnStatusId)
      .map((t) => t.id);

    try {
      await api.put("/tickets/reorder", {
        status_id: columnStatusId,
        ticket_ids: columnOrderIds,
      });
    } catch (err) {
      setTickets(previous);
      toast.error(getErrorMessage(err, "Failed to reorder tickets"));
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading board...</div>;
  }

  if (loadError) {
    return (
      <div className="max-w-5xl mx-auto text-center py-12">
        <p className="text-error mb-2">Couldn't load the board.</p>
        <p className="text-base-content/60 text-sm">
          Check your connection and refresh the page to try again.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-full">
      <h1 className="text-2xl font-semibold mb-4">Board</h1>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {statuses.map((status) => {
          const columnTickets = tickets.filter(
            (t) => t.status_id === status.id,
          );
          return (
            <div
              key={status.id}
              className="bg-base-200 rounded-box p-3 w-72 shrink-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(status.id, dragOverTicketId)}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm">{status.name}</h2>
                <span className="badge badge-sm">{columnTickets.length}</span>
              </div>

              <div className="flex flex-col gap-2">
                {columnTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    draggable
                    onDragStart={() => setDragTicketId(ticket.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverTicketId(ticket.id);
                    }}
                    onDrop={(e) => {
                      e.stopPropagation();
                      handleDrop(status.id, ticket.id);
                    }}
                    className="card bg-base-100 shadow-sm cursor-grab active:cursor-grabbing"
                  >
                    <div className="card-body p-3 gap-1">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="link link-primary text-xs"
                      >
                        {ticket.ticket_number}
                      </Link>
                      <p className="text-sm font-medium">{ticket.title}</p>
                      <span className="badge badge-outline badge-xs w-fit">
                        {priorityName(ticket.priority_id)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
