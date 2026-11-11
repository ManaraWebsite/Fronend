import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch, FiMail, FiTrash2, FiEye, FiEyeOff, FiCornerUpLeft, FiAlertTriangle, FiChevronLeft, FiChevronRight, FiInbox } from 'react-icons/fi';
import axiosClient from './axiosClient';
import { getApiErrorMessage } from '../lib/apiError';
import { formatMessageDate } from '../lib/contactMessages';

const PER_PAGE = 15;

const selectClass = 'bg-[#0d1117] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00] cursor-pointer';

const StatCard = ({ label, value, tone, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`text-left p-4 rounded-2xl border transition cursor-pointer ${active ? 'border-[#ff7a00] bg-[#ff7a00]/10' : 'border-gray-800 bg-[#161b22] hover:border-gray-700'}`}
  >
    <span className="block text-xs font-semibold text-gray-400 uppercase">{label}</span>
    <span className={`block mt-1 text-2xl font-bold tabular-nums ${tone}`}>{value ?? '—'}</span>
  </button>
);

// صفحة رسائل «تواصل معنا»: GET /admin/contact-messages مع البحث والفلاتر والترقيم.
// الفلاتر محفوظة في رابط الصفحة، فالرجوع من صفحة الرسالة يعيد نفس القائمة.
const ContactMessagesAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const read = searchParams.get('read') || '';
  const status = searchParams.get('status') || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [searchInput, setSearchInput] = useState(search);
  const [messages, setMessages] = useState([]);
  const [meta, setMeta] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState(() => (location.state?.flash ? { type: 'success', text: location.state.flash } : null));
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (location.state?.flash) navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location.pathname, location.search, location.state, navigate]);

  const setFilters = useCallback((changes) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
      if (!('page' in changes)) next.delete('page'); // فلتر جديد يبدأ من الصفحة الأولى
      return next;
    });
  }, [setSearchParams]);

  // البحث بعد توقف الكتابة قليلاً بدلاً من طلب لكل حرف
  useEffect(() => {
    if (searchInput.trim() === search) return undefined;
    const timer = setTimeout(() => setFilters({ search: searchInput.trim() }), 350);
    return () => clearTimeout(timer);
  }, [searchInput, search, setFilters]);

  const fetchMessages = useCallback(async () => {
    setLoadError('');
    try {
      const params = { page, per_page: PER_PAGE };
      if (search) params.search = search;
      if (read) params.read = read;
      if (status) params.status = status;
      const response = await axiosClient.get('/admin/contact-messages', { params });
      setMessages(response.data.data || []);
      setMeta(response.data.meta || null);
      setStats(response.data.stats || null);
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'Failed to load messages.'));
    } finally {
      setLoading(false);
    }
  }, [page, search, read, status]);

  useEffect(() => {
    setLoading(true);
    fetchMessages();
  }, [fetchMessages]);

  // صفحة فارغة بعد حذف آخر رسالة فيها: نرجع للصفحة السابقة
  useEffect(() => {
    if (!loading && meta && page > 1 && page > meta.last_page) setFilters({ page: String(meta.last_page) });
  }, [loading, meta, page, setFilters]);

  const runAction = async (id, request, successText, failureText) => {
    setBusyId(id);
    try {
      await request();
      await fetchMessages();
      setNotice({ type: 'success', text: successText });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, failureText) });
    } finally {
      setBusyId(null);
    }
  };

  // PATCH /admin/contact-messages/{id}
  const toggleRead = (message) => runAction(
    message.id,
    () => axiosClient.patch(`/admin/contact-messages/${message.id}`, { is_read: !message.is_read }),
    message.is_read ? 'Message marked as unread.' : 'Message marked as read.',
    'Failed to update the message.',
  );

  // DELETE /admin/contact-messages/{id}
  const handleDelete = (message) => {
    if (!window.confirm(`Delete the message from ${message.name}? This cannot be undone.`)) return;
    runAction(message.id, () => axiosClient.delete(`/admin/contact-messages/${message.id}`), 'Message deleted.', 'Failed to delete the message.');
  };

  const hasFilters = Boolean(search || read || status);
  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const actionClass = 'p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition cursor-pointer disabled:opacity-40';
  const from = meta?.from ?? 0;
  const to = meta?.to ?? 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#0d1117] text-gray-100" dir="ltr">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-gray-800 pb-4">
        <div>
          <span className="text-xs text-gray-400">Admin /</span>
          <h1 className="text-xl font-bold text-white">Contact Messages</h1>
        </div>
      </div>

      {notice && (
        <div role="status" className={`p-4 mb-4 rounded-xl text-sm border ${notice.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/25' : 'bg-red-500/10 text-red-400 border-red-500/25'}`}>
          {notice.text}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total" value={stats?.total} tone="text-white" active={!read && !status} onClick={() => setFilters({ read: '', status: '' })} />
        <StatCard label="Unread" value={stats?.unread} tone="text-[#ff7a00]" active={read === 'unread' && !status} onClick={() => setFilters({ read: 'unread', status: '' })} />
        <StatCard label="Read" value={stats?.read} tone="text-gray-200" active={read === 'read' && !status} onClick={() => setFilters({ read: 'read', status: '' })} />
        <StatCard label="Replied" value={stats?.replied} tone="text-green-400" active={status === 'replied' && !read} onClick={() => setFilters({ read: '', status: 'replied' })} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <label className="relative flex-1">
          <span className="sr-only">Search by name or email</span>
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            maxLength={100}
            className="w-full bg-[#0d1117] border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00]"
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <select aria-label="Filter by read state" value={read} onChange={(e) => setFilters({ read: e.target.value })} className={selectClass}>
            <option value="">All messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <select aria-label="Filter by reply status" value={status} onChange={(e) => setFilters({ status: e.target.value })} className={selectClass}>
            <option value="">Any reply status</option>
            <option value="pending">Awaiting reply</option>
            <option value="replied">Replied</option>
          </select>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="px-3 py-2.5 text-sm font-semibold text-[#ff7a00] hover:underline cursor-pointer">Clear filters</button>
          )}
        </div>
      </div>

      <div className="bg-[#161b22] border border-gray-800 rounded-2xl overflow-hidden" aria-busy={loading}>
        {loading && messages.length === 0 ? (
          <p className="text-center py-10 text-gray-500 text-sm" role="status">Loading messages...</p>
        ) : loadError ? (
          <div role="alert" className="text-center py-10 space-y-3">
            <p className="text-red-400 text-sm">{loadError}</p>
            <button onClick={() => { setLoading(true); fetchMessages(); }} className="text-[#ff7a00] font-semibold text-sm hover:underline cursor-pointer">Try again</button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FiInbox className="mx-auto text-gray-600" size={28} aria-hidden="true" />
            <p className="mt-3 text-gray-300 text-sm font-semibold">{hasFilters ? 'No messages match these filters.' : 'No messages yet.'}</p>
            <p className="mt-1 text-gray-500 text-xs">{hasFilters ? 'Try another search or clear the filters.' : 'Messages sent from the website’s Contact Us form will appear here.'}</p>
          </div>
        ) : (
          <ul className={`divide-y divide-gray-800/60 transition-opacity ${loading ? 'opacity-60' : ''}`}>
            {messages.map((message) => {
              const busy = busyId === message.id;
              return (
                <li key={message.id} className={`flex items-start gap-3 p-4 hover:bg-gray-800/30 transition ${message.is_read ? '' : 'bg-[#ff7a00]/[0.04]'}`}>
                  <span className={`mt-2 w-2 h-2 rounded-full shrink-0 ${message.is_read ? 'bg-transparent' : 'bg-[#ff7a00]'}`} aria-hidden="true" />
                  <Link to={`/admin/messages/${message.id}`} state={{ from: location.search }} className="flex-1 min-w-0 group">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <bdi className={`truncate ${message.is_read ? 'text-gray-300 font-medium' : 'text-white font-bold'}`}>{message.name}</bdi>
                      <span className="text-xs text-gray-500 truncate">{message.email}</span>
                      {!message.is_read && <span className="sr-only">(unread)</span>}
                    </div>
                    {message.subject && <div className="mt-0.5 text-xs text-[#ff7a00]/90" dir="auto">{message.subject}</div>}
                    <p className="mt-1 text-sm text-gray-400 line-clamp-1 group-hover:text-gray-300" dir="auto">{message.message}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <time dateTime={message.created_at} className="text-xs text-gray-500">{formatMessageDate(message.created_at)}</time>
                      {message.status === 'replied' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-500/10 text-green-400 border border-green-500/20"><FiCornerUpLeft size={11} aria-hidden="true" />Replied</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Awaiting reply</span>
                      )}
                      {message.notification_status === 'failed' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20"><FiAlertTriangle size={11} aria-hidden="true" />Email not sent</span>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={`mailto:${message.email}`} title="Reply by email" aria-label={`Reply to ${message.name} by email`} className={`${actionClass} text-blue-400 hidden sm:inline-flex`}>
                      <FiMail size={16} />
                    </a>
                    <button onClick={() => toggleRead(message)} disabled={busy} title={message.is_read ? 'Mark as unread' : 'Mark as read'} aria-label={message.is_read ? 'Mark as unread' : 'Mark as read'} className={`${actionClass} text-gray-300`}>
                      {message.is_read ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                    <button onClick={() => handleDelete(message)} disabled={busy} title="Delete" aria-label={`Delete the message from ${message.name}`} className={`${actionClass} text-red-400`}>
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {meta && meta.total > 0 && !loadError && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-800 text-xs text-gray-400">
            <span>Showing {from}–{to} of {meta.total}</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setFilters({ page: String(page - 1) })} disabled={page <= 1 || loading} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-800 hover:bg-gray-800 disabled:opacity-40 cursor-pointer disabled:cursor-default">
                <FiChevronLeft size={14} aria-hidden="true" />Previous
              </button>
              <span className="tabular-nums">Page {meta.current_page} of {meta.last_page}</span>
              <button type="button" onClick={() => setFilters({ page: String(page + 1) })} disabled={page >= meta.last_page || loading} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-800 hover:bg-gray-800 disabled:opacity-40 cursor-pointer disabled:cursor-default">
                Next<FiChevronRight size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactMessagesAdmin;
