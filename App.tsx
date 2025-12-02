
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { backend } from './services/backend';
import { NewsItem } from './types';
import { Icon } from './components/Icons';
import { Feed } from './components/Feed';
import { StudyMaterials } from './components/Study';
import { CMSPanel } from './components/CMS';
import { AITutor } from './components/AITutor';
import { MyProfile, UpdateProfile, MyCourses } from './components/Profile';

// --- SUB-COMPONENTS ---

const NewsTicker = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    
    useEffect(() => {
        const load = async () => {
            const data = await backend.getNews();
            setNews(data);
        };
        load();
        const interval = setInterval(load, 5000);
        return () => clearInterval(interval);
    }, []);

    if (news.length === 0) return null;

    return (
        <div className="bg-[#064E3B] text-white py-2 overflow-hidden flex items-center relative z-50 shadow-md">
            <div className="bg-[#DC2626] text-white px-3 py-0.5 text-[11px] font-bold ml-4 rounded-sm uppercase tracking-wider z-10 shrink-0 shadow-sm">
                Live Updates
            </div>
            <div className="marquee-container flex-1 ml-4 overflow-hidden">
                 <div className="marquee-content whitespace-nowrap flex">
                     {news.map((n, i) => (
                         <span key={i} className="mx-6 text-sm flex items-center font-medium">
                             <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 animate-pulse"></span>
                             <span className="font-bold text-emerald-200 mr-2">[{n.title}]</span>
                             <span className="text-white/90">{n.content}</span>
                         </span>
                     ))}
                 </div>
            </div>
        </div>
    );
};

const RightSidebar = ({ onClose }: { onClose: () => void }) => {
    const [notices, setNotices] = useState<NewsItem[]>([]);
    
    useEffect(() => {
        backend.getNews().then(setNotices);
    }, []);

    return (
        <aside className="hidden xl:block w-80 shrink-0 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900 text-lg">Latest Notices</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                        title="Hide Notices"
                    >
                        <Icon name="cross" className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-6 relative">
                    {/* Vertical line connecting items */}
                    <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                    {notices.map((notice) => (
                        <div key={notice.id} className="relative pl-6 group cursor-pointer">
                            <div className="absolute left-0 top-1.5 w-3 h-3 bg-white border-2 border-emerald-500 rounded-full group-hover:bg-emerald-500 transition-colors z-10"></div>
                            <h4 className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
                                {notice.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                                {notice.content}
                            </p>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-6 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors uppercase tracking-wide">
                    View All Notices
                </button>
            </div>
        </aside>
    );
};

const Layout = () => {
    const { user, login, signup, logout, isAdmin } = useAuth();
    const [page, setPage] = useState<'feed' | 'study' | 'cms' | 'ai' | 'profile' | 'update-profile' | 'courses'>('feed');
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignupMode, setIsSignupMode] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // UI Visibility States
    const [showPremiumWidget, setShowPremiumWidget] = useState(true);
    const [showRightSidebar, setShowRightSidebar] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSignupMode) {
            const res = await signup(username, password);
            if (res.success) {
                setIsLoginOpen(false);
                setUsername('');
                setPassword('');
            } else {
                alert(res.error || 'Signup failed');
            }
        } else {
            const success = await login(username, password);
            if (success) {
                setIsLoginOpen(false);
                setUsername('');
                setPassword('');
            } else {
                alert('Invalid credentials (try admin/123)');
            }
        }
    };

    const toggleAuthMode = () => {
        setIsSignupMode(!isSignupMode);
        setUsername('');
        setPassword('');
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] pb-20 font-sans">
            <NewsTicker />
            
            <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-gray-100">
                <div className="max-w-[1440px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    {/* Left: Logo & Menu */}
                    <div className="flex items-center gap-4 min-w-fit">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Icon name="menu" className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('feed')}>
                             <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">M</div>
                             <div className="hidden md:block">
                                 <h1 className="font-bold text-gray-900 text-lg leading-none tracking-tight">Momin English</h1>
                                 <p className="text-[10px] text-[#059669] font-bold uppercase tracking-widest mt-0.5">Academic & Admission</p>
                             </div>
                        </div>
                    </div>

                    {/* Center: Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-auto">
                        <div className="relative w-full group">
                            <input 
                                type="text"
                                placeholder="Search for topics, questions..."
                                className="w-full bg-gray-50 border-0 text-sm text-gray-700 rounded-full py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all shadow-sm group-hover:shadow-md"
                            />
                            <div className="absolute left-3.5 top-2.5 text-gray-400">
                                <Icon name="search" className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4 min-w-fit">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
                            <Icon name="bell" className="w-6 h-6" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>

                        {user ? (
                            <div className="relative group">
                                <img src={user.avatar} className="w-9 h-9 rounded-full border border-gray-100 cursor-pointer object-cover" alt="Avatar" />
                                
                                {/* Dropdown Menu matching Screenshot */}
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:block overflow-hidden animate-fade-in z-50">
                                    {/* Header Section */}
                                    <div className="bg-[#0B1120] p-4 text-center border-b border-gray-800">
                                        <h3 className="text-white font-medium text-lg">Hi, {user.username}</h3>
                                        <p className="text-gray-300 text-sm font-light mt-0.5">Roll: {user.roll || 'N/A'}</p>
                                    </div>
                                    
                                    {/* Menu Items */}
                                    <div className="flex flex-col">
                                        <button 
                                            onClick={() => setPage('profile')} 
                                            className="w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 flex items-center transition-colors"
                                        >
                                            My Profile
                                        </button>
                                        <button 
                                            onClick={() => setPage('update-profile')}
                                            className="w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 flex items-center transition-colors"
                                        >
                                            Update Profile
                                        </button>
                                        <button 
                                            onClick={() => setPage('courses')}
                                            className="w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 flex items-center transition-colors"
                                        >
                                            My Courses
                                        </button>
                                        <button 
                                            onClick={() => logout()} 
                                            className="w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => { setIsLoginOpen(true); setIsSignupMode(false); }} 
                                className="bg-[#10B981] text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-[#059669] transition-all shadow-lg shadow-emerald-500/20"
                            >
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-[1440px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
                {/* Left Sidebar */}
                <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white lg:bg-transparent lg:static lg:block transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}>
                    <div className="lg:sticky lg:top-24 h-full overflow-y-auto lg:h-auto p-4 lg:p-0 space-y-8">
                        {/* Navigation */}
                        <nav className="space-y-1">
                            <button onClick={() => setPage('feed')} className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all ${page === 'feed' ? 'bg-[#ECFDF5] text-[#059669]' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}>
                                <Icon name="home" className={`w-5 h-5 mr-3 ${page === 'feed' ? 'text-[#059669]' : 'text-gray-400'}`} /> News Feed
                            </button>
                            <button onClick={() => setPage('study')} className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all ${page === 'study' ? 'bg-[#ECFDF5] text-[#059669]' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}>
                                <Icon name="book" className={`w-5 h-5 mr-3 ${page === 'study' ? 'text-[#059669]' : 'text-gray-400'}`} /> Study Materials
                            </button>
                            
                            <button onClick={() => setPage('ai')} className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all ${page === 'ai' ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-[#059669]' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}>
                                <Icon name="sparkles" className={`w-5 h-5 mr-3 ${page === 'ai' ? 'text-[#059669]' : 'text-gray-400'}`} /> AI Tutor
                                {page !== 'ai' && <span className="ml-auto text-[10px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-1.5 py-0.5 rounded font-bold">NEW</span>}
                            </button>

                            <button onClick={() => setPage('courses')} className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all ${page === 'courses' ? 'bg-[#ECFDF5] text-[#059669]' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}>
                                <Icon name="academicCapOutline" className={`w-5 h-5 mr-3 ${page === 'courses' ? 'text-[#059669]' : 'text-gray-400'}`} /> My Courses
                            </button>
                            
                            {isAdmin && (
                                <button onClick={() => setPage('cms')} className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all mt-6 ${page === 'cms' ? 'bg-purple-50 text-purple-700' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}>
                                    <Icon name="cog" className={`w-5 h-5 mr-3 ${page === 'cms' ? 'text-purple-700' : 'text-gray-400'}`} /> CMS Panel
                                </button>
                            )}
                        </nav>

                        {/* Premium Widget */}
                        {showPremiumWidget && !user?.isPremium && (
                            <div className="relative mx-1 p-5 bg-[#1E293B] rounded-2xl text-center overflow-hidden animate-fade-in shadow-lg shadow-gray-200">
                                <button 
                                    onClick={() => setShowPremiumWidget(false)}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors p-1"
                                    title="Dismiss"
                                >
                                    <Icon name="cross" className="w-3.5 h-3.5" />
                                </button>
                                
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                                    <Icon name="checkBadge" className="w-6 h-6 text-[#FBBF24]" />
                                </div>
                                
                                <h3 className="text-white font-bold text-base mb-1">Go Premium</h3>
                                <p className="text-gray-400 text-xs mb-4 leading-relaxed px-1">
                                    Unlock exclusive suggestions & remove ads.
                                </p>
                                
                                <button className="w-full py-2.5 bg-gradient-to-r from-[#FBBF24] to-[#D97706] text-black font-bold text-sm rounded-xl hover:shadow-lg hover:brightness-110 transition-all">
                                    Upgrade Now
                                </button>
                            </div>
                        )}

                        {/* Popular Tags */}
                        <div>
                            <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Popular Tags</h3>
                            <div className="flex flex-wrap gap-2 px-2">
                                {['#HSC24', '#Admission', '#Physics', '#Math', '#Biology'].map(tag => (
                                    <span key={tag} className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-xs font-semibold text-gray-600 hover:border-emerald-200 hover:text-emerald-600 cursor-pointer transition-colors shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
                )}

                {/* Main Content */}
                <main className="flex-1 min-w-0 transition-all duration-300">
                    {page === 'feed' && <Feed />}
                    {page === 'study' && <StudyMaterials />}
                    {page === 'ai' && <AITutor />}
                    {page === 'profile' && <MyProfile />}
                    {page === 'update-profile' && <UpdateProfile />}
                    {page === 'courses' && <MyCourses />}
                    {page === 'cms' && isAdmin && <CMSPanel />}
                    {page === 'cms' && !isAdmin && <div className="text-center text-red-500 p-10 bg-white rounded-2xl shadow-sm">Access Denied</div>}
                </main>

                {/* Right Sidebar */}
                {page === 'feed' && showRightSidebar && (
                    <RightSidebar onClose={() => setShowRightSidebar(false)} />
                )}
            </div>

            {/* Floating Action Button */}
            <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#10B981] text-white rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:bg-[#059669] hover:scale-105 transition-all z-50">
                <Icon name="plus" className="w-8 h-8" />
            </button>

            {/* Auth Modal */}
            {isLoginOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl relative transform transition-all scale-100">
                        <button onClick={() => setIsLoginOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-full">
                            <Icon name="cross" className="w-5 h-5" />
                        </button>
                        <div className="text-center mb-8">
                             <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                                 <Icon name="home" className="w-8 h-8" />
                             </div>
                             <h2 className="text-2xl font-bold text-gray-900">{isSignupMode ? 'Create Account' : 'Welcome Back'}</h2>
                             <p className="text-gray-500 text-sm mt-1">
                                 {isSignupMode ? 'Join our learning community today.' : 'Please enter your details to sign in.'}
                             </p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Username</label>
                                <input value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="username" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-sm font-medium" placeholder="••••••" />
                            </div>
                            <button type="submit" className="w-full bg-[#10B981] text-white font-bold py-3.5 rounded-xl hover:bg-[#059669] transition-all shadow-lg shadow-emerald-500/20 mt-2">
                                {isSignupMode ? 'Sign Up' : 'Login'}
                            </button>
                        </form>
                        <p className="mt-6 text-xs text-gray-400 text-center">
                            {isSignupMode ? 'Already have an account? ' : "Don't have an account? "}
                            <span onClick={toggleAuthMode} className="text-emerald-600 font-bold cursor-pointer hover:underline">
                                {isSignupMode ? 'Login' : 'Sign up'}
                            </span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <Layout />
        </AuthProvider>
    );
}
