import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { api } from '../services/api.js';
import { Plus, Trash2, LogOut, RefreshCw, FileText, History, Zap, Copy } from 'lucide-react';

interface DashboardProps {
  onNavigate: (screen: string) => void;
  onSelectDraft: (id: string) => void;
  onSelectTemplate: (template: any) => void;
  showToast: (text: string, type: 'success' | 'warning' | 'error') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onSelectDraft,
  onSelectTemplate,
  showToast
}) => {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const draftsData = await api.getGigs();
      setDrafts(draftsData);
      
      const historyData = await api.getHistory();
      setHistory(historyData);
    } catch (err: any) {
      showToast('Error fetching data. Check connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteDraft = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this draft?')) return;
    try {
      await api.deleteGig(id);
      setDrafts(drafts.filter((d) => d._id !== id));
      showToast('Draft deleted successfully', 'success');
    } catch (err) {
      showToast('Failed to delete draft', 'error');
    }
  };

  // Quick Templates
  const templates = [
    {
      title: 'Full Stack Node/React',
      serviceType: 'Full Stack Development',
      rawDescription: 'I will build a high-performance full-stack web application using React/Next.js for the frontend and Node.js/Express for the backend. I integrate modern state management, database schema designs, secure authentication (JWT/OAuth), and deploy onto production servers.',
      technologies: ['React', 'Next.js', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'TypeScript'],
      targetBuyer: 'SaaS company',
      experienceLevel: 'Expert',
      pricingPreference: 'Competitive'
    },
    {
      title: 'AI Chatbot & RAG',
      serviceType: 'AI Development',
      rawDescription: 'I will build a custom AI chatbot integrated with LLMs (DeepSeek/OpenAI) using LangChain and RAG architectures. Includes vector databases like Pinecone/ChromaDB for semantic search, custom knowledge retrieval from documents, and a smooth UI interface.',
      technologies: ['Python', 'LangChain', 'Pinecone', 'OpenAI API', 'DeepSeek API', 'VectorDB', 'TypeScript'],
      targetBuyer: 'Startup',
      experienceLevel: 'Advanced',
      pricingPreference: 'Premium'
    },
    {
      title: 'REST API Backend',
      serviceType: 'Backend Development',
      rawDescription: 'I will write production-grade RESTful APIs using Node.js, Express, and PostgreSQL/MongoDB. Includes JWT authentication, validation schemas, file storage, payment gateway integration, secure headers, caching with Redis, and Docker deployment config.',
      technologies: ['Node.js', 'Express.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker', 'JWT'],
      targetBuyer: 'Startup',
      experienceLevel: 'Expert',
      pricingPreference: 'Competitive'
    }
  ];

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-tr from-sky-400 to-sky-600 rounded-lg flex items-center justify-center shadow-md shadow-sky-100">
            <span className="text-[10px] font-bold text-white">GC</span>
          </div>
          <span className="text-xs font-bold text-slate-800">GigCraft AI</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-medium text-slate-500">Hi, {user?.name.split(' ')[0]}</span>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Scrollable */}
      <main className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Top Section Stats / Actions */}
        <div className="grid grid-cols-2 gap-3.5">
          <button
            onClick={() => onNavigate('wizard')}
            className="flex flex-col items-center justify-center p-4 bg-gradient-to-tr from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-2xl shadow-md shadow-sky-100 transition group"
          >
            <Plus className="w-6 h-6 mb-1.5 group-hover:rotate-90 transition duration-200" />
            <span className="text-xs font-bold">Create New Gig</span>
            <span className="text-[9px] opacity-80 mt-0.5">Let AI build your offer</span>
          </button>

          <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">My Drafts</span>
              <FileText className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-black text-slate-800">{drafts.length}</span>
              <span className="text-[10px] text-slate-400">saved drafts</span>
            </div>
            <button
              onClick={fetchData}
              className="text-[9px] font-medium text-sky-500 hover:text-sky-600 flex items-center gap-1 mt-1 transition"
            >
              <RefreshCw className="w-2.5 h-2.5" /> Refresh Dashboard
            </button>
          </div>
        </div>

        {/* Quick Templates */}
        <div>
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Quick Templates
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            {templates.map((tpl, i) => (
              <button
                key={i}
                onClick={() => onSelectTemplate(tpl)}
                className="bg-white border border-slate-100 hover:border-sky-200 hover:bg-sky-50/20 p-2.5 rounded-xl text-left shadow-sm transition flex flex-col justify-between min-h-[75px]"
              >
                <span className="text-[10px] font-bold text-slate-700 leading-snug">{tpl.title}</span>
                <span className="text-[8px] text-slate-400 block mt-1">{tpl.serviceType}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Drafts List */}
        <div>
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Recent Drafts</h2>
          {isLoading ? (
            <div className="bg-white border border-slate-100 rounded-xl p-4 text-center text-xs text-slate-400">
              Loading drafts...
            </div>
          ) : drafts.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-xl p-6 text-center shadow-sm">
              <FileText className="w-6 h-6 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-500">No gig drafts yet</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Click "Create New Gig" to get started</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {drafts.slice(0, 4).map((draft) => (
                <div
                  key={draft._id}
                  onClick={() => {
                    if (draft.status === 'completed' && draft.generatedContent) {
                      onSelectDraft(draft._id);
                      onNavigate('results');
                    } else {
                      onSelectDraft(draft._id);
                      onNavigate('wizard'); // Resume wizard
                    }
                  }}
                  className="bg-white border border-slate-100 hover:border-slate-200 p-3 rounded-xl flex items-center justify-between shadow-sm cursor-pointer transition group"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 truncate">
                        {draft.generatedContent?.gigTitle || draft.serviceType}
                      </span>
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          draft.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}
                      >
                        {draft.status === 'completed' ? 'Ready' : 'Incomplete'}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-1.5 truncate">
                      Skills: {draft.technologies.join(', ')} • v{draft.version}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteDraft(draft._id, e)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History Audit Feed */}
        <div>
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-slate-400" /> Recent Runs History
          </h2>
          {isLoading ? (
            <div className="bg-white border border-slate-100 rounded-xl p-4 text-center text-xs text-slate-400">
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-xl p-4 text-center text-xs text-slate-400">
              No recent generations.
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-50 overflow-hidden">
              {history.slice(0, 3).map((item) => (
                <div key={item._id} className="p-3 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-700 block">
                      {item.generationType === 'full_generation' ? 'Full Gig Setup' : 'Section Update'}
                    </span>
                    <span className="text-[8px] text-slate-400 mt-1 block">
                      Model: {item.model} • {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-[8px] font-bold text-sky-500 bg-sky-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Success
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
