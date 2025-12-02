import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { backend } from '../services/backend';
import { Icon } from './Icons';

// Predefined Options for Dropdowns
const SECTIONS = ['HSC', 'Admission', 'SSC'];
const EXAMS = ['BUET', 'Medical', 'Dhaka University', 'Engineering'];
const SUBJECTS = ['Physics', 'Chemistry', 'Math', 'Biology', 'English'];
const CHAPTERS = ['Vector', 'Dynamics', 'Organic Chemistry', 'Integration'];
const TOPICS = ['River Boat', 'Rain Man', 'Circuit', 'Calculus', 'Centripetal Force', 'Linear Motion'];

export const StudyMaterials: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    
    // Filter States
    const [filterSection, setFilterSection] = useState('');
    const [filterExam, setFilterExam] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterChapter, setFilterChapter] = useState('');
    const [filterTopic, setFilterTopic] = useState('');
    const [searchText, setSearchText] = useState('');
    
    // Toggle States
    const [showAns, setShowAns] = useState(false);
    const [showExpl, setShowExpl] = useState(false);
    
    useEffect(() => {
        backend.getQuestions().then(setQuestions);
    }, []);

    // Filter Logic
    const filteredQuestions = questions.filter(q => {
        if (filterSection && q.section !== filterSection) return false;
        if (filterExam && q.exam !== filterExam) return false;
        if (filterSubject && q.subject !== filterSubject) return false;
        if (filterChapter && q.chapter !== filterChapter) return false;
        if (filterTopic && q.topic !== filterTopic) return false;
        if (searchText && !q.content.toLowerCase().includes(searchText.toLowerCase())) return false;
        return true;
    });

    const resetFilters = () => {
        setFilterSection('');
        setFilterExam('');
        setFilterSubject('');
        setFilterChapter('');
        setFilterTopic('');
        setSearchText('');
    };

    return (
        <div className="space-y-6">
            
            {/* Filter Container */}
            <div className="bg-slate-100 p-6 rounded-2xl shadow-sm border border-slate-200">
                {/* Row 1: Section & Exam */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <select 
                        value={filterSection} 
                        onChange={e => setFilterSection(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        <option value="">সেকশন (Section)</option>
                        {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select 
                        value={filterExam} 
                        onChange={e => setFilterExam(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        <option value="">ভর্তি পরীক্ষা (Exam)</option>
                        {EXAMS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* Row 2: Subject, Chapter, Topic */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <select 
                        value={filterSubject} 
                        onChange={e => setFilterSubject(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        <option value="">বিষয় (Subject)</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    
                    <select 
                        value={filterChapter} 
                        onChange={e => setFilterChapter(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        <option value="">অধ্যায় (Chapter)</option>
                        {CHAPTERS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    
                    <select 
                        value={filterTopic} 
                        onChange={e => setFilterTopic(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        <option value="">টপিক (Topic)</option>
                        {TOPICS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* Row 3: Actions & Search */}
                <div className="flex flex-col md:flex-row items-center gap-4 justify-between border-t border-gray-300 pt-4">
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <button onClick={resetFilters} className="flex items-center gap-1 text-gray-600 hover:text-red-500 text-sm font-medium transition-colors">
                            <Icon name="refresh" className="w-4 h-4" /> মুছে ফেলুন (Reset)
                        </button>
                        
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" 
                                checked={showAns}
                                onChange={e => setShowAns(e.target.checked)}
                            />
                            উত্তর (Ans)
                        </label>
                        
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" 
                                checked={showExpl}
                                onChange={e => setShowExpl(e.target.checked)}
                            />
                            ব্যাখ্যা (Exp)
                        </label>
                    </div>

                    <div className="relative w-full md:w-64">
                        <input 
                            type="text" 
                            placeholder="প্রশ্ন খুঁজুন..." 
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                            <Icon name="search" className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            {filteredQuestions.map(q => (
                <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap gap-2 mb-3">
                         {q.subject && <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider bg-gray-100 px-2 py-1 rounded">{q.subject}</span>}
                         {q.chapter && <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider bg-emerald-50 px-2 py-1 rounded">{q.chapter}</span>}
                    </div>
                    
                    <p className="text-lg font-medium text-gray-800 mb-4 font-serif leading-relaxed">{q.content}</p>
                    
                    {q.image && (
                         <div className="mb-4 bg-gray-50 p-2 rounded border border-gray-100 inline-block">
                            <img src={q.image} alt="Diagram" className="max-h-60 rounded" />
                         </div>
                    )}
                    
                    {showAns && (
                        <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100 animate-fade-in">
                            <p className="font-bold text-green-800 mb-1">{q.answer}</p>
                        </div>
                    )}

                    {showExpl && (
                        <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-100 animate-fade-in">
                            <p className="font-bold text-blue-800 text-xs uppercase mb-1">Explanation</p>
                            <p className="text-sm text-blue-800 leading-relaxed">{q.explanation}</p>
                        </div>
                    )}

                    <div className="mt-4 flex gap-2">
                        {q.tags.map(t => <span key={t} className="text-xs bg-gray-100 border border-gray-200 px-2 py-1 rounded font-medium text-gray-500">#{t}</span>)}
                    </div>
                </div>
            ))}
            
            {filteredQuestions.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                         <Icon name="search" className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No questions found matching your filters.</p>
                    <button onClick={resetFilters} className="mt-2 text-emerald-600 font-bold text-sm hover:underline">Clear Filters</button>
                </div>
            )}
        </div>
    );
};