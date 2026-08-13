import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, ArrowLeft, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Chat() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        
        // Get user info
        const userRes = await axios.get('http://localhost:8005/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(userRes.data);

        // Fetch messages
        const msgRes = await axios.get(`http://localhost:8005/messages/${matchId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(msgRes.data);
      } catch (error) {
        console.error("Failed to load chat", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndMessages();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.get(`http://localhost:8005/messages/${matchId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
          setMessages(res.data);
        }).catch(() => {});
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [matchId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:8005/messages/', 
        { match_id: matchId, content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader className="animate-spin text-blue-400" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 h-[calc(100vh-4rem)] flex flex-col">
      {/* Chat Header */}
      <div className="bg-white/5 backdrop-blur-md rounded-t-3xl border border-white/10 border-b-0 p-4 flex items-center shadow-sm z-10">
        <button 
          onClick={() => navigate('/matches')}
          className="p-2 mr-4 text-gray-400 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Chat with Match #{matchId}</h2>
          <p className="text-sm text-green-400 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-white/5 backdrop-blur-sm border-x border-white/10 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <p className="text-lg font-medium">No messages yet!</p>
            <p className="text-sm">Send a message to break the ice 🧊</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === currentUser?.id;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={index} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[75%] px-5 py-3 rounded-2xl ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-br-sm shadow-md shadow-blue-600/20' 
                      : 'bg-white/10 text-white rounded-bl-sm border border-white/10 shadow-sm backdrop-blur-md'
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                  <span className={`text-[10px] block mt-1 font-medium ${isMe ? 'text-blue-200 text-right' : 'text-gray-400 text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white/5 backdrop-blur-md rounded-b-3xl border border-white/10 p-4 shadow-sm">
        <form onSubmit={handleSendMessage} className="flex gap-2 relative">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border-2 border-white/10 bg-white/5 text-white placeholder-gray-500 rounded-2xl py-3 px-5 pr-14 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-colors"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-gray-500 text-white rounded-xl flex items-center justify-center transition-all shadow-sm disabled:shadow-none"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
