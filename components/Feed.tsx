import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { backend } from '../services/backend';
import { Icon } from './Icons';
import { useAuth } from '../context/AuthContext';

const FeedCard: React.FC<{ post: Post }> = ({ post }) => {
    return (
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100/50 overflow-hidden hover:shadow-md transition-shadow mb-6">
            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <img className="h-10 w-10 rounded-full bg-gray-100 object-cover border border-gray-100" src={post.avatar} alt="" />
                            {post.isPremium && (
                                <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5 border-2 border-white">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 leading-none">{post.user}</h3>
                            <p className="text-xs text-gray-500 mt-1 font-medium">{post.time}</p>
                        </div>
                    </div>
                    <button className="text-gray-400 hover:bg-gray-50 p-1.5 rounded-full transition-colors">
                        <Icon name="dots" className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {post.content}
                </div>
                
                {post.image && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-gray-100">
                        <img src={post.image} className="w-full object-cover max-h-[400px]" alt="Post" />
                    </div>
                )}
            </div>
            
            {/* Actions */}
            <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                 <div className="flex gap-4">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors group">
                        <div className="p-1.5 rounded-full group-hover:bg-red-50 transition-colors">
                            <Icon name="home" className="w-5 h-5 rotate-45" /> 
                        </div>
                        <span className="text-xs font-bold">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors group">
                        <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors">
                            <span className="text-lg leading-none">💬</span>
                        </div>
                        <span className="text-xs font-bold">{post.comments}</span>
                    </button>
                 </div>
                 <button className="text-gray-400 hover:text-emerald-600 transition-colors">
                     <Icon name="bookmark" className="w-5 h-5" />
                 </button>
            </div>
        </div>
    );
};

export const Feed: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [content, setContent] = useState('');

    const fetchPosts = async () => {
        const data = await backend.getPosts();
        setPosts(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handlePost = async () => {
        if (!content.trim() || !user) return;
        const res = await backend.createPost({
            userId: user.id,
            user: user.username,
            avatar: user.avatar,
            content: content,
            isPremium: user.isPremium
        });
        if (res.success) {
            setContent('');
            fetchPosts();
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Create Post Input */}
            <div className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex items-center gap-4 mb-8">
                <div className="h-10 w-10 rounded-full bg-pink-100 overflow-hidden shrink-0 border border-gray-100">
                    <img src={user ? user.avatar : "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"} alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex items-center gap-2">
                    <input 
                        className="w-full bg-gray-50 hover:bg-gray-100 transition-colors rounded-full px-5 py-2.5 text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:bg-white"
                        placeholder={user ? `Login to ask a question...` : "Login to ask a question..."}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={!user}
                    />
                    <button 
                        onClick={handlePost} 
                        disabled={!content.trim()}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                        <Icon name="plus" className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map(post => <FeedCard key={post.id} post={post} />)}
                </div>
            )}
        </div>
    );
};