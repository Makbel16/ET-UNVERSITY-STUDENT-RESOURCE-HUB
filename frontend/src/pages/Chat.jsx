import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { sender: 'user', text: message.trim() };
    const conversation = [...history, userMessage];

    setMessage('');
    setHistory(conversation);
    setLoading(true);

    try {
      const { data } = await API.post('/ai/chat', {
        message: userMessage.text,
        history: conversation,
      });
      setHistory((prev) => [...prev, { sender: 'assistant', text: data.reply }]);
    } catch (err) {
      console.error('AI chat error:', err);
      setHistory((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Sorry, the AI assistant is unavailable right now. Please try again later.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            AI Study Assistant
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Ask questions about your course materials, request study tips, or get guidance on how to prepare for exams.
            The study assistant is powered by EthioStudyHub's AI learning engine.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
            <MessageCircle className="h-4.5 w-4.5 text-blue-600" />
            Quick Tips
          </div>
          <ul className="mt-2 space-y-2 list-disc pl-4 text-[11px] leading-5">
            <li>Ask study-specific questions: e.g. "Explain relational database normalization."</li>
            <li>Request exam prep tips for a course or semester.</li>
            <li>Use the generated answer to navigate resources and improve notes.</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Live Chat</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your study companion for course concepts, past papers, and exam strategies.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              {loading ? 'Waiting for AI...' : 'Ready to chat'}
            </div>
          </div>

          <div className="min-h-[420px] overflow-y-auto rounded-3xl border border-slate-100 bg-slate-50 p-5 text-sm shadow-inner dark:border-slate-800 dark:bg-slate-900">
            {history.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400">
                <p className="font-semibold">Ask a question to get started.</p>
                <p className="mt-2 text-xs">Example: "What are the most important topics for a first-year programming exam?"</p>
              </div>
            ) : (
              history.map((item, idx) => (
                <div key={`${item.sender}-${idx}`} className={`mb-4 flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 ${item.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'}`}>
                    <div className="font-semibold text-xs uppercase tracking-[0.2em] mb-1">
                      {item.sender === 'user' ? 'You' : 'Study Assistant'}
                    </div>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="mt-4 flex gap-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your study question here..."
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
