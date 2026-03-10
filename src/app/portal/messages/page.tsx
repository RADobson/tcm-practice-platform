'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { format, isToday, isYesterday } from 'date-fns';
import toast from 'react-hot-toast';
import type { Message } from '@/lib/types';

export default function PortalMessages() {
  const { profile } = useAppStore();
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [patientId, setPatientId] = useState<string | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [practitionerName, setPractitionerName] = useState('Your Practitioner');

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!profile) return;
    loadMessages();
  }, [profile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Set up realtime subscription
  useEffect(() => {
    if (!patientId) return;

    const channel = supabase
      .channel('portal-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // Mark as read if from practitioner
          if (newMsg.sender_id !== profile?.id) {
            markAsRead(newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId, profile?.id]);

  async function loadMessages() {
    if (!profile) return;

    try {
      const { data: patient } = await supabase
        .from('patients')
        .select('id, practice_id')
        .eq('user_id', profile.id)
        .single();

      if (!patient) {
        setLoading(false);
        return;
      }

      setPatientId(patient.id);
      setPracticeId(patient.practice_id);

      // Get practice owner (practitioner) name
      const { data: practice } = await supabase
        .from('practices')
        .select('owner_id')
        .eq('id', patient.practice_id)
        .single();

      if (practice) {
        const { data: practProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', practice.owner_id)
          .single();

        if (practProfile) {
          setPractitionerName(practProfile.full_name);
        }
      }

      // Load messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: true });

      setMessages(msgs || []);

      // Mark unread messages as read
      if (msgs && msgs.length > 0) {
        const unreadIds = msgs
          .filter((m) => !m.is_read && m.sender_id !== profile.id)
          .map((m) => m.id);

        if (unreadIds.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadIds);
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(messageId: string) {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
    } catch {
      // Silent fail for read receipts
    }
  }

  async function handleSend() {
    if (!newMessage.trim() || !patientId || !practiceId || !profile) return;

    setSending(true);
    try {
      const payload = {
        practice_id: practiceId,
        patient_id: patientId,
        sender_id: profile.id,
        content: newMessage.trim(),
        message_type: 'text' as const,
        is_read: false,
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      // Add to local state immediately (realtime will also fire but we deduplicate)
      if (data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }

      setNewMessage('');
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function formatMessageDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return `Yesterday ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  }

  function getDateSeparator(dateStr: string): string {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d, yyyy');
  }

  // Group messages by date
  function getDateGroups(): { date: string; messages: Message[] }[] {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    messages.forEach((msg) => {
      const dateKey = format(new Date(msg.created_at), 'yyyy-MM-dd');
      if (dateKey !== currentDate) {
        currentDate = dateKey;
        groups.push({ date: msg.created_at, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-earth-300/30 border-t-earth-300 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Loading messages...</span>
        </div>
      </div>
    );
  }

  const dateGroups = getDateGroups();

  return (
    <div className="flex flex-col -mx-4 -my-6" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-dark-50 bg-dark-500/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-earth-300/20 flex items-center justify-center">
            <span className="text-earth-300 text-sm font-semibold">
              {practitionerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{practitionerName}</p>
            <p className="text-xs text-gray-500">Your Practitioner</p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-12 h-12 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <p className="text-gray-400 text-sm">No messages yet.</p>
            <p className="text-gray-500 text-xs mt-1">
              Send a message to start a conversation with your practitioner.
            </p>
          </div>
        ) : (
          dateGroups.map((group, gi) => (
            <div key={gi}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-dark-50" />
                <span className="text-xs text-gray-600 font-medium">
                  {getDateSeparator(group.date)}
                </span>
                <div className="flex-1 h-px bg-dark-50" />
              </div>

              {/* Messages in this group */}
              <div className="space-y-2">
                {group.messages.map((msg) => {
                  const isMine = msg.sender_id === profile?.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          isMine
                            ? 'bg-earth-300/20 text-white rounded-br-md'
                            : 'bg-dark-300 text-gray-200 rounded-bl-md'
                        }`}
                      >
                        {msg.message_type === 'system' ? (
                          <p className="text-xs text-gray-500 italic">{msg.content}</p>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        )}
                        <div className={`flex items-center gap-1.5 mt-1 ${isMine ? 'justify-end' : ''}`}>
                          <span className="text-[10px] text-gray-600">
                            {formatMessageDate(msg.created_at)}
                          </span>
                          {isMine && (
                            <span className="text-[10px]">
                              {msg.is_read ? (
                                <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-dark-50 bg-dark-500/50 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-dark-300 border border-dark-50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-earth-300/50 resize-none max-h-32"
            style={{ minHeight: '42px' }}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-earth-300 hover:bg-earth-400 text-dark-700 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-dark-700/30 border-t-dark-700 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[10px] text-gray-600 mt-1.5 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
