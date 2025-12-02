
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icon } from './Icons';

// --- My Profile Component ---
export const MyProfile: React.FC = () => {
    const { user } = useAuth();

    if (!user) return <div>Please login</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-32 relative">
                <div className="absolute -bottom-10 left-8">
                    <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white" alt="Profile" />
                </div>
            </div>
            
            <div className="pt-14 px-8 pb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                        <p className="text-emerald-600 font-medium">Roll: {user.roll || 'N/A'}</p>
                    </div>
                    {user.isPremium && (
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                            PREMIUM
                        </span>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Institution</label>
                        <p className="text-gray-800 font-medium">{user.institution || 'Not set'}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Bio</label>
                        <p className="text-gray-800">{user.bio || 'No bio available.'}</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-100">
                             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Role</label>
                             <p className="text-gray-800 capitalize">{user.role}</p>
                        </div>
                         <div className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-100">
                             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Joined</label>
                             <p className="text-gray-800">2024</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Update Profile Component ---
export const UpdateProfile: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [form, setForm] = useState({
        username: user?.username || '',
        institution: user?.institution || '',
        phone: user?.phone || '',
        bio: user?.bio || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMsg('');
        const success = await updateProfile(form);
        if (success) {
            setMsg('Profile updated successfully!');
        } else {
            setMsg('Failed to update profile.');
        }
        setIsLoading(false);
    };

    if (!user) return <div>Please login</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Icon name="pencil" className="w-6 h-6 text-emerald-600" />
                Update Profile
            </h2>

            {msg && (
                <div className={`p-3 rounded-lg text-sm font-medium mb-6 ${msg.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {msg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                    <input 
                        value={form.username}
                        onChange={e => setForm({...form, username: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Institution</label>
                        <input 
                            value={form.institution}
                            onChange={e => setForm({...form, institution: e.target.value})}
                            placeholder="e.g. Dhaka College"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Phone (Optional)</label>
                        <input 
                            value={form.phone}
                            onChange={e => setForm({...form, phone: e.target.value})}
                            placeholder="017..."
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Bio</label>
                    <textarea 
                        value={form.bio}
                        onChange={e => setForm({...form, bio: e.target.value})}
                        placeholder="Tell us about yourself..."
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-32 resize-none"
                    />
                </div>

                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-70"
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- My Courses Component ---
export const MyCourses: React.FC = () => {
    // Mock courses for display
    const courses = [
        { id: 1, title: 'HSC Physics 1st Paper - Full Course', progress: 45, nextLesson: 'Vector Calculus' },
        { id: 2, title: 'Admission English Masterclass', progress: 10, nextLesson: 'Prepositions' }
    ];

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Icon name="academicCap" className="w-6 h-6 text-emerald-600" />
                My Enrolled Courses
            </h2>

            {courses.map(course => (
                <div key={course.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 text-emerald-600">
                        <Icon name="book" className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg">{course.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">Next: {course.nextLesson}</p>
                        
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                        </div>
                        <p className="text-xs text-right mt-1 font-bold text-gray-600">{course.progress}% Complete</p>
                    </div>
                    <button className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-lg hover:bg-emerald-100">
                        Continue
                    </button>
                </div>
            ))}
            
            <div className="p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white text-center">
                <h3 className="text-xl font-bold mb-2">Want to learn more?</h3>
                <p className="mb-4 opacity-90">Explore our premium courses and boost your preparation.</p>
                <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50">Browse Courses</button>
            </div>
        </div>
    );
};
