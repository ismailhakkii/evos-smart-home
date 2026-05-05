import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi, Home, Settings, Shield, Zap, ChevronRight, ChevronLeft,
  Menu, X, Thermometer, Volume2, Smartphone, ArrowRight, ArrowUp,
  Check, Star, Plus, Phone, Mail, MapPin, Send, CheckCircle2,
  Activity, Lock, Lightbulb, Camera, Wind, Radio
} from 'lucide-react';
import './index.css';

/* ═══════════════════════════════════════════════
   PARTICLE NETWORK (Interactive Canvas)
   ═══════════════════════════════════════════════ */
const ParticleNetwork = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    const count = Math.min(80, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 12000));
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
    }));

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleLeave = () => { mouseRef.current = { x: -1000, y: -1000 }; };
    canvas.parentElement.addEventListener('mousemove', handleMouse);
    canvas.parentElement.addEventListener('mouseleave', handleLeave);

    const draw = () => {
      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;
      ctx.clearRect(0, 0, cw, ch);

      const pts = particlesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > cw) p.vx *= -1;
        if (p.y < 0 || p.y > ch) p.vy *= -1;

        // Mouse attraction
        const dxm = mx - p.x;
        const dym = my - p.y;
        const distM = Math.sqrt(dxm * dxm + dym * dym);
        if (distM < 150) {
          p.x += dxm * 0.01;
          p.y += dym * 0.01;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(17,148,240,0.25)';
        ctx.fill();

        // Draw lines
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(17,148,240,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Mouse lines
        if (distM < 200) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mx, my);
          ctx.strokeStyle = `rgba(47,168,255,${0.15 * (1 - distM / 200)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.parentElement?.removeEventListener('mousemove', handleMouse);
      canvas.parentElement?.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" style={{ width: '100%', height: '100%' }} />;
};

/* ═══════════════════════════════════════════════
   MINI ENERGY CHART (SVG animated)
   ═══════════════════════════════════════════════ */
const EnergyChart = () => {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setOffset(prev => (prev + 1) % 100), 80);
    return () => clearInterval(timer);
  }, []);

  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const x = (i / 20) * 100;
      const y = 50 + Math.sin((i + offset) * 0.4) * 18 + Math.cos((i + offset) * 0.2) * 10;
      pts.push(`${x},${y}`);
    }
    return pts.join(' ');
  }, [offset]);

  const areaPoints = `0,90 ${points} 100,90`;

  return (
    <svg viewBox="0 0 100 90" preserveAspectRatio="none" style={{ width: '100%', height: '48px' }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(6,214,160,0.3)" />
          <stop offset="100%" stopColor="rgba(6,214,160,0)" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#chartGrad)" />
      <polyline points={points} fill="none" stroke="#06D6A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ═══════════════════════════════════════════════
   ANIMATED COUNTER HOOK
   ═══════════════════════════════════════════════ */
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);
  useEffect(() => {
    if (!started) return;
    const num = parseInt(target);
    const step = Math.max(1, Math.floor(num / (duration / 16)));
    let cur = 0;
    const t = setInterval(() => { cur += step; if (cur >= num) { setCount(num); clearInterval(t); } else setCount(cur); }, 16);
    return () => clearInterval(t);
  }, [started, target, duration]);
  return { count, ref };
}

/* ═══════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════ */
const roomsData = {
  salon: { label: 'Salon', devices: [
    { id: 's1', name: 'Aydınlatma', icon: 'zap', type: 'energy', on: true, slider: true, value: 80 },
    { id: 's2', name: 'Güvenlik', icon: 'shield', type: 'security', on: true, slider: false },
    { id: 's3', name: 'Klima', icon: 'thermo', type: 'climate', on: true, slider: true, value: 22 },
    { id: 's4', name: 'Müzik', icon: 'audio', type: 'audio', on: false, slider: true, value: 40 },
  ]},
  yatak: { label: 'Yatak Odası', devices: [
    { id: 'y1', name: 'Abajur', icon: 'zap', type: 'energy', on: true, slider: true, value: 30 },
    { id: 'y2', name: 'Perde', icon: 'shield', type: 'security', on: false, slider: false },
    { id: 'y3', name: 'Klima', icon: 'thermo', type: 'climate', on: true, slider: true, value: 20 },
    { id: 'y4', name: 'Hoparlör', icon: 'audio', type: 'audio', on: true, slider: true, value: 25 },
  ]},
  mutfak: { label: 'Mutfak', devices: [
    { id: 'm1', name: 'Tezgah Işığı', icon: 'zap', type: 'energy', on: true, slider: true, value: 100 },
    { id: 'm2', name: 'Kamera', icon: 'shield', type: 'security', on: true, slider: false },
    { id: 'm3', name: 'Havalandırma', icon: 'thermo', type: 'climate', on: false, slider: true, value: 50 },
    { id: 'm4', name: 'Radyo', icon: 'audio', type: 'audio', on: false, slider: true, value: 60 },
  ]},
  bahce: { label: 'Bahçe', devices: [
    { id: 'b1', name: 'Dış Aydınlatma', icon: 'zap', type: 'energy', on: false, slider: true, value: 70 },
    { id: 'b2', name: 'Alarm', icon: 'shield', type: 'security', on: true, slider: false },
    { id: 'b3', name: 'Sulama', icon: 'thermo', type: 'climate', on: false, slider: false },
    { id: 'b4', name: 'Bahçe Müzik', icon: 'audio', type: 'audio', on: false, slider: true, value: 30 },
  ]}
};

const DeviceIcon = ({ type, size = 20 }) => {
  switch (type) {
    case 'zap': return <Zap size={size} />;
    case 'shield': return <Shield size={size} />;
    case 'thermo': return <Thermometer size={size} />;
    case 'audio': return <Volume2 size={size} />;
    default: return <Settings size={size} />;
  }
};

const marqueeItems = [
  { name: 'Google Home', icon: <Home size={16} /> },
  { name: 'Amazon Alexa', icon: <Volume2 size={16} /> },
  { name: 'Apple HomeKit', icon: <Smartphone size={16} /> },
  { name: 'Samsung SmartThings', icon: <Settings size={16} /> },
  { name: 'Philips Hue', icon: <Lightbulb size={16} /> },
  { name: 'Ring Security', icon: <Camera size={16} /> },
  { name: 'Nest Thermostat', icon: <Thermometer size={16} /> },
  { name: 'Sonos Audio', icon: <Radio size={16} /> },
];

/* ═══════════════════════════════════════════════
   APP COMPONENT
   ═══════════════════════════════════════════════ */
const App = () => {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState('salon');
  const [devices, setDevices] = useState(JSON.parse(JSON.stringify(roomsData)));
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const dashboardRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 900) setMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // 3D tilt on dashboard
  const handleDashboardMouse = useCallback((e) => {
    const el = dashboardRef.current;
    if (!el || window.innerWidth < 1024) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg)`;
  }, []);
  const handleDashboardLeave = useCallback(() => {
    if (dashboardRef.current) dashboardRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
  }, []);

  // Testimonials
  const testimonials = [
    { name: 'Ahmet Yılmaz', role: 'Villa Sahibi, Bodrum', text: 'Tüm iklimlendirme ve aydınlatma senaryolarını telefonumdan yönetmek inanılmaz bir lüks. EVOS ile enerji faturamızda %35 tasarruf sağladık.', color: '#1194F0' },
    { name: 'Elif Kara', role: 'Mimar, İstanbul', text: 'Lüks konut projelerimizde müşterilerime standart olarak EVOS öneriyorum. Kurulumdaki profesyonellik ve sistemin kesintisiz çalışması kusursuz.', color: '#7C5DFA' },
    { name: 'Burak Demir', role: 'İşletme Sahibi, Ankara', text: 'Ofisimizin tüm otomasyonunu EVOS\'a emanet ettik. Mesai saatlerine göre kendi kendini ayarlayan sistem sayesinde güvenlik endişemiz kalmadı.', color: '#06D6A0' },
    { name: 'Selin Öztürk', role: 'Ev Hanımı, İzmir', text: 'Dışarıdayken çocukların eve girdiğini anlık görebilmek paha biçilemez. Kullanımı o kadar kolay ki evin vazgeçilmezi oldu.', color: '#FF6B35' },
  ];
  const totalSlides = typeof window !== 'undefined' && window.innerWidth >= 768 ? Math.ceil(testimonials.length / 2) : testimonials.length;

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(p => (p + 1) % totalSlides), 5000);
    return () => clearInterval(t);
  }, [totalSlides]);

  const toggleDevice = (room, id) => {
    setDevices(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const d = next[room].devices.find(x => x.id === id);
      if (d) d.on = !d.on;
      return next;
    });
  };

  const updateSlider = (room, id, val) => {
    setDevices(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const d = next[room].devices.find(x => x.id === id);
      if (d) d.value = parseInt(val);
      return next;
    });
  };

  const validateForm = () => {
    const err = {};
    if (!formData.name.trim()) err.name = true;
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) err.email = true;
    if (!formData.message.trim()) err.message = true;
    return err;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateForm();
    setFormErrors(err);
    if (Object.keys(err).length > 0) return;
    setFormLoading(true);

    try {
      // Formu Web3Forms API ile gönder
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: "BURAYA_WEB3FORMS_ACCESS_KEY_GELECEK", // web3forms.com'dan alınan key
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });
      if (response.ok) setFormSubmitted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const scrollTo = (id) => {
    setMenuOpen(false);
    setTimeout(() => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }, 100);
  };

  const currentDevices = devices[activeRoom].devices;

  const stat1 = useCounter('500', 2000);
  const stat2 = useCounter('98', 1500);
  const stat3 = useCounter('24', 1000);
  const stat4 = useCounter('15', 1200);

  const features = [
    { icon: <Zap size={24} color="#D97706" />, cls: 'fi-energy', title: 'Enerji Yönetimi', desc: 'Yapay zeka ile enerji tüketiminizi analiz edin. Faturalarınızı %40\'a kadar düşürün.' },
    { icon: <Shield size={24} color="#059669" />, cls: 'fi-security', title: 'Akıllı Güvenlik', desc: 'Yüz tanıma, hareket algılama ve anlık bildirimler. 24/7 izleme ve otomatik alarm.' },
    { icon: <Settings size={24} color="#2563EB" />, cls: 'fi-automation', title: 'Sınırsız Otomasyon', desc: 'Eve yaklaştığınızda ışıklar yansın, uyuduğunuzda perdeler kapansın. Sınırsız senaryo.' },
    { icon: <Thermometer size={24} color="#7C3AED" />, cls: 'fi-climate', title: 'İklimlendirme', desc: 'Her oda için bağımsız sıcaklık kontrolü. Mevsime göre otomatik optimizasyon.' },
    { icon: <Volume2 size={24} color="#E11D48" />, cls: 'fi-speaker', title: 'Ses & Görüntü', desc: 'Çoklu oda ses sistemi ve sinema deneyimi. Sesli komutlarla tüm sistemi yönetin.' },
    { icon: <Smartphone size={24} color="#0D9488" />, cls: 'fi-mobile', title: 'Uzaktan Kontrol', desc: 'Dünyanın neresinde olursanız olun. Mobil uygulama ile gerçek zamanlı yönetim.' },
  ];

  const faqs = [
    { q: 'EVOS Smarthome kurulumu ne kadar sürer?', a: 'Standart bir villa projesi ortalama 3-5 iş gününde tamamlanır. Kurulum süresince yaşamınız minimum etkilenir.' },
    { q: 'Mevcut evime de akıllı ev sistemi kurulabilir mi?', a: 'Evet! Kablosuz teknolojilerimiz sayesinde tadilat gerektirmeden kurulum yapılabilir.' },
    { q: 'Hangi sesli asistanlarla uyumlu?', a: 'Google Home, Amazon Alexa ve Apple HomeKit ile tam uyumludur.' },
    { q: 'Garanti ve destek süreniz nedir?', a: '2 yıl donanım garantisi, ömür boyu yazılım güncellemesi ve 7/24 teknik destek.' },
    { q: 'Aylık bir abonelik ücreti var mı?', a: 'Temel fonksiyonlar için aylık ücret yok. Premium özellikler için uygun planlar mevcuttur.' },
  ];

  const steps = [
    { title: 'Keşif & Analiz', desc: 'Uzman ekibimiz evinizi ziyaret eder ve ihtiyaçlarınızı belirler.' },
    { title: 'Özel Tasarım', desc: 'Size özel akıllı ev planı ve 3D görselleştirme hazırlarız.' },
    { title: 'Profesyonel Kurulum', desc: 'Sertifikalı teknisyenlerimiz sisteminizi kurar ve test eder.' },
    { title: '7/24 Destek', desc: 'Uzaktan izleme ve proaktif bakım ile sürekli yanınızdayız.' },
  ];

  return (
    <div className="app-container">
      {/* Fixed layered gradient background */}
      <div className="global-bg" />
      {/* ═══ NAVBAR ═══ */}
      <nav className={`navbar ${scrollY > 60 ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <a href="#" className="logo" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <motion.img 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
              src="/evos_logo.png" 
              alt="EVOS Smarthome" 
              className="logo-image" 
            />
          </a>
          <div className="nav-menu">
            {[{l:'Çözümler',id:'cozumler'},{l:'Nasıl Çalışır',id:'nasil'},{l:'Referanslar',id:'referanslar'},{l:'SSS',id:'sss'},{l:'İletişim',id:'iletisim'}].map(i => (
              <a key={i.id} href={`#${i.id}`} className="nav-link" onClick={e => { e.preventDefault(); scrollTo(i.id); }}>{i.l}</a>
            ))}
            <button className="nav-cta" onClick={() => scrollTo('iletisim')}>Teklif Al</button>
          </div>
          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div 
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)} 
            />
            <motion.div 
              className="mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="drawer-header">
                <img src="/evos_logo.png" alt="EVOS" className="drawer-logo" />
                <button className="drawer-close" onClick={() => setMenuOpen(false)}><X size={24} /></button>
              </div>
              <div className="drawer-links">
                {[{l:'Çözümler',id:'cozumler'},{l:'Nasıl Çalışır',id:'nasil'},{l:'Referanslar',id:'referanslar'},{l:'SSS',id:'sss'},{l:'İletişim',id:'iletisim'}].map((item, index) => (
                  <motion.a 
                    key={item.id} 
                    href={`#${item.id}`} 
                    className="drawer-link" 
                    onClick={e => { e.preventDefault(); scrollTo(item.id); }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    {item.l} <ChevronRight size={18} className="link-arrow" />
                  </motion.a>
                ))}
              </div>
              <div className="drawer-footer">
                <button className="drawer-cta" onClick={() => scrollTo('iletisim')}>Hemen Teklif Al</button>
                <div className="drawer-socials">
                  <a href="https://www.instagram.com/evossmarthome/" target="_blank" rel="noopener noreferrer">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ HERO ═══ */}
      <section className="hero" style={{ backgroundImage: "url('/hero-bg.png')" }}>
        <ParticleNetwork />
        <div className="blob-a mesh-blob" style={{ top: '-100px', right: '0px' }} />
        <div className="blob-b mesh-blob" style={{ bottom: '-100px', left: '-80px' }} />
        <div className="blob-c mesh-blob" style={{ top: '40%', left: '35%' }} />

        <div className="container hero-grid">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="hero-title">
              Evinizi{' '}
              <span className="hero-title-accent"><span className="hero-title-accent-text">Geleceğe</span></span>
              <br />Taşıyın
            </h1>
            <p className="hero-desc">
              EVOS ile güvenlik, konfor ve enerji verimliliğini tek bir platformdan yönetin.
              Yapay zeka destekli otomasyon ile yaşam kalitenizi artırın.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary-glass" onClick={() => scrollTo('iletisim')}>
                Ücretsiz Keşif <ArrowRight size={18} />
              </button>
              <button className="btn btn-secondary-glass" onClick={() => scrollTo('nasil')}>
                <Settings size={18} /> Nasıl Çalışır?
              </button>
            </div>
            <div className="hero-trust">
              {['Ücretsiz Keşif', '2 Yıl Garanti', '7/24 Destek'].map(t => (
                <div key={t} className="hero-trust-item"><CheckCircle2 size={18} className="trust-icon" /><span>{t}</span></div>
              ))}
            </div>
          </motion.div>

          {/* Hero 3D Home Image */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hero-image-wrapper"
          >
            <div className="hero-image-glow" />
            <img src="/evos_hero.png" alt="EVOS Akıllı Ev 3D Görünüm" className="hero-image" />
            <div className="dashboard-float dashboard-float-1">
              <div className="float-icon" style={{ background: 'rgba(6,214,160,0.1)' }}><Check size={16} color="#06D6A0" /></div>
              <div><div className="float-text">Bağlantı Şifreli</div><div className="float-sub">Uçtan uca güvenlik</div></div>
            </div>
            <div className="dashboard-float dashboard-float-2">
              <div className="float-icon" style={{ background: 'rgba(17,148,240,0.1)' }}><Shield size={16} color="#1194F0" /></div>
              <div><div className="float-text">Sistem Aktif</div><div className="float-sub">Tüm sensörler devrede</div></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ MARQUEE BRAND STRIP ═══ */}
      <section className="marquee-section">
        <div className="marquee-label">Entegre çalıştığımız teknolojiler</div>
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <div key={i} className="marquee-item">
              <div className="marquee-item-icon">{item.icon}</div>
              {item.name}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {[
              { ref: stat1.ref, count: stat1.count, suffix: '+', label: 'Tamamlanan Proje' },
              { ref: stat2.ref, count: stat2.count, suffix: '%', label: 'Müşteri Memnuniyeti' },
              { ref: stat3.ref, count: stat3.count, suffix: '/7', label: 'Teknik Destek' },
              { ref: stat4.ref, count: stat4.count, suffix: '+', label: 'Yıllık Deneyim' },
            ].map((s, i) => (
              <motion.div 
                key={i} 
                className="stat-card" 
                ref={s.ref}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="stat-value">{s.count}<span>{s.suffix}</span></div>
                <div className="stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="features-section section-padding" id="cozumler">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Çözümlerimiz</span>
            <h2 className="section-title">Kapsamlı Akıllı Ev <span className="accent-text">Çözümleri</span></h2>
            <p className="section-desc">Evinizin her köşesini kontrol altına alan, birbiriyle entegre çalışan profesyonel sistemler.</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <motion.div 
                key={i} 
                className="feature-card" 
                initial={{ opacity: 0, y: 40, scale: 0.95 }} 
                whileInView={{ opacity: 1, y: 0, scale: 1 }} 
                viewport={{ once: true, margin: '-40px' }} 
                transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
              >
                <div className={`feature-icon-box ${f.cls}`}>{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <a href="#" className="feature-link" onClick={e => e.preventDefault()}>Detaylı Bilgi <ArrowRight size={14} /></a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROCESS ═══ */}
      <section className="process-section section-padding" id="nasil">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Süreç</span>
            <h2 className="section-title">4 Adımda <span className="accent-text">Akıllı Ev</span></h2>
            <p className="section-desc">Evinizi akıllı hale getirmek son derece kolay.</p>
          </div>
          <div className="process-grid">
            {steps.map((s, i) => (
              <motion.div 
                key={i} 
                className="process-step" 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.6, delay: i * 0.15, ease: 'easeOut' }}
              >
                <div className="process-number">{i + 1}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="testimonials-section section-padding" id="referanslar">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Referanslar</span>
            <h2 className="section-title">Müşterilerimiz <span className="accent-text">Ne Diyor?</span></h2>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div className="testimonials-slider" style={{ transform: `translateX(-${testimonialIdx * (typeof window !== 'undefined' && window.innerWidth >= 768 ? 50 : 100)}%)`, transition: 'transform 0.5s ease' }}>
              {testimonials.map((t, i) => (
                <motion.div 
                  key={i} 
                  className="testimonial-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <div className="testimonial-stars">{[...Array(5)].map((_, si) => <Star key={si} size={16} fill="#FFB800" className="star-fill" />)}</div>
                  <p className="testimonial-text">"{t.text}"</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar" style={{ background: t.color }}>{t.name.split(' ').map(n => n[0]).join('')}</div>
                    <div className="testimonial-info"><h5>{t.name}</h5><p>{t.role}</p></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="slider-controls">
            <button className="slider-btn" onClick={() => setTestimonialIdx(p => (p - 1 + totalSlides) % totalSlides)}><ChevronLeft size={18} /></button>
            <div className="slider-dots">{[...Array(totalSlides)].map((_, i) => <button key={i} className={`slider-dot ${testimonialIdx === i ? 'active' : ''}`} onClick={() => setTestimonialIdx(i)} />)}</div>
            <button className="slider-btn" onClick={() => setTestimonialIdx(p => (p + 1) % totalSlides)}><ChevronRight size={18} /></button>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="faq-section section-padding" id="sss">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">SSS</span>
            <h2 className="section-title">Sıkça Sorulan <span className="accent-text">Sorular</span></h2>
          </div>
          <div className="faq-grid">
            {faqs.map((f, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}><span>{f.q}</span><Plus size={20} className="faq-icon" /></button>
                <div className="faq-answer"><p>{f.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section className="contact-section section-padding" id="iletisim">
        <div className="container">
          <div className="contact-grid">
            <motion.div className="contact-info" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2>Evinizi Akıllı Hale Getirmeye Hazır mısınız?</h2>
              <p>Ücretsiz keşif ve projelendirme için hemen bizimle iletişime geçin.</p>
              {[
                { icon: <Phone size={18} />, label: 'Yetkili', text: 'Hamza Karaaslan' },
                { icon: <Phone size={18} />, label: 'Telefon', text: '0 533 351 36 44' },
                { icon: <Mail size={18} />, label: 'E-posta', text: 'info@evossmarthome.com' },
                { icon: <MapPin size={18} />, label: 'Adres', text: 'Levent, İstanbul' },
              ].map((c, i) => (
                <div key={i} className="contact-detail">
                  <div className="contact-detail-icon">{c.icon}</div>
                  <div><div className="contact-detail-label">{c.label}</div><div className="contact-detail-text">{c.text}</div></div>
                </div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}>
              <div className="contact-form">
                {formSubmitted ? (
                  <div className="form-success">
                    <div className="form-success-icon"><CheckCircle2 size={32} color="#06D6A0" /></div>
                    <h3>Mesajınız Alındı!</h3>
                    <p>En kısa sürede size geri dönüş yapacağız.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Ad Soyad *</label>
                        <input type="text" className={`form-input ${formErrors.name ? 'error' : ''}`} placeholder="Adınız Soyadınız" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        {formErrors.name && <span className="error-text">Bu alan zorunludur</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Telefon</label>
                        <input type="tel" className="form-input" placeholder="0 5XX XXX XX XX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">E-posta *</label>
                      <input type="email" className={`form-input ${formErrors.email ? 'error' : ''}`} placeholder="ornek@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      {formErrors.email && <span className="error-text">Geçerli bir e-posta giriniz</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mesajınız *</label>
                      <textarea className={`form-textarea ${formErrors.message ? 'error' : ''}`} placeholder="Projeniz hakkında bilgi verin..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                      {formErrors.message && <span className="error-text">Lütfen mesajınızı yazınız</span>}
                    </div>
                    <button type="submit" className="form-submit" disabled={formLoading}>
                      {formLoading ? <>Gönderiliyor...</> : <>Mesaj Gönder <Send size={16} /></>}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <img src="/evos_logo.png" alt="EVOS Smarthome" className="footer-logo-image" />
              </div>
              <p className="footer-about">Akıllı ev teknolojilerinde öncü çözümler sunarak yaşam alanlarınızı dönüştürüyoruz.</p>
              <div className="footer-socials">
                <a href="https://www.instagram.com/evossmarthome/" target="_blank" rel="noopener noreferrer" className="footer-social">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="footer-col-title">Çözümler</h4>
              <ul className="footer-links">
                {['Aydınlatma Kontrolü', 'İklimlendirme', 'Güvenlik Sistemleri', 'Ses ve Görüntü', 'Enerji Yönetimi'].map(l => <li key={l}><a href="#" onClick={e => e.preventDefault()}>{l}</a></li>)}
              </ul>
            </div>
            <div>
              <h4 className="footer-col-title">Şirket</h4>
              <ul className="footer-links">
                <li><a href="#nasil" onClick={e => { e.preventDefault(); scrollTo('nasil'); }}>Nasıl Çalışır</a></li>
                <li><a href="#referanslar" onClick={e => { e.preventDefault(); scrollTo('referanslar'); }}>Müşteri Yorumları</a></li>
                <li><a href="#sss" onClick={e => { e.preventDefault(); scrollTo('sss'); }}>SSS</a></li>
                <li><a href="#iletisim" onClick={e => { e.preventDefault(); scrollTo('iletisim'); }}>İletişim</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-col-title">Bültene Katılın</h4>
              <div className="footer-newsletter">
                <p>Akıllı ev dünyasından haberler ve özel teklifler.</p>
                <form className="footer-newsletter-form" onSubmit={e => e.preventDefault()}>
                  <input type="email" className="footer-newsletter-input" placeholder="E-posta adresiniz" />
                  <button type="submit" className="footer-newsletter-btn">Abone Ol</button>
                </form>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} EVOS Smarthome. Tüm hakları saklıdır.</p>
            <div className="footer-bottom-links">
              {/* Daha sonra eklenecek gizlilik sayfaları buraya gelecek */}
            </div>
          </div>
        </div>
      </footer>

      <button className={`scroll-top ${scrollY > 400 ? 'visible' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={20} /></button>
    </div>
  );
};

export default App;
