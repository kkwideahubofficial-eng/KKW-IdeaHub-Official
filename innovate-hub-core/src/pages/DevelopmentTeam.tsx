import React from "react";
import { Link } from "react-router-dom";
import {
  Code,
  Lightbulb,
  BookOpen,
  Users,
  Award,
  ChevronRight,
  Github,
  Linkedin,
  Rocket,
  ShieldCheck,
  Edit3,
  Flag,
  Crown,
  FlaskConical
} from "lucide-react";

// Reusable Premium Title Component (Navy + Small Blue Line Underneath)
const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="text-center space-y-2 mb-6">
    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F172A] tracking-tight">
      {title}
    </h3>
    <div className="w-16 h-[3px] bg-[#2563EB] mx-auto rounded-full" />
    {subtitle && <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed max-w-xl mx-auto">{subtitle}</p>}
  </div>
);

const DevelopmentTeam: React.FC = () => {

  return (
    <div 
      className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] antialiased py-8 sm:py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.04) 0%, transparent 70%)"
      }}
    >
      <div className="max-w-[1200px] mx-auto space-y-12 lg:space-y-16">

        {/* ==========================================
            HERO HEADER SECTION
           ========================================== */}
        <section className="relative py-0 sm:py-2 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
                Our Story. <span className="text-[#2563EB]">Our People.</span>
              </h1>
              <p className="text-sm sm:text-base text-[#64748B] max-w-lg leading-relaxed font-medium">
                Behind every innovation is a team that believes in the power of ideas, guidance, and collaboration.
              </p>
              <p className="text-xs sm:text-sm text-[#64748B] font-medium">
                Meet the{" "}
                <span className="font-bold text-[#2563EB] hover:underline cursor-pointer">
                  mentors
                </span>{" "}
                who guide us and the{" "}
                <span className="font-bold text-[#2563EB] hover:underline cursor-pointer">
                  students
                </span>{" "}
                who turn ideas into impactful solutions.
              </p>
            </div>

            {/* Right Hero Illustration (Seamless Multiply Blend) */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end items-center relative">
              <img 
                src="/images/exact-hero-team.png" 
                alt="Development Team Collaboration" 
                className="w-full max-w-md lg:max-w-md max-h-[280px] sm:max-h-[320px] h-auto object-contain mix-blend-multiply opacity-90 transition-opacity hover:opacity-100"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = "/images/hero-team.png";
                }}
              />
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION 01: CHIEF MENTOR & HOD
           ========================================== */}
        <section className="max-w-3xl lg:max-w-4xl mx-auto w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.1)] transition-all">
          <SectionHeader 
            title="Vision & Guidance" 
            subtitle="Great ideas need the right direction. Our journey begins with visionary leadership." 
          />
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Photo with Blue Border */}
            <div className="relative shrink-0">
              <div className="w-44 h-52 rounded-2xl overflow-hidden border-2 border-[#2563EB] shadow-sm bg-slate-50 flex items-center justify-center">
                <img 
                  src="/images/yogita_pagar.jpg" 
                  alt="Dr. Yogita Pagar-Bhise" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { 
                    e.currentTarget.onerror = null; 
                    e.currentTarget.src = "https://ui-avatars.com/api/?name=Yogita+Pagar+Bhise&background=eff6ff&color=2563eb&bold=true"; 
                  }} 
                />
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-md whitespace-nowrap">
                <Crown className="w-3 h-3 text-amber-300" />
                <span>HOD &amp; MENTOR</span>
              </div>
            </div>
            {/* Details */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">Dr. Yogita Pagar-Bhise</h2>
              <p className="text-sm font-semibold text-[#2563EB]">Head of Department (HOD)</p>
              <p className="text-xs sm:text-sm text-[#64748B] font-medium">
                Computer Science and Design Department,<br />K. K. Wagh Institute of Engineering Education and Research
              </p>
              <div className="mt-4 p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-left relative text-xs sm:text-sm text-slate-700 font-medium italic">
                <span className="text-[#2563EB] font-serif text-2xl leading-none mr-1">“</span>
                Innovation begins when students are trusted to solve real-world problems.
                <span className="text-[#2563EB] font-serif text-2xl leading-none ml-1">”</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION 02: FACULTY GUIDES
           ========================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_8px_24px_rgba(15,23,42,0.06)] space-y-6">
          
          {/* Header matching screenshot */}
          <div className="text-center space-y-1.5 mb-6">
            <div className="flex items-center justify-center gap-2.5 text-blue-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <div className="w-10 sm:w-16 h-[1px] bg-blue-200" />
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Guiding Minds, Inspiring Innovation
              </h3>
              <div className="w-10 sm:w-16 h-[1px] bg-blue-200" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Our faculty guides who support, mentor and shape the journey.
            </p>
          </div>

          {/* 4 Faculty Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Guide 1: Prof. Amit S. Patil */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-center flex flex-col items-center justify-between space-y-3.5 hover:shadow-md transition-all relative">
              <span className="absolute top-3 left-4 text-blue-300 text-sm font-bold select-none">+</span>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center">
                <img src="/images/team/amit_patil.jpg" alt="Prof. Amit S. Patil" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://ui-avatars.com/api/?name=Amit+Patil&background=eff6ff&color=2563eb&bold=true"; }} />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-sm sm:text-base text-slate-900">Prof. Amit S. Patil</h4>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 text-blue-600 border border-blue-100 text-xs font-bold">
                  <Code className="w-3.5 h-3.5" /> Technical Guide
                </span>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed max-w-[200px] mx-auto">Guiding the technical architecture and development.</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <Users className="w-4 h-4" />
              </div>
            </div>

            {/* Guide 2: Prof. Pooja R. Deshmukh */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-center flex flex-col items-center justify-between space-y-3.5 hover:shadow-md transition-all relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center">
                <img src="/images/team/pooja_deshmukh.jpg" alt="Prof. Pooja R. Deshmukh" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://ui-avatars.com/api/?name=Pooja+Deshmukh&background=ecfdf5&color=059669&bold=true"; }} />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-sm sm:text-base text-slate-900">Prof. Pooja R. Deshmukh</h4>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/80 text-emerald-600 border border-emerald-100 text-xs font-bold">
                  <Lightbulb className="w-3.5 h-3.5" /> Innovation Guide
                </span>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed max-w-[200px] mx-auto">Inspiring innovation and problem-solving approaches.</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <Users className="w-4 h-4" />
              </div>
            </div>

            {/* Guide 3: Prof. Mayur B. Shinde */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-center flex flex-col items-center justify-between space-y-3.5 hover:shadow-md transition-all relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center">
                <img src="/images/team/mayur_shinde.jpg" alt="Prof. Mayur B. Shinde" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://ui-avatars.com/api/?name=Mayur+Shinde&background=f3e8ff&color=7e22ce&bold=true"; }} />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-sm sm:text-base text-slate-900">Prof. Mayur B. Shinde</h4>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50/80 text-purple-600 border border-purple-100 text-xs font-bold">
                  <FlaskConical className="w-3.5 h-3.5" /> Research Guide
                </span>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed max-w-[200px] mx-auto">Supporting research, validation and quality improvement.</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-purple-50 text-[#7E22CE] flex items-center justify-center shadow-inner">
                <Users className="w-4 h-4" />
              </div>
            </div>

            {/* Guide 4: Prof. Neha V. Jadhav */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-center flex flex-col items-center justify-between space-y-3.5 hover:shadow-md transition-all relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center">
                <img src="/images/team/neha_jadhav.jpg" alt="Prof. Neha V. Jadhav" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://ui-avatars.com/api/?name=Neha+Jadhav&background=fff7ed&color=c2410c&bold=true"; }} />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-sm sm:text-base text-slate-900">Prof. Neha V. Jadhav</h4>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50/80 text-orange-600 border border-orange-100 text-xs font-bold">
                  <BookOpen className="w-3.5 h-3.5" /> Faculty Guide
                </span>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed max-w-[200px] mx-auto">Providing academic support and overall mentorship.</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner">
                <Users className="w-4 h-4" />
              </div>
            </div>

          </div>
        </section>

        {/* ==========================================
            SECTION 03: BUILT BY STUDENTS
           ========================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.06)] space-y-6">
          <SectionHeader 
            title="Built by Students" 
            subtitle="Driven by passion, we turn ideas into real-world solutions with dedication." 
          />
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full">
            {/* Left Student: Kalpesh Bire (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-4 sm:gap-5 justify-self-center lg:justify-self-start">
              <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-full overflow-hidden border-2 border-[#2563EB] shadow-sm bg-white">
                <img src="/images/team/kalpesh.jpg" alt="Kalpesh Bire" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://ui-avatars.com/api/?name=Kalpesh+Bire&background=eff6ff&color=2563eb&bold=true"; }} />
              </div>
              <div className="space-y-1.5 flex-1">
                <h4 className="font-bold text-lg text-[#0F172A] tracking-tight">Kalpesh Bire</h4>
                <p className="text-xs font-bold text-[#2563EB]">Full Stack Developer</p>
                <p className="text-xs text-[#64748B] leading-relaxed max-w-[220px] mx-auto sm:mx-0">Developed the backend, frontend, system architecture and core functionalities.</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <a href="https://github.com/KalpeshBire" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-black transition-colors" title="GitHub"><Github className="w-3.5 h-3.5 fill-white" /></a>
                  <a href="https://linkedin.com/in/kalpeshbire" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center hover:bg-blue-700 transition-colors" title="LinkedIn"><Linkedin className="w-3.5 h-3.5 fill-white" /></a>
                </div>
              </div>
            </div>

            {/* Center Badge Graphic (2 Columns - Mathematically 100% Centered) */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center text-center my-auto py-2">
              <div className="flex items-center justify-center w-full">
                <div className="hidden lg:block w-3 sm:w-5 h-[1px] bg-blue-200 relative"><div className="absolute left-0 w-1.5 h-1.5 bg-[#2563EB] rounded-full -top-[2.5px]" /></div>
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-dashed border-[#2563EB] bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] mx-1 shrink-0 shadow-sm">
                  <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-[#2563EB]" />
                </div>
                <div className="hidden lg:block w-3 sm:w-5 h-[1px] bg-blue-200 relative"><div className="absolute right-0 w-1.5 h-1.5 bg-[#2563EB] rounded-full -top-[2.5px]" /></div>
              </div>
              <p className="text-[10px] font-bold text-[#0F172A] mt-2 leading-tight whitespace-nowrap">Teamwork<br />Makes Innovation</p>
            </div>

            {/* Right Student: Roshan Gaikwad (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-4 sm:gap-5 justify-self-center lg:justify-self-end">
              <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-full overflow-hidden border-2 border-[#2563EB] shadow-sm bg-white">
                <img src="/images/team/roshan.jpg" alt="Roshan Gaikwad" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://ui-avatars.com/api/?name=Roshan+Gaikwad&background=eff6ff&color=2563eb&bold=true"; }} />
              </div>
              <div className="space-y-1.5 flex-1">
                <h4 className="font-bold text-lg text-[#0F172A] tracking-tight">Roshan Gaikwad</h4>
                <p className="text-xs font-bold text-[#2563EB]">UI/UX &amp; Frontend Developer</p>
                <p className="text-xs text-[#64748B] leading-relaxed max-w-[220px] mx-auto sm:mx-0">Designed the UI/UX, implemented the frontend and ensured a seamless experience.</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <a href="https://github.com/roshangaikwad" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-black transition-colors" title="GitHub"><Github className="w-3.5 h-3.5 fill-white" /></a>
                  <a href="https://linkedin.com/in/roshangaikwad" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center hover:bg-blue-700 transition-colors" title="LinkedIn"><Linkedin className="w-3.5 h-3.5 fill-white" /></a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION 04: DEVELOPMENT JOURNEY
           ========================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.06)] space-y-6">
          <SectionHeader 
            title="Development Journey" 
            subtitle="From an idea to a fully functional platform – every step matters." 
          />
          
          {/* 6 Steps Flow in Single Line with Vibrant Pastel Colors */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-3 overflow-x-auto pb-2 pt-2 no-scrollbar">
            
            {/* Step 1: Idea Proposed */}
            <div className="flex-1 min-w-[95px] max-w-[130px] bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3 sm:p-4 text-center flex flex-col items-center justify-center space-y-3 shrink-0 aspect-[4/5] shadow-sm hover:border-amber-400 hover:bg-amber-50 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100/80 text-amber-600 border border-amber-200 flex items-center justify-center shadow-inner">
                <Lightbulb className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-amber-950 leading-tight">
                Idea<br />Proposed
              </span>
            </div>

            <div className="text-amber-300 shrink-0">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>

            {/* Step 2: Mentors Guided */}
            <div className="flex-1 min-w-[95px] max-w-[130px] bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 sm:p-4 text-center flex flex-col items-center justify-center space-y-3 shrink-0 aspect-[4/5] shadow-sm hover:border-emerald-400 hover:bg-emerald-50 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100/80 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-inner">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-emerald-950 leading-tight">
                Mentors<br />Guided
              </span>
            </div>

            <div className="text-emerald-300 shrink-0">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>

            {/* Step 3: Planning & Design */}
            <div className="flex-1 min-w-[95px] max-w-[130px] bg-purple-50/60 border border-purple-200/80 rounded-2xl p-3 sm:p-4 text-center flex flex-col items-center justify-center space-y-3 shrink-0 aspect-[4/5] shadow-sm hover:border-purple-400 hover:bg-purple-50 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100/80 text-purple-600 border border-purple-200 flex items-center justify-center shadow-inner">
                <Edit3 className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-purple-950 leading-tight">
                Planning &amp;<br />Design
              </span>
            </div>

            <div className="text-purple-300 shrink-0">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>

            {/* Step 4: Development */}
            <div className="flex-1 min-w-[95px] max-w-[130px] bg-blue-50/60 border border-blue-200/80 rounded-2xl p-3 sm:p-4 text-center flex flex-col items-center justify-center space-y-3 shrink-0 aspect-[4/5] shadow-sm hover:border-blue-400 hover:bg-blue-50 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100/80 text-blue-600 border border-blue-200 flex items-center justify-center shadow-inner">
                <Code className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-blue-950 leading-tight">
                Development
              </span>
            </div>

            <div className="text-blue-300 shrink-0">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>

            {/* Step 5: Testing & Validation */}
            <div className="flex-1 min-w-[95px] max-w-[130px] bg-teal-50/60 border border-teal-200/80 rounded-2xl p-3 sm:p-4 text-center flex flex-col items-center justify-center space-y-3 shrink-0 aspect-[4/5] shadow-sm hover:border-teal-400 hover:bg-teal-50 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-100/80 text-teal-600 border border-teal-200 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-teal-950 leading-tight">
                Testing &amp;<br />Validation
              </span>
            </div>

            <div className="text-teal-300 shrink-0">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>

            {/* Step 6: Deployment & Launch */}
            <div className="flex-1 min-w-[95px] max-w-[130px] bg-violet-50/60 border border-violet-200/80 rounded-2xl p-3 sm:p-4 text-center flex flex-col items-center justify-center space-y-3 shrink-0 aspect-[4/5] shadow-sm hover:border-violet-400 hover:bg-violet-50 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-violet-100/80 text-violet-600 border border-violet-200 flex items-center justify-center shadow-inner">
                <Rocket className="w-5 h-5 text-violet-600" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-violet-950 leading-tight">
                Deployment &amp;<br />Launch
              </span>
            </div>

          </div>
        </section>

        {/* ==========================================
            SECTION 05: GRATITUDE & CREDITS
           ========================================== */}
        <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          
          {/* Left Side: Quote Badge + Heartfelt Thanks */}
          <div className="flex items-center gap-4 sm:gap-6 flex-1 text-left">
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] flex items-center justify-center shadow-sm">
                <span className="font-serif text-3xl sm:text-4xl font-black text-[#2563EB] leading-none select-none">
                  “
                </span>
              </div>
            </div>

            <div className="space-y-1 flex-1">
              <h4 className="font-extrabold text-base sm:text-lg text-[#0F172A] tracking-tight">
                Heartfelt Thanks
              </h4>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-md font-medium">
                We extend our sincere gratitude to our mentors for their continuous support, valuable guidance and encouragement throughout this journey.
              </p>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block w-[1px] h-20 bg-[#E2E8F0] mx-2 shrink-0" />

          {/* Right Side: Credits Text + Handshake */}
          <div className="flex items-center justify-between gap-4 flex-1 w-full md:w-auto">
            <div className="space-y-1">
              <p className="text-xs text-[#64748B] font-medium">
                Designed &amp; Developed with <span className="text-red-500">❤️</span> by
              </p>
              <h4 className="text-base sm:text-xl font-bold text-[#2563EB] tracking-tight flex items-center gap-2 flex-wrap">
                <span>Kalpesh Bire</span>
                <span className="text-slate-400 font-normal text-sm">&amp;</span>
                <span>Roshan Gaikwad</span>
              </h4>
              <p className="text-[11px] sm:text-xs text-[#64748B] font-medium">
                AICTE IDEA Lab – Innovation for a Better Tomorrow
              </p>
            </div>

            <div className="shrink-0 text-[#2563EB]">
              <svg viewBox="0 0 100 80" className="w-16 h-16 sm:w-20 sm:h-20 fill-none stroke-[#2563EB] stroke-[2] stroke-linecap-round stroke-linejoin-round">
                <path d="M 10 30 L 30 30 C 35 30 40 33 44 38 L 48 43 L 53 38 C 57 33 62 30 67 30 L 90 30" />
                <path d="M 10 48 L 22 48 C 27 48 32 50 37 54 L 42 58 C 46 61 50 61 54 58 L 59 54 C 64 50 69 48 74 48 L 90 48" />
                <path d="M 38 42 C 41 42 44 45 44 48 C 44 51 41 54 38 54" />
                <path d="M 44 48 C 47 48 50 51 50 54 C 50 57 47 60 44 60" />
                <path d="M 50 54 C 53 54 56 57 56 60 C 56 63 53 66 50 66" />
                <path d="M 56 60 C 59 60 62 63 62 66 C 62 69 59 72 56 72" />
              </svg>
            </div>
          </div>

        </section>
        
      </div>
    </div>
  );
};

export default DevelopmentTeam;
