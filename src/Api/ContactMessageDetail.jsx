import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiTrash2, FiEyeOff, FiCheckCircle, FiRotateCcw, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import axiosClient from './axiosClient';
import { getApiErrorMessage } from '../lib/apiError';
import { NOTIFICATION_LABELS, formatMessageDate } from '../lib/contactMessages';

const buttonClass = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer disabled:opacity-50';

// رسالة واحدة: GET /admin/contact-messages/{id}. فتحها يعلّمها مقروءة (PATCH is_read)
const ContactMessageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const listUrl = `/admin/messages${location.state?.from || ''}`;

  const [message, setMessage] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setMessage(null);
    setLoadError('');
    setNotFound(false);

    axiosClient.get(`/admin/contact-messages/${id}`)
      .then(async (response) => {
        if (cancelled) return;
        let loaded = response.data.data;
        setMessage(loaded);
        if (!loaded.is_read) {
          try {
            const marked = await axiosClient.patch(`/admin/contact-messages/${id}`, { is_read: true });
            loaded = marked.data.data;
            if (!cancelled) setMessage(loaded);
          } catch {
            // تبقى غير مقروءة؛ يمكن تعليمها يدوياً
          }
        }
      })
      .catch((error) => {
        if (cancelled) return;
        if (error.response?.status === 404) setNotFound(true);
        else setLoadError(getApiErrorMessage(error, 'Failed to load the message.'));
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const update = async (key, changes, successText) => {
    setBusy(key);
    setNotice(null);
    try {
      const response = await axiosClient.patch(`/admin/contact-messages/${id}`, changes);
      setMessage(response.data.data);
      setNotice({ type: 'success', text: successText });
      return true;
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Failed to update the message.') });
      return false;
    } finally {
      setBusy(null);
    }
  };

  const markUnread = async () => {
    if (await update('read', { is_read: false }, 'Marked as unread.')) navigate(listUrl);
  };

  const toggleReplied = () => (message.status === 'replied'
    ? update('status', { status: 'pending' }, 'Marked as awaiting reply.')
    : update('status', { status: 'replied' }, 'Marked as replied.'));

  // POST /admin/contact-messages/{id}/resend-notification
  const resendNotification = async () => {
    setBusy('resend');
    setNotice(null);
    try {
      const response = await axiosClient.post(`/admin/contact-messages/${id}/resend-notification`);
      setMessage(response.data.data);
      setNotice({ type: 'success', text: 'The notification email was queued again.' });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Failed to resend the notification.') });
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete the message from ${message.name}? This cannot be undone.`)) return;
    setBusy('delete');
    try {
      await axiosClient.delete(`/admin/contact-messages/${id}`);
      navigate(listUrl, { state: { flash: 'Message deleted.' } });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Failed to delete the message.') });
      setBusy(null);
    }
  };

  const backLink = (
    <Link to={listUrl} className="px-4 py-2.5 bg-[#161b22] border border-gray-800 text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-800 hover:text-white transition inline-flex items-center gap-2">
      <FiArrowLeft size={16} />
      <span>Back</span>
    </Link>
  );

  if (notFound || loadError) {
    return (
      <div className="p-8 min-h-screen bg-[#0d1117] text-center space-y-4" dir="ltr">
        <p role="alert" className="text-red-400 text-sm">{notFound ? 'This message no longer exists. It may have been deleted.' : loadError}</p>
        {backLink}
      </div>
    );
  }

  if (!message) {
    return <div className="p-8 text-center text-gray-400 min-h-screen bg-[#0d1117]" role="status">Loading message...</div>;
  }

  const replied = message.status === 'replied';
  const replySubject = encodeURIComponent(`Re: ${message.subject || 'Your message to Manara'}`);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen bg-[#0d1117] text-gray-100" dir="ltr">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-gray-800 pb-4">
        <div className="min-w-0">
          <span className="text-xs text-gray-400">Admin / Contact Messages /</span>
          <h1 className="text-xl font-bold text-white truncate" dir="auto">{message.subject || 'Contact message'}</h1>
        </div>
        {backLink}
      </div>

      {notice && (
        <div role="status" className={`p-4 mb-4 rounded-xl text-sm border ${notice.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/25' : 'bg-red-500/10 text-red-400 border-red-500/25'}`}>
          {notice.text}
        </div>
      )}

      <article className="bg-[#161b22] border border-gray-800 rounded-2xl overflow-hidden">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 p-6 border-b border-gray-800 text-sm">
          <div>
            <dt className="text-xs font-semibold text-gray-500 uppercase">From</dt>
            <dd className="mt-1 text-white font-semibold"><bdi>{message.name}</bdi></dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs font-semibold text-gray-500 uppercase">Email</dt>
            <dd className="mt-1 break-all"><a href={`mailto:${message.email}`} className="text-[#ff7a00] hover:underline">{message.email}</a></dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-gray-500 uppercase">Received</dt>
            <dd className="mt-1 text-gray-200"><time dateTime={message.created_at}>{formatMessageDate(message.created_at)}</time></dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-gray-500 uppercase">Language</dt>
            <dd className="mt-1 text-gray-200">{message.locale === 'en' ? 'English site' : 'Arabic site'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-gray-500 uppercase">Reply status</dt>
            <dd className="mt-1">
              {replied ? (
                <span className="text-green-400">Replied{message.replied_at ? ` · ${formatMessageDate(message.replied_at)}` : ''}</span>
              ) : (
                <span className="text-yellow-400">Awaiting reply</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-gray-500 uppercase">Email notification</dt>
            <dd className="mt-1 flex flex-wrap items-center gap-2">
              <span className={message.notification_status === 'failed' ? 'text-red-400 inline-flex items-center gap-1' : 'text-gray-200'}>
                {message.notification_status === 'failed' && <FiAlertTriangle size={14} aria-hidden="true" />}
                {NOTIFICATION_LABELS[message.notification_status] || message.notification_status}
              </span>
              {message.notification_status === 'failed' && (
                <button type="button" onClick={resendNotification} disabled={busy !== null} className="inline-flex items-center gap-1 text-xs font-semibold text-[#ff7a00] hover:underline cursor-pointer disabled:opacity-50">
                  <FiRefreshCw size={12} aria-hidden="true" />{busy === 'resend' ? 'Resending...' : 'Resend'}
                </button>
              )}
            </dd>
          </div>
        </dl>

        <div className="p-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase mb-3">Message</h2>
          <p className="text-gray-100 leading-7 whitespace-pre-wrap break-words" dir="auto">{message.message}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 p-6 border-t border-gray-800 bg-[#0d1117]/40">
          <a href={`mailto:${message.email}?subject=${replySubject}`} className={`${buttonClass} bg-[#ff7a00] text-white hover:bg-[#e06c00]`}>
            <FiMail size={16} />Reply by email
          </a>
          <button type="button" onClick={toggleReplied} disabled={busy !== null} className={`${buttonClass} border ${replied ? 'bg-[#161b22] border-gray-800 text-gray-300 hover:bg-gray-800' : 'bg-green-500/10 border-green-500/25 text-green-400 hover:bg-green-500/20'}`}>
            {replied ? <FiRotateCcw size={16} /> : <FiCheckCircle size={16} />}
            {busy === 'status' ? 'Saving...' : replied ? 'Mark as awaiting reply' : 'Mark as replied'}
          </button>
          <button type="button" onClick={markUnread} disabled={busy !== null} className={`${buttonClass} bg-[#161b22] border border-gray-800 text-gray-300 hover:bg-gray-800`}>
            <FiEyeOff size={16} />{busy === 'read' ? 'Saving...' : 'Mark as unread'}
          </button>
          <button type="button" onClick={handleDelete} disabled={busy !== null} className={`${buttonClass} sm:ml-auto bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20`}>
            <FiTrash2 size={16} />{busy === 'delete' ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </article>
    </div>
  );
};

export default ContactMessageDetail;
