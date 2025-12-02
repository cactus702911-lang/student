
import React, { useState, useEffect } from 'react';
import { backend } from '../services/backend';
import { NewsItem, Question, Post, AITrainingData } from '../types';
import { Icon } from './Icons';

export const CMSPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'news' | 'questions' | 'posts' | 'ai'>('news');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [aiData, setAiData] = useState<AITrainingData[]>([]);
  const [loading, setLoading] = useState(false);

  // Form States
  const [newsForm, setNewsForm] = useState({ title: '', content: '' });
  const [qForm, setQForm] = useState({ 
      content: '', 
      answer: '', 
      explanation: '', 
      tags: '', 
      image: '',
      section: '',
      exam: '',
      subject: '',
      chapter: '',
      topic: ''
  });
  const [aiForm, setAiForm] = useState({ input: '', output: '' });

  const fetchData = async () => {
    setLoading(true);
    const [n, q, p, a] = await Promise.all([
      backend.getNews(),
      backend.getQuestions(),
      backend.getPosts(),
      backend.getAITrainingData()
    ]);
    setNews(n);
    setQuestions(q);
    setPosts(p);
    setAiData(a);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers ---

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.content) return;
    await backend.addNews(newsForm);
    setNewsForm({ title: '', content: '' });
    fetchData();
  };

  const handleDeleteNews = async (id: number) => {
    if (confirm('Delete this news?')) {
      await backend.deleteNews(id);
      fetchData();
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qForm.content || !qForm.answer) return;
    await backend.addQuestion({
      ...qForm,
      tags: qForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      image: qForm.image || undefined
    });
    setQForm({ content: '', answer: '', explanation: '', tags: '', image: '', section: '', exam: '', subject: '', chapter: '', topic: '' });
    fetchData();
  };

  const handleDeleteQuestion = async (id: number) => {
    if (confirm('Delete this question?')) {
      await backend.deleteQuestion(id);
      fetchData();
    }
  };

  const handleDeletePost = async (id: number) => {
      if (confirm('Delete this user post?')) {
          await backend.deletePost(id);
          fetchData();
      }
  }

  const handleAddTraining = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!aiForm.input || !aiForm.output) return;
      await backend.addAITrainingExample(aiForm);
      setAiForm({ input: '', output: '' });
      fetchData();
  }

  const handleDeleteTraining = async (id: number) => {
      if(confirm('Remove this training data?')) {
          await backend.deleteAITrainingExample(id);
          fetchData();
      }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Icon name="cog" className="w-6 h-6 text-emerald-600" />
            CMS Control Panel
        </h2>
        <div className="flex bg-white rounded-lg p-1 border border-gray-200">
            {['news', 'questions', 'posts', 'ai'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                        activeTab === tab ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    {tab === 'ai' ? 'AI Training' : tab}
                </button>
            ))}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
            <div className="text-center py-10">Loading CMS data...</div>
        ) : (
            <>
                {/* NEWS MANAGEMENT */}
                {activeTab === 'news' && (
                    <div className="space-y-6">
                        <form onSubmit={handleAddNews} className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid gap-4">
                            <h3 className="font-bold text-gray-700">Add New Ticker Item</h3>
                            <input 
                                placeholder="Title (e.g., Notice)" 
                                value={newsForm.title} 
                                onChange={e => setNewsForm({...newsForm, title: e.target.value})}
                                className="px-3 py-2 rounded-lg border border-gray-300 w-full"
                            />
                            <input 
                                placeholder="Content message..." 
                                value={newsForm.content} 
                                onChange={e => setNewsForm({...newsForm, content: e.target.value})}
                                className="px-3 py-2 rounded-lg border border-gray-300 w-full"
                            />
                            <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 w-fit">Add News</button>
                        </form>

                        <div className="space-y-2">
                            {news.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                    <div>
                                        <span className="font-bold text-emerald-600">[{item.title}]</span> {item.content}
                                    </div>
                                    <button onClick={() => handleDeleteNews(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                                        <Icon name="trash" className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* QUESTION MANAGEMENT */}
                {activeTab === 'questions' && (
                    <div className="space-y-6">
                        <form onSubmit={handleAddQuestion} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                            <h3 className="font-bold text-gray-700">Add Study Question</h3>
                            
                            {/* Categories Row 1 */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <input placeholder="Section (e.g. HSC)" className="px-3 py-2 border rounded-lg" value={qForm.section} onChange={e => setQForm({...qForm, section: e.target.value})} />
                                <input placeholder="Exam (e.g. BUET)" className="px-3 py-2 border rounded-lg" value={qForm.exam} onChange={e => setQForm({...qForm, exam: e.target.value})} />
                                <input placeholder="Subject (e.g. Physics)" className="px-3 py-2 border rounded-lg" value={qForm.subject} onChange={e => setQForm({...qForm, subject: e.target.value})} />
                                <input placeholder="Chapter (e.g. Vector)" className="px-3 py-2 border rounded-lg" value={qForm.chapter} onChange={e => setQForm({...qForm, chapter: e.target.value})} />
                            </div>
                            
                            {/* Categories Row 2 */}
                             <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                                <input placeholder="Topic (e.g. River Boat)" className="px-3 py-2 border rounded-lg" value={qForm.topic} onChange={e => setQForm({...qForm, topic: e.target.value})} />
                                <input placeholder="Tags (comma separated)" className="px-3 py-2 border rounded-lg" value={qForm.tags} onChange={e => setQForm({...qForm, tags: e.target.value})} />
                            </div>

                            <textarea 
                                placeholder="Question Content..." 
                                value={qForm.content} 
                                onChange={e => setQForm({...qForm, content: e.target.value})}
                                className="px-3 py-2 rounded-lg border border-gray-300 w-full h-24"
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input 
                                    placeholder="Answer (e.g., Option A)" 
                                    value={qForm.answer} 
                                    onChange={e => setQForm({...qForm, answer: e.target.value})}
                                    className="px-3 py-2 rounded-lg border border-gray-300 w-full"
                                />
                                <input 
                                    placeholder="Image URL (Optional)" 
                                    value={qForm.image} 
                                    onChange={e => setQForm({...qForm, image: e.target.value})}
                                    className="px-3 py-2 rounded-lg border border-gray-300 w-full"
                                />
                            </div>
                            
                            <textarea 
                                placeholder="Explanation..." 
                                value={qForm.explanation} 
                                onChange={e => setQForm({...qForm, explanation: e.target.value})}
                                className="px-3 py-2 rounded-lg border border-gray-300 w-full h-20"
                            />
                            
                            <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 w-fit">Add Question</button>
                        </form>

                        <div className="space-y-4">
                            {questions.map(q => (
                                <div key={q.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex gap-2 mb-2">
                                                {q.section && <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{q.section}</span>}
                                                {q.subject && <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">{q.subject}</span>}
                                            </div>
                                            <p className="font-medium text-gray-800">{q.content}</p>
                                            <div className="mt-2 text-sm text-gray-500">
                                                <span className="font-bold text-emerald-600">Ans:</span> {q.answer}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {q.tags.map(t => <span key={t} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{t}</span>)}
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                                            <Icon name="trash" className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* POSTS MANAGEMENT */}
                {activeTab === 'posts' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">Moderate User Posts</h3>
                            <span className="text-sm text-gray-500">Total: {posts.length}</span>
                        </div>
                        {posts.map(post => (
                            <div key={post.id} className="flex gap-4 p-4 bg-white border border-gray-200 rounded-lg">
                                <img src={post.avatar} className="w-10 h-10 rounded-full bg-gray-100" />
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h4 className="font-bold text-sm">{post.user}</h4>
                                        <button onClick={() => handleDeletePost(post.id)} className="text-red-500 text-xs hover:underline">Delete</button>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.content}</p>
                                    <div className="text-xs text-gray-400 mt-2">
                                        ID: {post.id} • Likes: {post.likes}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* AI TRAINING MANAGEMENT */}
                {activeTab === 'ai' && (
                    <div className="space-y-6">
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-sm text-emerald-800">
                            <strong>Training Mode:</strong> Data added here will be used as the <u>exclusive</u> source of truth for the AI Tutor. The AI will be instructed to ONLY answer based on this information.
                        </div>

                        <form onSubmit={handleAddTraining} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                            <h3 className="font-bold text-gray-700">Add Knowledge Snippet</h3>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">User Question / Topic (Input)</label>
                                <input 
                                    placeholder="e.g., What is the course duration?" 
                                    value={aiForm.input} 
                                    onChange={e => setAiForm({...aiForm, input: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">AI Answer / Information (Output)</label>
                                <textarea 
                                    placeholder="e.g., The course duration is 6 months." 
                                    value={aiForm.output} 
                                    onChange={e => setAiForm({...aiForm, output: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 h-24"
                                />
                            </div>

                            <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 w-fit">Add Training Data</button>
                        </form>

                        <div className="space-y-3">
                            {aiData.map(item => (
                                <div key={item.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-800 mb-1">Q: {item.input}</p>
                                        <p className="text-gray-600 text-sm">A: {item.output}</p>
                                    </div>
                                    <button onClick={() => handleDeleteTraining(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                                        <Icon name="trash" className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};
