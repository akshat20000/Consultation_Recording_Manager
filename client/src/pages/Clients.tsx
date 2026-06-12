import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { clientApi } from '../services/clientApi';
import type { ClientData } from '../services/clientApi';
import {
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  FileText,
  X,
  Mic,
  AlertCircle,
  PlusCircle,
  Users,
} from 'lucide-react';

export const Clients: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch clients
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => clientApi.list(search),
    placeholderData: (previousData) => previousData,
  });

  // Create client mutation
  const createMutation = useMutation({
    mutationFn: clientApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to create client');
    },
  });

  // Update client mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientData> }) =>
      clientApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to update client');
    },
  });

  // Delete client mutation
  const deleteMutation = useMutation({
    mutationFn: clientApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to delete client. They might have active sessions.');
    },
  });

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setEditingClient(null);
    setFormOpen(false);
    setErrorMsg('');
  };

  const handleEditClick = (client: ClientData) => {
    setEditingClient(client);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone);
    setNotes(client.notes || '');
    setFormOpen(true);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !phone) {
      setErrorMsg('Please fill in all required fields (Name, Email, Phone).');
      return;
    }

    const payload = { name, email, phone, notes };

    if (editingClient) {
      updateMutation.mutate({
        id: editingClient._id || editingClient.id || '',
        data: payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (client: ClientData) => {
    const id = client._id || client.id;
    if (id && confirm(`Are you sure you want to delete ${client.name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 font-sans">
            Client Profiles
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your consult clients, review historical details, and initiate recordings.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setFormOpen(true);
          }}
          className="astro-button-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5 text-accent-gold" />
          Add Client
        </button>
      </div>

      {/* Form Section */}
      {formOpen && (
        <div className="glass-panel p-6 border-indigo-500/30 animate-in fade-in slide-in-from-top-4 duration-250">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-xl font-bold text-slate-200">
              {editingClient ? `Edit Profile: ${editingClient.name}` : 'Create Client Profile'}
            </h2>
            <button
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Client Name <span className="text-rose-450">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="astro-input"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address <span className="text-rose-450">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="astro-input"
                  placeholder="e.g. rahul@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Phone Number <span className="text-rose-450">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="astro-input"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Consultation Background & Birth Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="astro-input min-h-24 resize-y"
                placeholder="e.g. Born 12 Oct 1993, 14:15 PM, New Delhi. Interested in career prediction and Saturn transit."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" onClick={resetForm} className="astro-button-secondary">
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="astro-button-primary"
              >
                {editingClient ? 'Update Profile' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & List */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="astro-input pl-11"
            placeholder="Search by name, email, or phone..."
          />
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-astrology-500 border-t-transparent"></div>
            <p className="text-slate-400 text-sm font-medium">Fetching client list...</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-2xl text-center">
            <p className="font-semibold">Failed to fetch clients</p>
            <p className="text-sm mt-1">{(error as any).message || 'Connection timed out'}</p>
          </div>
        )}

        {/* Clients List grid */}
        {!isLoading && !error && (
          <>
            {clients.length === 0 ? (
              <div className="glass-panel p-16 text-center flex flex-col items-center justify-center">
                <Users className="h-16 w-16 text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-slate-300">No clients registered</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-1">
                  Create client profiles first so you can associate consultation audio files with them.
                </p>
                <button
                  onClick={() => setFormOpen(true)}
                  className="astro-button-primary flex items-center gap-2 mt-6"
                >
                  <PlusCircle className="h-5 w-5" />
                  Add First Client
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => {
                  const clientId = client._id || client.id || '';
                  return (
                    <div
                      key={clientId}
                      className="glass-panel glass-panel-hover p-6 flex flex-col justify-between gap-6 relative group overflow-hidden"
                    >
                      {/* Purple accent highlight on hover */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-astrology-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-100 group-hover:text-astrology-300 transition-colors">
                            {client.name}
                          </h3>
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                            Client Profile
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-slate-400">
                          <div className="flex items-center gap-2.5">
                            <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                            <span>{client.phone}</span>
                          </div>
                          {client.notes && (
                            <div className="flex gap-2.5 pt-2 border-t border-slate-800/60">
                              <FileText className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                                {client.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80">
                        <Link
                          to={`/record?clientId=${clientId}`}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-astrology-950 to-indigo-950 hover:from-astrology-900 hover:to-indigo-900 text-astrology-300 border border-astrology-850 hover:border-astrology-700 text-xs font-semibold py-2 px-3 rounded-lg transition-all active:scale-98"
                        >
                          <Mic className="h-3.5 w-3.5 text-accent-gold" />
                          Record Session
                        </Link>
                        <button
                          onClick={() => handleEditClick(client)}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
                          title="Edit Profile"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client)}
                          className="p-2 bg-slate-900 hover:bg-rose-950/20 text-slate-400 hover:text-rose-450 border border-slate-800 hover:border-rose-950/30 rounded-lg transition-colors"
                          title="Delete Profile"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default Clients;
