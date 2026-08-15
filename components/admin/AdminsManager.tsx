"use client";

import { useState } from "react";

interface AdminListItem {
  id: number;
  username: string;
  createdAt: Date;
  disabledAt: Date | null;
}

interface AdminsManagerProps {
  csrfToken: string;
  initialItems: AdminListItem[];
  currentActorId: string;
}

export function AdminsManager({ csrfToken, initialItems, currentActorId }: AdminsManagerProps) {
  const [items, setItems] = useState<AdminListItem[]>(initialItems);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "creating" | "deleting" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("creating");
    setMessage("");
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ username, password, csrf_token: csrfToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.issues?.[0] || data.error || `create failed (${res.status})`);
      }
      setItems((prev) => [data.item as AdminListItem, ...prev]);
      setMessage(`Created admin "${data.item.username}".`);
      setStatus("idle");
      setUsername("");
      setPassword("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Create failed.");
      setStatus("error");
    }
  };

  const handleDisable = async (id: number, username: string) => {
    if (!confirm(`Disable admin "${username}"? They will no longer be able to log in. This cannot be undone.`)) {
      return;
    }
    setStatus("deleting");
    setMessage("");
    try {
      const res = await fetch("/api/admin/admins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ id, csrf_token: csrfToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.issues?.[0] || data.error || `disable failed (${res.status})`);
      }
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, disabledAt: new Date() } : it)));
      setMessage(`Disabled admin "${username}".`);
      setStatus("idle");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Disable failed.");
      setStatus("error");
    }
  };

  const busy = status === "creating" || status === "deleting";

  return (
    <div className="mt-8 space-y-8">
      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm"
        aria-label="Create new admin"
      >
        <h2 className="text-lg font-semibold">Create new admin</h2>
        <p className="text-sm text-muted-foreground">
          New admins can log in immediately. Choose a strong password (at least
          12 characters). Passwords are hashed with scrypt and never stored in
          plaintext.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="block text-sm font-medium">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={50}
              pattern="[a-zA-Z0-9_-]+"
              autoComplete="off"
              className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={12}
              autoComplete="new-password"
              className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {status === "creating" ? "Creating..." : "Create admin"}
        </button>
        {message && (
          <p
            role={status === "error" ? "alert" : "status"}
            className={`text-sm ${status === "error" ? "text-red-600" : "text-green-700"}`}
          >
            {message}
          </p>
        )}
      </form>

      {/* Admin list */}
      {items.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => {
                const isSelf = String(item.id) === currentActorId;
                const isDisabled = !!item.disabledAt;
                return (
                  <tr key={item.id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-sm">#{item.id}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {item.username}
                      {isSelf && (
                        <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {isDisabled ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                          disabled
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          active
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {!isDisabled && !isSelf && (
                        <button
                          type="button"
                          onClick={() => handleDisable(item.id, item.username)}
                          disabled={busy}
                          className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        >
                          Disable
                        </button>
                      )}
                      {isSelf && (
                        <span className="text-xs text-muted-foreground">
                          Cannot disable yourself
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
