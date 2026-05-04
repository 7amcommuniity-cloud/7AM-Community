/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { 
  Menu, 
  X, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Mail, 
  Instagram, 
  ArrowRight,
  Droplets,
  Users,
  Camera,
  Send,
  ExternalLink,
  Activity,
  Zap,
  Phone,
  Handshake,
  Globe,
  Star,
  Loader2
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const FloatingIcon = ({ icon: Icon, className = "", delay = 0 }) => (
  <motion.div
    animate={{ 
      y: [0, -15, 0],
      rotateZ: [0, 10, -10, 0],
      rotateY: [0, 20, 0]
    }}
    transition={{ 
      duration: 6, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay
    }}
    style={{ transformStyle: "preserve-3d" }}
    className={`p-4 bg-black border border-white/10 rounded-2xl shadow-[10px_10px_20px_rgba(0,0,0,0.5),5px_5px_0px_rgba(255,255,0,0.3)] pointer-events-none z-0 ${className}`}
  >
    <Icon size={28} className="text-brand-yellow" />
  </motion.div>
);

const ManifestoGraphic = () => {
  const words = ["RUN", "CONNECT", "RECHARGE"];
  return (
    <div className="relative h-[200px] sm:h-[300px] md:h-[400px] w-full flex items-center justify-center bg-zinc-900 overflow-hidden brutal-border px-4">
       <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
         <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ffff00 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
       </div>
       <div className="flex flex-col gap-3 sm:gap-6 text-center">
         {words.map((word, i) => (
           <motion.div
             key={word}
             initial={{ x: i % 2 === 0 ? -100 : 100, opacity: 0 }}
             whileInView={{ x: 0, opacity: 1 }}
             transition={{ 
               type: 'spring',
               stiffness: 100,
               delay: i * 0.15 
             }}
             className="relative text-4xl sm:text-6xl md:text-8xl font-momentum tracking-tighter italic"
             style={{ 
               WebkitTextStroke: "1px #ffff00",
               color: "transparent"
             }}
           >
             <motion.span
               animate={{ 
                 opacity: [0.5, 1, 0.5],
                 filter: [
                   "drop-shadow(0 0 0px rgba(255, 255, 0, 0))", 
                   "drop-shadow(0 0 15px rgba(255, 255, 0, 0.8))", 
                   "drop-shadow(0 0 0px rgba(255, 255, 0, 0))"
                 ],
                 textShadow: [
                   "0 0 5px rgba(255, 255, 0, 0)",
                   "0 0 25px rgba(255, 255, 0, 0.9)",
                   "0 0 5px rgba(255, 255, 0, 0)"
                 ]
               }}
               transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
             >
               {word}
             </motion.span>
           </motion.div>
         ))}
       </div>
       {/* Floating 3D accents around text */}
       <div className="absolute top-10 left-10 z-0 pointer-events-none"><Zap size={24} className="text-brand-yellow/20 animate-pulse" /></div>
       <div className="absolute bottom-10 right-10 z-0 pointer-events-none"><Activity size={24} className="text-brand-yellow/20 animate-pulse" /></div>
    </div>
  );
};

const StravaIcon = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116zM5.03 13h2.975L10.857 7.07l2.847 5.93h2.975L10.857 0 5.03 13z"/>
  </svg>
);

// --- Types ---
interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  time: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  tag: string;
}

// --- Data ---
const EVENTS: Event[] = [
  {
    id: '1',
    title: '7 AM X Kuti Coffee Run',
    date: 'May 10, 2026',
    location: 'The Kuti Project, Balewadi High Street',
    time: '7:15 AM',
    description: 'Our flagship morning session. Every pace, every story. Meet us for the miles, stay for the brew.',
    difficulty: 'Beginner'
  }
];

const PHOTOS = [
  "https://lh3.googleusercontent.com/d/1i-ObucK8vw5G7PgeFiWWWKLk5khKDyCj",
  "https://lh3.googleusercontent.com/d/1tIbM-yextF_rCuVxeZRMp0PdL1xHO5MF",
  "https://lh3.googleusercontent.com/d/1v4LniqTg2LUOnm8WfXGLrwFgM8_8JoY2",
  "https://lh3.googleusercontent.com/d/1seBd9eaBurP2eXL-Hy5O5Wboxyh9iCIU",
  "https://lh3.googleusercontent.com/d/1PuuL5SQgTkUKk_xNzA4U7KYE_yVT4QKs",
  "https://lh3.googleusercontent.com/d/1DjyEBN17WLCEI3i47VKCV3RDDgYaY7BJ"
];

const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: "Tips for your first 10K in Pune's weather",
    date: 'Oct 5, 2024',
    excerpt: "Pune's climate can be tricky. Here is how to stay hydrated and paced...",
    tag: 'Training'
  },
  {
    id: '2',
    title: "Why 7am is the magic hour",
    date: 'Sep 28, 2024',
    excerpt: "There's a reason we chose 7am. The air is fresh, the world is quiet...",
    tag: 'Community'
  }
];

// --- Components ---

const Sidebar = ({ isOpen, onClose, navItems }: { isOpen: boolean, onClose: () => void, navItems: { label: string, id: string }[] }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-black border-l border-brand-yellow/20 z-[110] p-12 flex flex-col"
        >
          <button 
            onClick={onClose}
            className="self-end bg-brand-yellow text-black p-4 rotate-45 hover:rotate-0 transition-transform mb-20 shadow-lg shadow-brand-yellow/20"
          >
            <X size={24} className="-rotate-45" />
          </button>
          <nav className="flex flex-col gap-8">
            {navItems.map((item, i) => (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                onClick={onClose}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="text-4xl font-black italic tracking-tighter hover:text-brand-yellow transition-colors uppercase group flex items-center gap-4"
              >
                <span className="text-[10px] not-italic tracking-[0.5em] text-white/20 group-hover:text-brand-yellow">0{i+1}</span>
                <span className="group-hover:translate-x-2 transition-transform">{item.label}</span>
              </motion.a>
            ))}
          </nav>
          
          <div className="mt-auto pt-12 border-t border-white/10">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/40 mb-4 font-bold">Base of Operations</p>
            <p className="text-sm text-white/70 font-light mb-8 italic">Balewadi High Street / MH / 06:45 AM Assemble</p>
            <div className="flex gap-6">
              <a href="https://instagram.com/7amcommunity" target="_blank" rel="noreferrer">
                <Instagram size={20} className="text-white/40 hover:text-brand-yellow cursor-pointer transition-colors" />
              </a>
              <a href="#" target="_blank" rel="noreferrer">
                <StravaIcon size={20} className="text-white/40 hover:text-brand-yellow cursor-pointer transition-colors" />
              </a>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: Math.random() * 0.3, 
            scale: Math.random() * 0.5 + 0.5,
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%"
          }}
          animate={{ 
            y: ["0%", "100%"],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            duration: Math.random() * 20 + 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute w-px h-12 bg-gradient-to-b from-transparent via-brand-yellow/50 to-transparent blur-[0.5px]"
        />
      ))}
    </div>
  );
};

const SectionHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <div className="mb-8 md:mb-12">
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-center gap-4 mb-3 md:mb-4"
    >
      <div className="h-[2px] w-8 md:w-12 bg-brand-yellow" />
      <span className="text-brand-yellow font-display font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">
        {subtitle || 'Explore'}
      </span>
    </motion.div>
    <motion.h2
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-4xl sm:text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-none"
    >
      {title}
    </motion.h2>
  </div>
);

const SignupModal = ({ isOpen, onClose, selectedEvent }: { isOpen: boolean, onClose: () => void, selectedEvent: string }) => {
  const [step, setStep] = useState<'register' | 'pay' | 'confirmed'>('register');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    event: selectedEvent || EVENTS[0].title
  });
  const [transactionId, setTransactionId] = useState('');

  const isValidPhone = (p: string) => /^\d{10}$/.test(p);

  useEffect(() => {
    if (isOpen) {
      setStep('register');
      setFormData(prev => ({ ...prev, event: selectedEvent || EVENTS[0].title }));
      setTransactionId('');
      setIsLoading(false);
    }
  }, [isOpen, selectedEvent]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('pay');
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) return;

    setIsLoading(true);
    try {
      const registrationData = {
        ...formData,
        transactionId: transactionId.trim(),
        createdAt: serverTimestamp(),
        status: 'pending'
      };

      await addDoc(collection(db, 'registrations'), registrationData);
      setStep('confirmed');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'registrations');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotateY: 20 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.9, opacity: 0, rotateY: -20 }}
            className="bg-brand-black brutal-border p-6 md:p-10 rounded-2xl w-full max-w-lg relative z-10 shadow-2xl shadow-brand-yellow/10 overflow-y-auto max-h-[90vh]"
          >
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 text-brand-white/30 hover:text-brand-yellow transition-colors z-20"
            >
              <X size={28} />
            </button>
            
            {step === 'confirmed' ? (
              <div className="text-center py-10 md:py-16">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className="w-20 h-20 md:w-24 md:h-24 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-brand-yellow/30"
                >
                  <Send className="text-brand-black" size={32} />
                </motion.div>
                <h3 className="text-3xl md:text-4xl font-display font-black mb-4 tracking-tighter uppercase leading-tight">Registration Confirmed</h3>
                <p className="text-brand-white/50 text-base md:text-lg uppercase tracking-widest font-bold">You're in the ranks. See you at the finish line.</p>
                <button 
                  onClick={onClose}
                  className="mt-10 md:mt-12 w-full py-4 border border-brand-yellow text-brand-yellow font-black uppercase tracking-widest text-xs hover:bg-brand-yellow hover:text-brand-black transition-all"
                >
                  Close Intel
                </button>
              </div>
            ) : step === 'pay' ? (
              <div className="space-y-6 md:space-y-8">
                <div className="text-center space-y-4">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-display font-black mb-1 text-brand-yellow uppercase tracking-tighter">Scan & Pay</h3>
                    <p className="text-white/50 text-[10px] md:text-xs font-medium tracking-wide">Complete your payment to confirm your spot</p>
                  </div>
                  
                  <div className="bg-brand-yellow/10 border border-brand-yellow/30 py-2 md:py-3 px-4 md:px-6 rounded-xl inline-block">
                    <span className="text-white/60 uppercase tracking-widest text-[9px] md:text-xs font-bold mr-2">Registration Fee:</span>
                    <span className="text-2xl md:text-3xl font-black text-brand-yellow">₹299</span>
                  </div>
                </div>
                
                <div className="flex justify-center items-center py-1 md:py-2">
                  <div className="relative group w-[200px] h-[200px] md:w-[240px] md:h-[240px]">
                    <div className="absolute -inset-4 bg-brand-yellow/30 blur-2xl opacity-20 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative bg-white p-3 md:p-4 rounded-xl shadow-[0_0_50px_rgba(255,255,0,0.2)] border-2 border-brand-yellow/30">
                      <img 
                        src="/qr.jpeg" 
                        alt="Payments QR" 
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/qr.jpeg"; 
                        }}
                      />
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-white/40 font-bold">Enter Transaction ID</label>
                    <input 
                      required 
                      type="text" 
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-white/5 border-b-2 border-white/10 p-3 md:p-4 focus:border-brand-yellow outline-none transition-all text-lg md:text-xl font-medium tracking-widest"
                      placeholder="TXN123456789"
                      disabled={isLoading}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={!transactionId.trim() || !isValidPhone(formData.phone) || isLoading}
                    className="w-full bg-brand-yellow text-brand-black font-black text-lg md:text-xl py-5 md:py-6 uppercase tracking-[0.2em] hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-yellow/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Confirm Payment'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep('register')}
                    className="w-full text-brand-white/30 uppercase tracking-widest text-[10px] font-bold hover:text-brand-yellow transition-colors"
                  >
                    Go Back to Details
                  </button>
                </form>
              </div>
            ) : (
              <>
                <h3 className="text-3xl md:text-5xl font-display font-black mb-6 md:mb-8 text-brand-yellow uppercase tracking-tighter">Registration</h3>
                <form onSubmit={handleRegister} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-white/40 font-bold">Full Name</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white/5 border-b-2 border-white/10 p-4 focus:border-brand-yellow outline-none transition-all text-lg font-medium"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-white/40 font-bold">Email Address</label>
                      <input 
                        required 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white/5 border-b-2 border-white/10 p-4 focus:border-brand-yellow outline-none transition-all text-lg font-medium"
                        placeholder="jane@run.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-white/40 font-bold">Phone Number</label>
                      <input 
                        required 
                        type="tel" 
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) {
                            setFormData({...formData, phone: val});
                          }
                        }}
                        className={`w-full bg-white/5 border-b-2 p-4 focus:border-brand-yellow outline-none transition-all text-lg font-medium ${formData.phone && !isValidPhone(formData.phone) ? 'border-red-500/50' : 'border-white/10'}`}
                        placeholder="10-digit mobile number"
                      />
                      {formData.phone && !isValidPhone(formData.phone) && (
                        <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1">
                          Enter a valid 10-digit phone number
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-white/40 font-bold">Gender</label>
                      <div className="relative">
                        <select 
                          required
                          value={formData.gender}
                          onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          className="w-full bg-white/5 border-b-2 border-white/10 p-4 focus:border-brand-yellow outline-none transition-all text-lg font-medium appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-brand-black">Select Gender</option>
                          <option value="Male" className="bg-brand-black">Male</option>
                          <option value="Female" className="bg-brand-black">Female</option>
                          <option value="Other" className="bg-brand-black">Other</option>
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-brand-yellow pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-white/40 font-bold">Select Event</label>
                    <div className="relative">
                      <select 
                        required
                        value={formData.event}
                        onChange={(e) => setFormData({...formData, event: e.target.value})}
                        className="w-full bg-white/5 border-b-2 border-white/10 p-4 focus:border-brand-yellow outline-none transition-all text-lg font-medium appearance-none cursor-pointer"
                      >
                        {EVENTS.map(evt => (
                          <option key={evt.id} value={evt.title} className="bg-brand-black">{evt.title}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-brand-yellow pointer-events-none" />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={!isValidPhone(formData.phone) || !formData.name || !formData.email}
                    className="w-full bg-brand-yellow text-brand-black font-black text-xl py-6 mt-4 uppercase tracking-[0.2em] hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-yellow/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                  >
                    Confirm Registration
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [runnersCount, setRunnersCount] = useState(() => {
    const baseCount = 100;
    const startDate = new Date('2026-05-03T00:00:00Z').getTime();
    const now = Date.now();
    const msPerRunner = (24 * 60 * 60 * 1000) / 6;
    return baseCount + Math.floor((now - startDate) / msPerRunner);
  });

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Pulse Runners Count
  useEffect(() => {
    const interval = setInterval(() => {
      const baseCount = 100;
      const startDate = new Date('2026-05-03T00:00:00Z').getTime();
      const now = Date.now();
      const msPerRunner = (24 * 60 * 60 * 1000) / 6;
      const current = baseCount + Math.floor((now - startDate) / msPerRunner);
      setRunnersCount(current);
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryData, setEnquiryData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryLoading(true);
    try {
      const data = {
        name: `${enquiryData.firstName} ${enquiryData.lastName}`.trim(),
        email: enquiryData.email,
        message: enquiryData.message,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'enquiries'), data);
      setEnquirySuccess(true);
      setEnquiryData({ firstName: '', lastName: '', email: '', message: '' });
      setTimeout(() => setEnquirySuccess(false), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'enquiries');
    } finally {
      setEnquiryLoading(false);
    }
  };

  const navItems = [
    { label: 'ABOUT', id: 'about' },
    { label: 'EVENTS', id: 'events' },
    { label: 'WHATSAPP', id: 'whatsapp' },
    { label: 'COLLAB', id: 'collab' },
    { label: 'PHOTOS', id: 'photos' },
    { label: 'CONTACT', id: 'contact' }
  ];

  const handleSignup = (eventName: string) => {
    setSelectedEvent(eventName);
    setIsModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-brand-black selection:bg-brand-yellow selection:text-brand-black overflow-x-hidden">
      {/* Scroll Progress */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[6px] bg-brand-yellow z-[60] origin-left shadow-[0_0_15px_rgba(250,204,21,0.5)]"
        style={{ scaleX }}
      />

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        navItems={navItems} 
      />

      <SignupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedEvent={selectedEvent} 
      />

      {/* Navigation Rail */}
      <nav className="fixed top-0 w-full z-50 px-4 py-4 md:px-12 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/10 pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <a href="#" className="text-xl sm:text-3xl font-momentum tracking-tight text-brand-yellow uppercase">7AM COMMUNITY</a>
        </motion.div>
        
        <div className="flex items-center gap-8">
          <span className="hidden md:block text-xs uppercase tracking-[0.3em] font-bold text-white/50">Pune / Maharashtra</span>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col justify-center items-end gap-1.5 group cursor-pointer"
          >
            <div className="w-8 h-[3px] bg-brand-yellow shadow-[0_0_8px_rgba(255,255,0,0.5)]"></div>
            <div className="w-5 h-[3px] bg-white group-hover:w-8 transition-all"></div>
            <div className="w-8 h-[3px] bg-brand-yellow shadow-[0_0_8px_rgba(255,255,0,0.5)]"></div>
          </button>
        </div>
      </nav>

      {/* Hero: Magnitude 7am */}
      <section id="hero" className="min-h-screen flex flex-col md:flex-row pt-20 relative overflow-hidden">
        <ParticleBackground />
        
        {/* Sprinkled 3D Icons */}
        <FloatingIcon icon={Activity} className="absolute top-40 right-[10%] hidden lg:flex" delay={0.2} />
        <FloatingIcon icon={Zap} className="absolute bottom-40 left-[45%] hidden lg:flex" delay={1.5} />
        {/* Background Gradients */}
        <div className="absolute -left-20 top-40 w-96 h-96 bg-brand-yellow/10 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Left Branding Section */}
        <div className="w-full md:w-3/5 p-6 sm:p-12 md:p-24 flex flex-col justify-center relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-[10px] sm:text-sm uppercase tracking-[0.5em] text-brand-yellow font-bold mb-4">Morning Rituals</h2>
            <motion.h1 
               initial={{ y: 50, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               className="text-[14vw] sm:text-[10vw] md:text-[8vw] font-display font-black leading-[0.85] text-brand-white tracking-tighter uppercase"
            >
              OUTRUN YOUR<br/>
              <span className="text-brand-yellow drop-shadow-[0_0_20px_rgba(255,255,0,0.4)]">EXCUSES.</span>
            </motion.h1>

            <div className="flex flex-col md:flex-row gap-12 mt-16 md:items-end">
              <div className="flex flex-col">
                <motion.span 
                  key={runnersCount}
                  initial={{ scale: 1.1, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl md:text-8xl font-black text-brand-yellow drop-shadow-[0_5px_15px_rgba(255,255,0,0.5)] tracking-tighter"
                >
                  {runnersCount.toLocaleString()}
                </motion.span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">RUNNERS JOINED</span>
              </div>
              
              <div className="flex -space-x-3 items-center">
                {['JD', 'AM', 'PK'].map((initials, i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-xs font-bold">{initials}</div>
                ))}
                <div className="w-12 h-12 rounded-full border-2 border-black bg-brand-yellow text-black flex items-center justify-center text-xs font-bold shadow-lg shadow-brand-yellow/20">+32</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-16 max-w-2xl text-left">
              <div className="p-6 border border-white/10 bg-white/5 backdrop-blur-sm group hover:border-brand-yellow transition-colors rounded-xs">
                <h3 className="text-brand-yellow uppercase text-[10px] font-bold tracking-widest mb-2">NEXT RUN</h3>
                <p className="text-sm text-white/70 leading-relaxed font-light uppercase">
                  Coffee Run · 10 May<br/>
                  7:15 AM · The Kuti Project<br/>
                  Balewadi High Street, Pune
                </p>
              </div>
              <div className="p-6 border border-white/10 bg-white/5 backdrop-blur-sm group hover:border-brand-yellow transition-colors rounded-xs">
                <h3 className="text-brand-yellow uppercase text-[10px] font-bold tracking-widest mb-2">Our Mission</h3>
                <p className="text-sm text-white/70 leading-relaxed font-light uppercase italic">"To build a city of people who choose the alarm over the excuse"</p>
              </div>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => handleSignup(EVENTS[0].title)}
              className="mt-12 md:hidden flex items-center justify-between w-full bg-brand-yellow text-black font-black p-6 uppercase tracking-tighter group transition-all"
            >
              Sign Up For The Next Run
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </motion.div>
        </div>

        {/* Right Dashboard Section (Desktop only for immersive feel) */}
        <div className="hidden md:flex w-2/5 md:bg-[#111] border-l border-white/10 p-12 flex-col gap-12 justify-center relative">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-black p-12 border-t-4 border-brand-yellow shadow-2xl relative z-10 group cursor-pointer transition-all"
            onClick={() => handleSignup(EVENTS[0].title)}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none group-hover:text-brand-yellow transition-colors">
                SIGN UP FOR THE<br />NEXT RUN
              </h3>
              <motion.div 
                whileHover={{ x: 10, scale: 1.2 }}
                className="text-brand-yellow p-4 border border-brand-yellow/30 rounded-full group-hover:bg-brand-yellow group-hover:text-black transition-all"
              >
                <ArrowRight size={32} />
              </motion.div>
            </div>
            <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-bold group-hover:text-white/60 transition-colors">
              Click the beacon to join the ranks.
            </p>
          </motion.div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60">Vibe Check / Highlights</h3>
              <a href="#photos" className="text-[10px] text-brand-yellow font-black uppercase tracking-widest hover:underline">View All</a>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {PHOTOS.slice(0, 3).map((src, idx) => (
                <div key={idx} className="bg-zinc-800 grayscale hover:grayscale-0 transition-all border border-white/10 overflow-hidden cursor-crosshair aspect-square">
                   <img src={src} className="w-full h-full object-cover transition-transform hover:scale-110" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Accent */}
        <div className="absolute right-0 top-0 h-full w-[4px] bg-brand-yellow z-30 shadow-[0_0_15px_rgba(255,255,0,0.5)]"></div>
      </section>

      {/* About: The Manifesto */}
      <section id="about" className="py-20 md:py-32 px-6 md:px-24 border-b border-white/10 relative overflow-hidden">
        <FloatingIcon icon={Users} className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-20 scale-150 grayscale z-0" delay={2} />
        <div className="relative z-10">
          <SectionHeader title="THE MANIFESTO" subtitle="About 7AM Community" />
        <div className="grid lg:grid-cols-12 gap-8 md:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 space-y-8 md:space-y-12"
          >
            <p className="text-3xl sm:text-4xl md:text-6xl font-display font-black leading-[1.1] tracking-tighter uppercase">
              Born at <span className="text-brand-yellow drop-shadow-[0_0_10px_rgba(255,255,0,0.3)]">7:00 AM</span> on the vibrant streets of Balewadi High Street.
            </p>
            <div className="space-y-4">
              <h2 className="text-xl md:text-3xl font-black text-brand-yellow uppercase tracking-tighter italic">Some alarms are easy to ignore. This one isn’t.</h2>
            </div>
            <div className="space-y-6 text-lg md:text-2xl text-brand-white/60 leading-relaxed max-w-3xl font-light">
              <p>
                We are not a fitness programme. We are not a race team. We are a community built on one simple belief that showing up, <span className="text-brand-white decoration-brand-yellow decoration-2 underline underline-offset-8 font-bold italic">CONSISTENTLY</span> and together, changes everything.
              </p>
              <p>
                Every morning, while Pune sleeps, we move. Strangers become familiar faces. Familiar faces become the reason you don’t hit snooze.
              </p>
              <p className="text-brand-yellow font-black italic uppercase tracking-widest text-lg">
                Every pace. Every story. Always welcome.
              </p>
            </div>
            

          </motion.div>

          <div className="lg:col-span-12 mt-12">
            <ManifestoGraphic />
          </div>
        </div>
      </div>
    </section>

      {/* Events: Checkpoint */}
      <section id="events" className="py-32 px-6 md:px-24 border-b border-white/10 bg-[#0c0c0c]">
        <SectionHeader title="THE SCHEDULE" subtitle="Operations" />
        <div className="mb-12">
          <p className="text-brand-yellow/60 font-black uppercase tracking-[0.3em] text-xs">Sunday Morning Rituals / 07:00 AM</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {EVENTS.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group bg-black border border-white/10 hover:border-brand-yellow transition-all p-8 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-yellow/5 -mr-10 -mt-10 rotate-45 group-hover:bg-brand-yellow/20 transition-all pointer-events-none" />
              <div className="flex justify-between items-start mb-12">
                <div className="bg-brand-yellow text-black font-black px-4 py-1 text-[10px] tracking-widest uppercase shadow-lg shadow-brand-yellow/10">
                  {event.difficulty}
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-black tracking-tighter italic uppercase">{event.date.split(' ')[1].replace(',', '')} {event.date.split(' ')[0]}</span>
                  <span className="text-[10px] text-white/40 font-bold tracking-widest uppercase">{event.time}</span>
                </div>
              </div>
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter italic leading-tight group-hover:text-brand-yellow transition-colors">
                {event.title}
              </h3>
              <div className="flex items-center gap-2 text-white/40 text-[10px] mb-12 font-bold uppercase tracking-widest">
                <MapPin size={14} className="text-brand-yellow" />
                {event.location}
              </div>
              
              <button 
                onClick={() => handleSignup(event.title)}
                className="mt-auto w-full py-4 border border-brand-yellow text-brand-yellow font-black uppercase text-[10px] tracking-[0.3em] hover:bg-brand-yellow hover:text-black transition-all"
              >
                Assemble
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery: The Archive */}
      <section id="photos" className="py-32 px-6 md:px-24 border-b border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <SectionHeader title="THE ARCHIVE" subtitle="Moments" />
          <p className="max-w-xs text-brand-white/40 font-black uppercase tracking-[0.3em] text-[10px] text-right">
            CAPTURED ON THE STREETS OF PUNE BY OUR ACTIVE COMMUNITY.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {PHOTOS.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="relative aspect-square group overflow-hidden border border-white/10 bg-[#111]"
            >
              <img src={src} alt="Past event" className="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-4 right-4 bg-brand-yellow p-2 opacity-0 group-hover:opacity-100 transition-all">
                <Camera size={16} className="text-black" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WhatsApp Community: The Pulse */}
      <section id="whatsapp" className="py-20 md:py-32 px-6 md:px-24 border-b border-white/10 bg-brand-yellow/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-yellow/5 skew-x-12 transform origin-right pointer-events-none" />
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeader title="JOIN THE PULSE" subtitle="WhatsApp Community" />
            <p className="text-lg md:text-2xl text-white/70 mb-8 font-light italic leading-relaxed">
              Real-time updates. Last-minute assembly calls. A community that never hits snooze. Get the signal directly on your device.
            </p>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://chat.whatsapp.com/LR6UtotJhPZ7zwIo8UyCny"
              target="_blank"
              className="inline-flex items-center gap-4 bg-brand-yellow text-black px-8 py-5 md:px-10 md:py-6 font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-yellow/20 hover:bg-white transition-all text-sm"
            >
              <Phone size={20} /> Join WhatsApp Intel
            </motion.a>
          </motion.div>
          
          {/* Interactive 3D shoe visual (CSS-based) */}
          <div className="relative h-[300px] md:h-[400px] flex items-center justify-center perspective-[1000px]">
            <motion.div
              animate={{ 
                rotateY: [0, 360],
                y: [0, -20, 0]
              }}
              transition={{ 
                rotateY: { duration: 15, repeat: Infinity, ease: "linear" },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-64 md:w-80 h-40 md:h-48 bg-brand-yellow/10 border-2 border-brand-yellow/20 rounded-xl"
            >
              {/* Fake 3D "7AM" Box/Element */}
              <div className="absolute inset-0 flex items-center justify-center font-momentum text-6xl md:text-8xl text-brand-yellow/20 select-none">
                7AM
              </div>
              <div className="absolute top-0 left-0 w-full h-full border border-brand-yellow shadow-[0_0_50px_rgba(255,255,0,0.2)] flex items-center justify-center">
                 <Zap size={80} className="md:size-[120px] text-brand-yellow drop-shadow-[0_0_20px_rgba(255,255,0,0.5)]" />
              </div>
              {/* Particle trail effect */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    x: [-100, 200],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 1, 
                    delay: i * 0.2, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute left-0 top-1/2 w-4 h-px bg-brand-yellow"
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand Collaboration: Synergy */}
      <section id="collab" className="py-32 px-6 md:px-24 border-b border-white/10 relative overflow-hidden bg-black">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.03),transparent)]" />
        
        {/* Floating Icons Background */}
        <FloatingIcon icon={Handshake} className="absolute top-20 right-20 hidden md:flex" delay={0.5} />
        <FloatingIcon icon={Star} className="absolute bottom-20 left-40 hidden md:flex" delay={1.2} />
        <FloatingIcon icon={Globe} className="absolute top-1/2 left-20 hidden md:flex" delay={0.8} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <SectionHeader title="COLLABORATE" subtitle="Brand Synergy" />
          <p className="text-2xl md:text-3xl text-white/60 mb-12 font-light leading-relaxed">
            Are you a <span className="text-brand-yellow italic">Brand</span>, <span className="text-brand-yellow italic">Cafe</span>, or <span className="text-brand-yellow italic">Influencer</span> looking to move with the most active community in Pune?
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 text-left mb-16">
            <div className="p-10 border border-white/10 bg-white/5 hover:border-brand-yellow transition-all flex flex-col gap-4">
               <Zap className="text-brand-yellow" size={32} />
               <h4 className="text-2xl font-black uppercase tracking-tighter">Event Takeovers</h4>
               <p className="text-sm text-white/40 leading-relaxed uppercase tracking-widest font-bold">Host our community for a post-run ritual or assembly points.</p>
            </div>
            <div className="p-10 border border-white/10 bg-white/5 hover:border-brand-yellow transition-all flex flex-col gap-4">
               <Handshake className="text-brand-yellow" size={32} />
               <h4 className="text-2xl font-black uppercase tracking-tighter">Strategic Collabs</h4>
               <p className="text-sm text-white/40 leading-relaxed uppercase tracking-widest font-bold">Partner for exclusive athlete releases and gear testings.</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-12 py-6 font-black uppercase tracking-[0.4em] text-sm hover:bg-brand-yellow transition-all brutal-border"
          >
            Open Transmission
          </motion.button>
        </div>
      </section>

      {/* Contact: Broadcast */}
      <section id="contact" className="py-20 md:py-32 px-6 md:px-24 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 md:gap-32">
            <div>
              <SectionHeader title="BROADCAST" subtitle="Contact" />
              <div className="space-y-8 md:space-y-12">
                <div className="space-y-4">
                  <p className="text-2xl md:text-3xl font-display font-bold text-brand-white/80 leading-tight tracking-tight">
                    Got queries, partnerships, or just want to join the morning madness?
                  </p>
                  <p className="text-brand-white/40 uppercase tracking-widest text-[9px] md:text-xs font-black">
                    Response time: 7AM Sharp.
                  </p>
                </div>

                <div className="grid gap-6">
                  <motion.a 
                    whileHover={{ x: 10 }}
                    href="mailto:7amcommuniity@gmail.com" 
                    className="flex items-center gap-6 p-6 border border-white/10 rounded-2xl group hover:border-brand-yellow transition-all"
                  >
                    <div className="w-14 h-14 bg-brand-yellow rounded-xl flex items-center justify-center text-brand-black shadow-lg shadow-brand-yellow/20">
                      <Mail size={24} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black tracking-widest text-brand-white/40 uppercase mb-1">Direct Line</span>
                      <span className="text-lg font-bold">7amcommuniity@gmail.com</span>
                    </div>
                  </motion.a>

                  <div className="flex gap-4">
                    <motion.a 
                      whileHover={{ y: -5, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href="https://instagram.com/7amcommunity" 
                      target="_blank"
                      className="w-16 h-16 brutal-border rounded-2xl flex items-center justify-center text-brand-yellow hover:bg-brand-yellow hover:text-brand-black transition-all"
                    >
                      <Instagram size={24} />
                    </motion.a>
                    <motion.a 
                      whileHover={{ y: -5, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href="https://strava.app.link/lVDY8LnJQ2b" 
                      target="_blank"
                      className="w-16 h-16 brutal-border rounded-2xl flex items-center justify-center text-brand-yellow hover:bg-brand-yellow hover:text-brand-black transition-all"
                    >
                      <StravaIcon size={24} />
                    </motion.a>
                  </div>
                </div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-black border-t-2 border-brand-yellow p-8 md:p-12 shadow-2xl relative"
            >
              <h3 className="text-xl md:text-2xl font-black mb-8 italic tracking-tighter uppercase">HAVE AN ENQUIRY ?</h3>
              {enquirySuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center mx-auto">
                    <Send className="text-black" />
                  </div>
                  <h4 className="text-2xl font-black uppercase tracking-tighter">Signal Received</h4>
                  <p className="text-white/50 uppercase tracking-widest text-[10px] font-bold">We'll get back to you at 7AM sharp.</p>
                </div>
              ) : (
                <form onSubmit={handleEnquiry} className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 ml-1">First Name</label>
                      <input 
                        required
                        type="text" 
                        value={enquiryData.firstName}
                        onChange={(e) => setEnquiryData({...enquiryData, firstName: e.target.value})}
                        className="w-full bg-[#1a1a1a] border border-white/10 p-5 rounded-none focus:border-brand-yellow outline-none transition-all placeholder:text-white/10" 
                        placeholder="John" 
                        disabled={enquiryLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 ml-1">Last Name</label>
                      <input 
                        required
                        type="text" 
                        value={enquiryData.lastName}
                        onChange={(e) => setEnquiryData({...enquiryData, lastName: e.target.value})}
                        className="w-full bg-[#1a1a1a] border border-white/10 p-5 rounded-none focus:border-brand-yellow outline-none transition-all placeholder:text-white/10" 
                        placeholder="Doe" 
                        disabled={enquiryLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 ml-1">EMAIL</label>
                    <input 
                      required
                      type="email" 
                      value={enquiryData.email}
                      onChange={(e) => setEnquiryData({...enquiryData, email: e.target.value})}
                      className="w-full bg-[#1a1a1a] border border-white/10 p-5 rounded-none focus:border-brand-yellow outline-none transition-all placeholder:text-white/10" 
                      placeholder="john@7am.club" 
                      disabled={enquiryLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 ml-1">TYPE YOUR MESSAGE</label>
                    <textarea 
                      required
                      rows={4} 
                      value={enquiryData.message}
                      onChange={(e) => setEnquiryData({...enquiryData, message: e.target.value})}
                      className="w-full bg-[#1a1a1a] border border-white/10 p-5 rounded-none focus:border-brand-yellow outline-none transition-all placeholder:text-white/10 resize-none" 
                      placeholder="Start your message..."
                      disabled={enquiryLoading}
                    ></textarea>
                  </div>
                  <button 
                    disabled={enquiryLoading}
                    className="w-full bg-brand-yellow text-brand-black py-6 rounded-none font-black uppercase tracking-[0.4em] hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-yellow/10 flex items-center justify-center gap-2"
                  >
                    {enquiryLoading ? <Loader2 className="animate-spin" /> : 'SEND MESSAGE'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer: Zero Hour */}
      <footer className="py-24 px-6 md:px-24 bg-brand-black border-t border-white/5 overflow-hidden relative">
        <div className="absolute -bottom-20 -right-20 text-[20vw] font-display font-black text-white/[0.02] select-none pointer-events-none">
          PUNE
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
          <div className="space-y-6 text-center md:text-left">
            <div className="text-5xl font-momentum tracking-tight">
              7AM COMMUNITY<span className="text-brand-yellow">.</span>
            </div>
            <p className="text-brand-white/30 uppercase tracking-[0.5em] text-[10px]">THE COMMUNITY FOR THE UNRELENTING.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-10">
            {navItems.map(item => (
              <a key={item.id} href={`#${item.id}`} className="text-xs font-black tracking-[0.3em] text-brand-white/40 hover:text-brand-yellow transition-colors">{item.label}</a>
            ))}
          </div>
          
          <div className="text-right">
            <p className="text-brand-white/20 text-xs font-bold uppercase tracking-widest">© 2026 7AM COMMUNITY</p>
            <p className="text-brand-yellow/30 text-[10px] font-black uppercase tracking-widest mt-1">NO EXCUSES PERMITTED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
