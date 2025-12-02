
import { User, Post, NewsItem, Question, Comment, ApiResponse, AITrainingData } from '../types';

const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    userId: 'admin',
    user: "Sakib Ahmed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sakib",
    time: "2 hrs ago",
    content: "Physics vector math problem help needed!",
    image: "https://picsum.photos/500/300",
    likes: 12,
    likedBy: [],
    comments: 5,
    isPremium: false
  },
  {
    id: 99,
    userId: 'system',
    user: "Momin English Official",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=System",
    time: "1 hr ago",
    content: "📢 Important Update: HSC-24 Special Suggestion (Physics 1st Paper) is now available for everyone! Check the Study Materials section.",
    likes: 999,
    likedBy: [],
    comments: 0,
    isPremium: false,
    isLocked: false
  }
];

const INITIAL_NEWS: NewsItem[] = [
  { id: 1, title: "HSC 24", content: "Physics 1st Paper exam postponed due to rain." },
  { id: 2, title: "Admission", content: "DU A Unit admission circular published." },
];

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 1,
    content: "বৃত্তাকার পথে চলমান একটি বস্তুর A, B, C এবং D বিন্দুতে বেগ vA, vB, vC ও vD বেগের মান সমান।",
    image: "https://picsum.photos/400/200", 
    answer: "Answer: A",
    explanation: "বেগের মান সমান হলেও দিক ভিন্ন হওয়ায় সুষম দ্রুতিতে চললেও এটি সমবেগ নয়।",
    tags: ["Physics", "Vector", "HSC"],
    section: "HSC",
    subject: "Physics",
    chapter: "Vector",
    topic: "Centripetal Force"
  },
  {
     id: 2,
     content: "একটি বস্তু স্থির অবস্থা থেকে যাত্রা শুরু করে 4s এ 16m দূরত্ব অতিক্রম করে। 8s এ বস্তুটি কত দূরত্ব অতিক্রম করবে?",
     image: null,
     answer: "64m",
     explanation: "s ∝ t^2. So, s2/s1 = (t2/t1)^2 => s2 = 16 * (8/4)^2 = 16 * 4 = 64m.",
     tags: ["Physics", "Dynamics", "Admission"],
     section: "Admission",
     exam: "Dhaka University",
     subject: "Physics",
     chapter: "Dynamics",
     topic: "Linear Motion"
  },
  {
    id: 3,
    content: "Which of the following sentences is correct? a) He is superior than me. b) He is superior to me.",
    image: null,
    answer: "b) He is superior to me.",
    explanation: "Latin adjectives like superior, inferior, senior, junior, anterior, posterior, etc., take 'to' instead of 'than'.",
    tags: ["English", "Grammar", "Correction"],
    section: "Admission",
    exam: "Dhaka University",
    subject: "English",
    chapter: "Grammar",
    topic: "Prepositions"
  },
  {
    id: 4,
    content: "What is the synonym of 'Magnanimous'?",
    image: null,
    answer: "Generous",
    explanation: "Magnanimous means generous or forgiving, especially towards a rival or less powerful person.",
    tags: ["English", "Vocabulary", "Synonym"],
    section: "Admission",
    exam: "Medical",
    subject: "English",
    chapter: "Vocabulary",
    topic: "Synonyms"
  }
];

// Initial Training Data Example
const INITIAL_TRAINING: AITrainingData[] = [
    {
        id: 1,
        input: "Who is the instructor?",
        output: "The main instructor is Momin Sir, a specialist in English for Academic and Admission courses."
    },
    {
        id: 2,
        input: "What is the course fee?",
        output: "The fee for the HSC English full course is 2500 BDT."
    }
];

class MockBackendService {
  private latency = 400;

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem('aap_users')) {
      const adminUser: User = {
        id: 'admin_1',
        username: 'admin',
        password: '123', // Simple password for demo
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        isPremium: true,
        role: 'admin',
        savedPosts: [],
        roll: 'AAP00001',
        institution: 'Dhaka University',
        bio: 'Administrator of Momin English Platform'
      };
      localStorage.setItem('aap_users', JSON.stringify([adminUser]));
    }
    if (!localStorage.getItem('aap_posts')) localStorage.setItem('aap_posts', JSON.stringify(INITIAL_POSTS));
    if (!localStorage.getItem('aap_news')) localStorage.setItem('aap_news', JSON.stringify(INITIAL_NEWS));
    if (!localStorage.getItem('aap_questions')) localStorage.setItem('aap_questions', JSON.stringify(INITIAL_QUESTIONS));
    if (!localStorage.getItem('aap_comments')) localStorage.setItem('aap_comments', JSON.stringify([]));
    if (!localStorage.getItem('aap_ai_training')) localStorage.setItem('aap_ai_training', JSON.stringify(INITIAL_TRAINING));
  }

  private async delay() {
    return new Promise(resolve => setTimeout(resolve, this.latency));
  }

  // --- AUTH ---
  async login(username: string, password?: string): Promise<ApiResponse<User>> {
    await this.delay();
    const users: User[] = JSON.parse(localStorage.getItem('aap_users') || '[]');
    // Accept matching password or any password if not set (for old demo compatibility)
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      localStorage.setItem('aap_session', JSON.stringify(user));
      return { success: true, data: user };
    }
    return { success: false, error: "Invalid credentials (try admin/123)" };
  }

  async signup(username: string, password?: string): Promise<ApiResponse<User>> {
    await this.delay();
    const users: User[] = JSON.parse(localStorage.getItem('aap_users') || '[]');
    
    if (users.find(u => u.username === username)) {
        return { success: false, error: "Username already exists" };
    }

    // Generate specific Roll Number format "AAP" + Random 5 digits
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const roll = `AAP${randomNum}`;

    const newUser: User = {
        id: Date.now().toString(),
        username,
        password,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        isPremium: false,
        role: 'user',
        savedPosts: [],
        roll: roll,
        institution: 'Not set',
        bio: 'Student at Momin English'
    };

    users.push(newUser);
    localStorage.setItem('aap_users', JSON.stringify(users));
    localStorage.setItem('aap_session', JSON.stringify(newUser));
    
    return { success: true, data: newUser };
  }

  getCurrentUser(): User | null {
    const session = localStorage.getItem('aap_session');
    return session ? JSON.parse(session) : null;
  }

  async updateUser(userData: Partial<User>): Promise<ApiResponse<User>> {
      await this.delay();
      const users: User[] = JSON.parse(localStorage.getItem('aap_users') || '[]');
      const session = this.getCurrentUser();
      
      if (!session) return { success: false, error: "No active session" };

      const index = users.findIndex(u => u.id === session.id);
      if (index !== -1) {
          const updatedUser = { ...users[index], ...userData };
          users[index] = updatedUser;
          localStorage.setItem('aap_users', JSON.stringify(users));
          localStorage.setItem('aap_session', JSON.stringify(updatedUser));
          return { success: true, data: updatedUser };
      }
      return { success: false, error: "User not found" };
  }

  async logout(): Promise<void> {
    await this.delay();
    localStorage.removeItem('aap_session');
  }

  // --- POSTS ---
  async getPosts(): Promise<Post[]> {
    await this.delay();
    return JSON.parse(localStorage.getItem('aap_posts') || '[]');
  }

  async createPost(postData: Partial<Post>): Promise<ApiResponse<Post>> {
    await this.delay();
    const posts: Post[] = JSON.parse(localStorage.getItem('aap_posts') || '[]');
    const newPost: Post = {
        id: Date.now(),
        userId: postData.userId!,
        user: postData.user!,
        avatar: postData.avatar!,
        content: postData.content!,
        time: "Just now",
        likes: 0,
        likedBy: [],
        comments: 0,
        isPremium: !!postData.isPremium,
        image: postData.image
    };
    posts.unshift(newPost);
    localStorage.setItem('aap_posts', JSON.stringify(posts));
    return { success: true, data: newPost };
  }

  async deletePost(id: number): Promise<boolean> {
      await this.delay();
      const posts: Post[] = JSON.parse(localStorage.getItem('aap_posts') || '[]');
      const filtered = posts.filter(p => p.id !== id);
      localStorage.setItem('aap_posts', JSON.stringify(filtered));
      return true;
  }

  // --- NEWS (CMS) ---
  async getNews(): Promise<NewsItem[]> {
    await this.delay();
    return JSON.parse(localStorage.getItem('aap_news') || '[]');
  }

  async addNews(news: Omit<NewsItem, 'id'>): Promise<NewsItem> {
    await this.delay();
    const allNews: NewsItem[] = JSON.parse(localStorage.getItem('aap_news') || '[]');
    const newItem = { ...news, id: Date.now() };
    allNews.unshift(newItem);
    localStorage.setItem('aap_news', JSON.stringify(allNews));
    return newItem;
  }

  async deleteNews(id: number): Promise<void> {
    await this.delay();
    const allNews: NewsItem[] = JSON.parse(localStorage.getItem('aap_news') || '[]');
    const filtered = allNews.filter(n => n.id !== id);
    localStorage.setItem('aap_news', JSON.stringify(filtered));
  }

  // --- QUESTIONS (CMS) ---
  async getQuestions(): Promise<Question[]> {
    await this.delay();
    return JSON.parse(localStorage.getItem('aap_questions') || '[]');
  }

  async addQuestion(question: Omit<Question, 'id'>): Promise<Question> {
    await this.delay();
    const questions: Question[] = JSON.parse(localStorage.getItem('aap_questions') || '[]');
    const newItem = { ...question, id: Date.now() };
    questions.push(newItem);
    localStorage.setItem('aap_questions', JSON.stringify(questions));
    return newItem;
  }

  async deleteQuestion(id: number): Promise<void> {
    await this.delay();
    const questions: Question[] = JSON.parse(localStorage.getItem('aap_questions') || '[]');
    const filtered = questions.filter(q => q.id !== id);
    localStorage.setItem('aap_questions', JSON.stringify(filtered));
  }

  // --- AI TRAINING (CMS) ---
  async getAITrainingData(): Promise<AITrainingData[]> {
      await this.delay();
      return JSON.parse(localStorage.getItem('aap_ai_training') || '[]');
  }

  async addAITrainingExample(data: Omit<AITrainingData, 'id'>): Promise<AITrainingData> {
      await this.delay();
      const training: AITrainingData[] = JSON.parse(localStorage.getItem('aap_ai_training') || '[]');
      const newItem = { ...data, id: Date.now() };
      training.push(newItem);
      localStorage.setItem('aap_ai_training', JSON.stringify(training));
      return newItem;
  }

  async deleteAITrainingExample(id: number): Promise<void> {
      await this.delay();
      const training: AITrainingData[] = JSON.parse(localStorage.getItem('aap_ai_training') || '[]');
      const filtered = training.filter(t => t.id !== id);
      localStorage.setItem('aap_ai_training', JSON.stringify(filtered));
  }
}

export const backend = new MockBackendService();
