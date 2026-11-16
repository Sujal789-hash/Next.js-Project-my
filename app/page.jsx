'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Calendar,
  MessageSquare,
  FileText,
  IndianRupee,
  ChevronDown,
  Building,
  CheckCircle2,
  Users,
  Award,
  Compass,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const stats = [
    { label: 'Institutional Capital Deployed', value: '₹7,056 Cr+' },
    { label: 'Active Syndicate Partners', value: '450+' },
    { label: 'Verified Startup Founders', value: '1,200+' },
    { label: 'Pitch Meeting Success Rate', value: '78%' },
  ];

  const steps = [
    {
      step: '01',
      title: 'Curate Startup Thesis',
      desc: 'Build your institutional company profile, upload your audited pitch deck, and set your funding targets with transparent valuation metrics.',
    },
    {
      step: '02',
      title: 'Smart Weighted Matching',
      desc: 'Our transparent 0-100 compatibility engine evaluates industry sweet spots, check size parameters, and stage fit to match you with leading partners.',
    },
    {
      step: '03',
      title: 'Book Direct Pitch Meetings',
      desc: 'Request synchronized calendar slots with zero email friction, integrated Google Meet rooms, and automated double-booking prevention.',
    },
    {
      step: '04',
      title: 'Syndicate & Secure Allocation',
      desc: 'Receive structural deck reviews, monitor round progress with real-time milestone trackers, and close early-stage investment tranches.',
    },
  ];

  const featuredInvestors = [
    {
      name: 'David Sterling',
      role: 'Managing Partner',
      firm: 'Emerald Capital Partners',
      location: 'New York, NY',
      checkRange: '₹42L – ₹2.1 Cr',
      focus: ['FinTech', 'AI & Machine Learning'],
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Victoria Zhao',
      role: 'Founding Partner',
      firm: 'Apex Horizon Ventures',
      location: 'San Francisco, CA',
      checkRange: '₹84L – ₹4.2 Cr',
      focus: ['CleanTech', 'Energy Storage'],
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Aravind Patel',
      role: 'General Partner',
      firm: 'Catalyst Seed Collective',
      location: 'Austin, TX',
      checkRange: '₹8.4L – ₹63L',
      focus: ['B2B SaaS', 'Developer Tools'],
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const featuredStartups = [
    {
      name: 'Zenith AI',
      founder: 'Sarah Chen',
      industry: 'AI & Machine Learning',
      stage: 'Seed',
      ask: '₹1.26 Cr (₹79.8L Secured)',
      val: '₹7.14 Cr',
      traction: '₹35.3L ARR (28% MoM)',
    },
    {
      name: 'GreenPulse Energy',
      founder: 'Marcus Vance',
      industry: 'CleanTech & Energy',
      stage: 'Series A',
      ask: '₹2.52 Cr (₹1.76 Cr Secured)',
      val: '₹13.4 Cr',
      traction: '₹92.4L ARR (19% MoM)',
    },
    {
      name: 'NovaPay Global',
      founder: 'Elena Rostova',
      industry: 'FinTech Infrastructure',
      stage: 'Pre-Seed',
      ask: '₹63L (₹25.2L Secured)',
      val: '₹3.78 Cr',
      traction: '₹7.98L ARR (35% MoM)',
    },
  ];

  const testimonials = [
    {
      quote: 'PitchConnect bypassed the endless cold email labyrinth. Within 12 days, we booked 7 partner meetings and closed our ₹1.26 Cr Seed round lead.',
      name: 'Sarah Chen',
      title: 'Founder & CEO, Zenith AI',
      round: 'Closed ₹1.26 Cr Seed',
    },
    {
      quote: 'The weighted thesis matching and verified pitch deck reviews save our investment committee over 20 hours per week of low-signal screening.',
      name: 'David Sterling',
      title: 'Managing General Partner, Emerald Capital',
      round: 'Deploys ₹336 Cr Fund',
    },
  ];

  const faqs = [
    {
      q: 'How does the PitchConnect Smart Matching Algorithm work?',
      a: 'We evaluate three transparent criteria: sector alignment (35%), funding target against investor check sweet-spot (35%), and stage suitability (30%). We do not use black-box claims; you receive full visibility into why each partner is recommended.',
    },
    {
      q: 'Who can access startup pitch decks?',
      a: 'Pitch decks are securely hosted with authenticated, role-based access. Only accredited and verified investors can view and download full documentation.',
    },
    {
      q: 'Can founders book meetings directly with partners?',
      a: 'Yes. Investors define their weekly availability windows. When a founder requests a slot with a specific agenda, the system checks real-time availability to eliminate double-booking.',
    },
    {
      q: 'Is PitchConnect free to explore for early-stage founders?',
      a: 'Founders can register, assemble their profile, test match scores, and upload pitch decks completely free during active fundraising cycles.',
    },
  ];

  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden sm:pt-40 sm:pb-32">
        {/* Soft background accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-sage/50 via-emerald/10 to-ivory rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="px-4 mx-auto space-y-8 text-center max-w-7xl sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-sage shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald animate-ping" />
            <span className="text-xs font-bold text-forest">The Venture Investment Ecosystem</span>
            
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-charcoal tracking-tight max-w-5xl mx-auto leading-[1.12]">
            Where Ambitious Startups Meet <span className="underline text-forest decoration-emerald decoration-wavy decoration-from-font">Visionary Investors.</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base leading-relaxed sm:text-lg text-charcoal-muted">
            Eliminate cold outreach chaos. PitchConnect unites elite early-stage founders with accredited venture capitalists through smart thesis matching, verified deck diligence, and instant calendar booking.
          </p>

          {/* Call to actions */}
          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" variant="primary" className="w-full shadow-lg sm:w-auto hover:shadow-emerald-glow">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/discover">
              <Button size="lg" variant="secondary" className="w-full border sm:w-auto border-sage-dark/50">
                <Compass className="w-4 h-4 mr-1 text-forest" />
                Explore Investors
              </Button>
            </Link>
          </div>

          {/* Attractive Dashboard Preview Card */}
          <div className="max-w-5xl pt-12 mx-auto">
            <div className="relative p-4 bg-white border shadow-2xl rounded-3xl sm:p-6 border-sage/80">
              <div className="flex items-center justify-between pb-4 text-left border-b border-sage/40">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald" />
                  <span className="ml-2 text-xs font-bold text-charcoal">PitchConnect Protocol // Live Founder Terminal</span>
                </div>
                <Badge variant="gold" size="sm">Platform v2.6</Badge>
              </div>

              {/* Mock Dashboard Interior */}
              <div className="grid grid-cols-1 gap-4 pt-4 text-left md:grid-cols-3">
                <div className="p-4 border rounded-2xl bg-ivory border-sage/60">
                  <span className="text-[11px] font-bold text-charcoal-muted uppercase">Round Status</span>
                  <p className="mt-1 text-2xl font-extrabold text-forest">₹79.8L / ₹1.26 Cr</p>
                  <div className="w-full h-2 mt-3 overflow-hidden rounded-full bg-sage-dark/40">
                    <div className="bg-emerald h-full rounded-full w-[63%]" />
                  </div>
                  <span className="text-[10px] text-emerald-hover font-semibold mt-1.5 block">63% of Seed Round Secured</span>
                </div>

                <div className="p-4 border rounded-2xl bg-ivory border-sage/60">
                  <span className="text-[11px] font-bold text-charcoal-muted uppercase">Pitch Meetings</span>
                  <p className="mt-1 text-2xl font-extrabold text-charcoal">14 Confirmed</p>
                  <p className="mt-2 text-xs text-charcoal-muted">Next: David Sterling (Emerald Capital) â€“ Today 10:30 AM</p>
                </div>

                <div className="p-4 border rounded-2xl bg-ivory border-sage/60">
                  <span className="text-[11px] font-bold text-charcoal-muted uppercase">Thesis Match Rate</span>
                  <p className="mt-1 text-2xl font-extrabold text-emerald">94% Compatibility</p>
                  <p className="mt-2 text-xs text-charcoal-muted">FinTech Infrastructure & Enterprise AI criteria match</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="py-12 text-white bg-forest border-y border-forest-dark">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {stats.map((st, i) => (
              <div key={i} className="space-y-1">
                <p className="text-3xl font-extrabold tracking-tight sm:text-4xl text-emerald-light">{st.value}</p>
                <p className="text-xs font-medium sm:text-sm text-sage/80">{st.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-4 py-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto mb-16 space-y-3 text-center">
          <Badge variant="forest">Streamlined Protocol</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-charcoal">
            How PitchConnect Elevates Fundraising
          </h2>
          <p className="text-sm text-charcoal-muted">
            From verified thesis submission to booked syndicate partner slots in four transparent steps.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {steps.map((step) => (
            <Card key={step.step} className="relative border-sage/70 hover:border-emerald/40">
              <span className="block mb-2 text-3xl font-extrabold text-gold">{step.step}</span>
              <h3 className="mb-2 text-base font-bold text-charcoal">{step.title}</h3>
              <p className="text-xs leading-relaxed text-charcoal-muted">{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Investors */}
      <section className="py-20 bg-ivory-dark/40 border-y border-sage/60">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between mb-12 sm:flex-row sm:items-end">
            <div>
              <Badge variant="gold">Accredited Network</Badge>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-charcoal">
                Featured Venture Capital Partners
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-charcoal-muted">
                Active institutional check writers deploying capital this quarter.
              </p>
            </div>
            <Link href="/discover" className="mt-4 sm:mt-0">
              <Button size="sm" variant="outline">
                View All Partners
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredInvestors.map((inv, idx) => (
              <Card key={idx} className="hover:shadow-card-hover border-sage/70">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={inv.image}
                    alt={inv.name}
                    className="object-cover border-2 shadow-sm w-14 h-14 rounded-2xl border-emerald/30"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-charcoal">{inv.name}</h3>
                    <p className="text-xs font-semibold text-emerald-hover">{inv.role} â€¢ {inv.firm}</p>
                    <p className="text-[11px] text-charcoal-muted">{inv.location}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 mb-3 text-xs border bg-ivory rounded-xl border-sage/60">
                  <span className="font-medium text-charcoal">Typical Check:</span>
                  <span className="font-bold text-forest">{inv.checkRange}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {inv.focus.map((f) => (
                    <Badge key={f} variant="sage" size="sm">{f}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Startups */}
      <section className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between mb-12 sm:flex-row sm:items-end">
          <div>
            <Badge variant="emerald">Deal Flow Pipeline</Badge>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-charcoal">
              Featured Verified Startups
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-charcoal-muted">
              High-traction venture candidates with institutional deck diligence ready.
            </p>
          </div>
          <Link href="/compare" className="mt-4 sm:mt-0">
            <Button size="sm" variant="secondary">
              Open Comparison Matrix
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredStartups.map((stp, idx) => (
            <Card key={idx} className="border-sage/70 hover:shadow-card-hover">
              <div className="flex items-center justify-between pb-3 border-b border-sage/40">
                <h3 className="text-base font-bold text-charcoal">{stp.name}</h3>
                <Badge variant="forest" size="sm">{stp.stage}</Badge>
              </div>
              <p className="mt-2 text-xs text-charcoal-muted">Founded by {stp.founder} â€¢ {stp.industry}</p>

              <div className="grid grid-cols-2 gap-2 p-3 mt-4 text-xs border bg-ivory rounded-xl border-sage/60">
                <div>
                  <span className="text-[10px] text-charcoal-muted uppercase block">Round Ask</span>
                  <span className="font-extrabold text-forest">{stp.ask}</span>
                </div>
                <div>
                  <span className="text-[10px] text-charcoal-muted uppercase block">Valuation</span>
                  <span className="font-extrabold text-charcoal">{stp.val}</span>
                </div>
              </div>
              <p className="text-[11px] font-semibold text-emerald-hover mt-3">
                Current Traction: {stp.traction}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Platform Features Grid */}
      <section id="features" className="py-20 text-white border-t bg-forest-dark border-forest">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto mb-16 space-y-3 text-center">
            <Badge variant="gold">Platform Capabilities</Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Designed For High-Stakes Venture Allocations
            </h2>
            <p className="text-xs sm:text-sm text-sage/80">
              Built on Next.js App Router and Mongoose with enterprise grade security and responsive controls.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-3">
            <div className="p-6 space-y-3 border rounded-3xl bg-forest border-forest-light">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald/20 text-emerald">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Multi-Tier RBAC Security</h3>
              <p className="text-xs leading-relaxed text-sage/80">
                Distinct operational dashboards for Founders, Investors, and Admin supervisors with password confirmation and JWT HTTP-only credentials.
              </p>
            </div>

            <div className="p-6 space-y-3 border rounded-3xl bg-forest border-forest-light">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald/20 text-emerald">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Double-Booking Prevention</h3>
              <p className="text-xs leading-relaxed text-sage/80">
                Server-side calendar slot validation prevents slot collisions and generates synchronized meeting rooms for approved agendas.
              </p>
            </div>

            <div className="p-6 space-y-3 border rounded-3xl bg-forest border-forest-light">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald/20 text-emerald">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Real-Time Funding Tracker</h3>
              <p className="text-xs leading-relaxed text-sage/80">
                Dynamic visual tracking of targeted vs secured capital with Recharts milestones and structured investor review scorecards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <Badge variant="forest">Founder & Investor Endorsements</Badge>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-charcoal">
            Proven Results in Early-Stage Syndication
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {testimonials.map((t, idx) => (
            <Card key={idx} className="p-8 space-y-4 border-sage/70">
              <p className="text-sm italic leading-relaxed text-charcoal">"{t.quote}"</p>
              <div className="flex items-center justify-between pt-4 border-t border-sage/40">
                <div>
                  <h4 className="text-sm font-bold text-charcoal">{t.name}</h4>
                  <p className="text-xs text-charcoal-muted">{t.title}</p>
                </div>
                <Badge variant="gold" size="sm">{t.round}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 border-t bg-ivory-dark/30 border-sage/60">
        <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <Badge variant="forest">Answers & Protocol</Badge>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-charcoal">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="overflow-hidden transition-all bg-white border shadow-xs rounded-2xl border-sage/60"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="flex items-center justify-between w-full p-5 text-sm font-bold text-left text-charcoal hover:text-forest"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-forest transition-transform ${
                      openFaq === idx ? 'rotate-180 text-emerald' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pt-1 pb-5 text-xs leading-relaxed border-t text-charcoal-muted border-sage/30">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

