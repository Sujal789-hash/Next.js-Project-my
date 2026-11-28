/*
 * LOCAL-ONLY, NON-DESTRUCTIVE SEED SCRIPT
 *
 *   PITCHCONNECT_ALLOW_SEED=1 npm run seed
 *
 * - Refuses to run when NODE_ENV=production.
 * - Requires an explicit opt-in flag so it cannot run accidentally.
 * - Uses valid ObjectIds for every reference.
 * - Uses the same bcrypt hashing helper as the application.
 * - Only inserts records that are missing ($setOnInsert). It never deletes,
 *   drops, clears, or overwrites existing collections or documents.
 */
const mongoose = require('mongoose');
const { hashPassword } = require('../lib/password');

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed: NODE_ENV=production. Run this script only in development.');
  process.exit(1);
}

if (process.env.PITCHCONNECT_ALLOW_SEED !== '1') {
  console.error('Refusing to seed: set PITCHCONNECT_ALLOW_SEED=1 to confirm the local seed operation.');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Refusing to seed: MONGODB_URI is required.');
  process.exit(1);
}

const oid = () => new mongoose.Types.ObjectId();
const id = () => oid().toString();

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    password: { type: String, required: true },
    role: { type: String, enum: ['startup', 'investor', 'admin'], default: 'startup' },
    avatar: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'pending_verification', 'suspended'], default: 'active' },
  },
  { timestamps: true }
);

const StartupSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startupName: { type: String, required: true },
    founderName: { type: String, required: true },
    logo: { type: String, default: '' },
    industry: { type: String, required: true },
    description: { type: String, required: true, maxlength: 2000 },
    website: { type: String, default: '' },
    location: { type: String, required: true },
    foundedYear: { type: Number, default: new Date().getFullYear() },
    teamSize: { type: String, default: '1-10' },
    startupStage: { type: String, default: 'Seed' },
    businessModel: { type: String, default: 'B2B SaaS' },
    targetAudience: { type: String, default: '' },
    fundingRequired: { type: Number, required: true, default: 500000 },
    fundingRaised: { type: Number, default: 0 },
    currentValuation: { type: Number, default: 3000000 },
    revenueInfo: {
      arr: { type: Number, default: 0 },
      growthRate: { type: String, default: '15% MoM' },
      payingCustomers: { type: Number, default: 0 },
    },
    pitchDeckUrl: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const InvestorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String, required: true },
    profileImage: { type: String, default: '' },
    organization: { type: String, required: true },
    title: { type: String, default: 'Managing Partner' },
    biography: { type: String, required: true, maxlength: 2000 },
    location: { type: String, required: true },
    investmentInterests: { type: [String], default: [] },
    preferredIndustries: { type: [String], default: [] },
    checkSizeMin: { type: Number, required: true },
    checkSizeMax: { type: Number, required: true },
    preferredStages: { type: [String], default: [] },
    portfolioCompanies: [{ name: { type: String, required: true }, website: String, year: Number }],
    availableMeetingSlots: [
      { dayOfWeek: String, startTime: String, endTime: String },
    ],
    contactPreferences: {
      emailMeetingAlerts: { type: Boolean, default: true },
      acceptDirectPitches: { type: Boolean, default: true },
      preferredMeetingLength: { type: Number, default: 30 },
    },
    isVerified: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PitchDeckSchema = new mongoose.Schema(
  {
    startupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true, index: true },
    title: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileUrl: { type: String, required: true },
    version: { type: Number, default: 1 },
    viewsCount: { type: Number, default: 0 },
    downloadsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const MeetingSchema = new mongoose.Schema(
  {
    startupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true, index: true },
    founderUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investor', required: true, index: true },
    investorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    duration: { type: Number, default: 30 },
    agenda: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, default: 'Pending' },
    meetingLink: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
  },
  { timestamps: true }
);

const ReviewSchema = new mongoose.Schema(
  {
    startupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true, index: true },
    investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investor', required: true, index: true },
    pitchDeckId: { type: mongoose.Schema.Types.ObjectId, ref: 'PitchDeck' },
    businessModelRating: { type: Number, required: true, default: 4 },
    marketOpportunityRating: { type: Number, required: true, default: 4 },
    productInnovationRating: { type: Number, required: true, default: 4 },
    financialProjectionsRating: { type: Number, required: true, default: 4 },
    overallRating: { type: Number, required: true, default: 4 },
    writtenFeedback: { type: String, required: true },
    interestLevel: { type: String, default: 'Moderate' },
  },
  { timestamps: true }
);

const VerificationSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: ['startup', 'investor'], required: true, index: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    documents: [{ name: { type: String, required: true }, url: { type: String, required: true }, docType: String }],
    adminNotes: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
  },
  { timestamps: true }
);

const ConversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    startupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup' },
    investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investor' },
    lastMessage: {
      text: { type: String, default: '' },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    },
    unreadCounts: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

const MessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['startup', 'investor', 'admin'], required: true },
    content: { type: String, required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'meeting_request' },
    link: { type: String, default: '/dashboard' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const FavoriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetType: { type: String, enum: ['investor', 'startup'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);
FavoriteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Startup = mongoose.models.Startup || mongoose.model('Startup', StartupSchema);
const Investor = mongoose.models.Investor || mongoose.model('Investor', InvestorSchema);
const PitchDeck = mongoose.models.PitchDeck || mongoose.model('PitchDeck', PitchDeckSchema);
const Meeting = mongoose.models.Meeting || mongoose.model('Meeting', MeetingSchema);
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
const Verification = mongoose.models.Verification || mongoose.model('Verification', VerificationSchema);
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
const Favorite = mongoose.models.Favorite || mongoose.model('Favorite', FavoriteSchema);

const DUMMY_PDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
const UNSPLASH = (photo) => `https://images.unsplash.com/${photo}?w=150&auto=format&fit=crop&q=80`;

const userSpecs = [
  { key: 'admin', fullName: 'Alexandra Sterling', email: 'admin@pitchconnect.com', phone: '+1 415 889 0100', password: 'admin123', role: 'admin', avatar: UNSPLASH('photo-1573496359142-b8d87734a5a2'), isVerified: true },
  { key: 'founder1', fullName: 'Sarah Chen', email: 'sarah.chen@zenithai.com', phone: '+1 415 555 0142', password: 'founder123', role: 'startup', avatar: UNSPLASH('photo-1580489944761-15a19d654956'), isVerified: true },
  { key: 'founder2', fullName: 'Marcus Vance', email: 'marcus@greenpulse.io', phone: '+1 206 555 0188', password: 'founder123', role: 'startup', avatar: UNSPLASH('photo-1534528741775-53994a69daeb'), isVerified: true },
  { key: 'founder3', fullName: 'Elena Rostova', email: 'elena@novapay.co', phone: '+1 650 555 0199', password: 'founder123', role: 'startup', avatar: UNSPLASH('photo-1573497019940-1c28c88b4f3e'), isVerified: false },
  { key: 'investor1', fullName: 'David Sterling', email: 'david@emeraldventures.vc', phone: '+1 212 555 0134', password: 'investor123', role: 'investor', avatar: UNSPLASH('photo-1507003211169-0a1dd7228f2d'), isVerified: true },
  { key: 'investor2', fullName: 'Victoria Zhao', email: 'victoria@apexhorizon.com', phone: '+1 650 555 0167', password: 'investor123', role: 'investor', avatar: UNSPLASH('photo-1544005313-94ddf0286df2'), isVerified: true },
  { key: 'investor3', fullName: 'Aravind Patel', email: 'aravind@catalystseed.io', phone: '+1 415 555 0172', password: 'investor123', role: 'investor', avatar: UNSPLASH('photo-1500648767791-00dcc994a43e'), isVerified: true },
];

const startupSpecs = [
  { key: 'stp1', userKey: 'founder1', startupName: 'Zenith AI', founderName: 'Sarah Chen', logo: UNSPLASH('photo-1618005182384-a83a8bd57fbe'), industry: 'AI & Machine Learning', description: 'Next-generation multimodal reasoning platform for automated compliance workflows and institutional risk orchestration in enterprise banking.', website: 'https://zenithai-example.com', location: 'San Francisco, CA', foundedYear: 2024, teamSize: '8-15', startupStage: 'Seed', businessModel: 'B2B SaaS', targetAudience: 'Tier 1 and Tier 2 financial institutions', fundingRequired: 1500000, fundingRaised: 950000, currentValuation: 8500000, revenueInfo: { arr: 420000, growthRate: '28% MoM', payingCustomers: 14 }, pitchDeckUrl: DUMMY_PDF, isVerified: true, isFeatured: true },
  { key: 'stp2', userKey: 'founder2', startupName: 'GreenPulse Energy', founderName: 'Marcus Vance', logo: UNSPLASH('photo-1509391365360-2e959784a276'), industry: 'CleanTech & Energy', description: 'Decentralized microgrid battery management with predictive weather modeling and real-time peak load reduction for industrial facilities.', website: 'https://greenpulse-energy.io', location: 'Seattle, WA', foundedYear: 2023, teamSize: '12-25', startupStage: 'Series A', businessModel: 'Enterprise', targetAudience: 'Commercial real estate developers and utilities', fundingRequired: 3000000, fundingRaised: 2100000, currentValuation: 16000000, revenueInfo: { arr: 1100000, growthRate: '19% MoM', payingCustomers: 8 }, pitchDeckUrl: DUMMY_PDF, isVerified: true, isFeatured: true },
  { key: 'stp3', userKey: 'founder3', startupName: 'NovaPay Global', founderName: 'Elena Rostova', logo: UNSPLASH('photo-1559526324-4b87b5e36e44'), industry: 'FinTech', description: 'Zero-fee instant cross-border settlement rails for global remote teams with built-in multi-currency treasury.', website: 'https://novapay-example.co', location: 'New York, NY', foundedYear: 2025, teamSize: '4-8', startupStage: 'Pre-Seed', businessModel: 'B2B SaaS', targetAudience: 'Global tech companies and remote workforce platforms', fundingRequired: 750000, fundingRaised: 300000, currentValuation: 4500000, revenueInfo: { arr: 95000, growthRate: '35% MoM', payingCustomers: 32 }, pitchDeckUrl: DUMMY_PDF, isVerified: false, isFeatured: false },
];

const investorSpecs = [
  { key: 'inv1', userKey: 'investor1', fullName: 'David Sterling', organization: 'Emerald Capital Partners', title: 'Managing General Partner', profileImage: UNSPLASH('photo-1507003211169-0a1dd7228f2d'), biography: 'Over 16 years leading early-stage venture investments in FinTech, Enterprise SaaS, and Applied AI. Formerly partner at Accel Europe.', location: 'New York, NY', investmentInterests: ['FinTech Infrastructure', 'Enterprise AI', 'RegTech'], preferredIndustries: ['FinTech', 'AI & Machine Learning', 'SaaS & Enterprise'], checkSizeMin: 500000, checkSizeMax: 2500000, preferredStages: ['Seed', 'Series A'], portfolioCompanies: [{ name: 'Stripe (Early syndicate)', website: 'stripe.com', year: 2017 }, { name: 'Ramp Protocol', website: 'ramp.com', year: 2021 }], availableMeetingSlots: [{ dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '12:00' }, { dayOfWeek: 'Wednesday', startTime: '14:00', endTime: '17:00' }], contactPreferences: { emailMeetingAlerts: true, acceptDirectPitches: true, preferredMeetingLength: 30 }, isVerified: true, isFeatured: true },
  { key: 'inv2', userKey: 'investor2', fullName: 'Victoria Zhao', organization: 'Apex Horizon Ventures', title: 'Founding Partner', profileImage: UNSPLASH('photo-1544005313-94ddf0286df2'), biography: 'Focused on deep tech, clean energy transition, and climate resilience technologies backed by sustainable tech funds.', location: 'San Francisco, CA', investmentInterests: ['Energy Storage', 'CleanTech', 'Grid Intelligence'], preferredIndustries: ['CleanTech & Energy', 'AI & Machine Learning', 'BioTech'], checkSizeMin: 1000000, checkSizeMax: 5000000, preferredStages: ['Seed', 'Series A', 'Series B+'], portfolioCompanies: [{ name: 'VoltIQ Grid', website: 'voltiq.energy', year: 2022 }], availableMeetingSlots: [{ dayOfWeek: 'Monday', startTime: '13:00', endTime: '16:00' }], contactPreferences: { emailMeetingAlerts: true, acceptDirectPitches: true, preferredMeetingLength: 45 }, isVerified: true, isFeatured: true },
  { key: 'inv3', userKey: 'investor3', fullName: 'Aravind Patel', organization: 'Catalyst Seed Collective', title: 'Managing Partner', profileImage: UNSPLASH('photo-1500648767791-00dcc994a43e'), biography: 'High-conviction, fast-moving seed syndicate writing first institutional checks for ambitious technical founders and developer tools.', location: 'Austin, TX', investmentInterests: ['Developer Tools', 'AI Infrastructure', 'Open Source'], preferredIndustries: ['AI & Machine Learning', 'SaaS & Enterprise', 'Cybersecurity'], checkSizeMin: 100000, checkSizeMax: 750000, preferredStages: ['Ideation', 'Pre-Seed', 'Seed'], portfolioCompanies: [{ name: 'CodeForge CLI', website: 'codeforge.dev', year: 2024 }], availableMeetingSlots: [{ dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '12:00' }], contactPreferences: { emailMeetingAlerts: true, acceptDirectPitches: true, preferredMeetingLength: 30 }, isVerified: true, isFeatured: true },
];

async function upsertMissing(Model, filter, doc) {
  // $setOnInsert means existing documents are left untouched.
  return Model.findOneAndUpdate(filter, { $setOnInsert: doc }, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  }).lean();
}

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await User.init();

  const userIds = {};
  for (const spec of userSpecs) {
    const { key, password, ...rest } = spec;
    const hashedPassword = await hashPassword(password);
    const doc = await upsertMissing(User, { email: rest.email }, { ...rest, password: hashedPassword, status: 'active' });
    userIds[key] = doc._id;
  }

  const startupIds = {};
  for (const spec of startupSpecs) {
    const { key, userKey, ...rest } = spec;
    const doc = await upsertMissing(Startup, { userId: userIds[userKey] }, { ...rest, userId: userIds[userKey] });
    startupIds[key] = doc._id;
  }

  const investorIds = {};
  for (const spec of investorSpecs) {
    const { key, userKey, ...rest } = spec;
    const doc = await upsertMissing(Investor, { userId: userIds[userKey] }, { ...rest, userId: userIds[userKey] });
    investorIds[key] = doc._id;
  }

  const deckSpecs = [
    { key: 'pdk1', startupKey: 'stp1', title: 'Zenith AI - Seed Deck.pdf', fileName: 'ZenithAI_Seed_PitchDeck.pdf', fileSize: 4280000, fileUrl: DUMMY_PDF, version: 2, viewsCount: 38, downloadsCount: 16, isActive: true, notes: 'Includes Q4 traction and audited pilot results.' },
    { key: 'pdk2', startupKey: 'stp2', title: 'GreenPulse Energy - Series A Memo.pdf', fileName: 'GreenPulse_SeriesA_Deck.pdf', fileSize: 6120000, fileUrl: DUMMY_PDF, version: 1, viewsCount: 52, downloadsCount: 29, isActive: true, notes: 'Contains battery benchmarking and utility pilot contracts.' },
  ];
  const deckIds = {};
  for (const spec of deckSpecs) {
    const { key, startupKey, ...rest } = spec;
    const doc = await upsertMissing(PitchDeck, { startupId: startupIds[startupKey], fileName: rest.fileName }, { ...rest, startupId: startupIds[startupKey] });
    deckIds[key] = doc._id;
  }

  const meetingSpecs = [
    { startupKey: 'stp1', founderKey: 'founder1', investorKey: 'inv1', investorUserKey: 'investor1', date: '2026-11-18', startTime: '10:30', endTime: '11:00', duration: 30, agenda: 'Zenith AI Seed Round Deep Dive', description: 'Discuss current round, pilot metrics, and bank integration roadmap.', status: 'Accepted', meetingLink: 'https://meet.google.com/pc-zenith-demo' },
    { startupKey: 'stp2', founderKey: 'founder2', investorKey: 'inv2', investorUserKey: 'investor2', date: '2026-11-20', startTime: '14:00', endTime: '14:45', duration: 45, agenda: 'GreenPulse Series A CleanTech Discussion', description: 'Walkthrough of utility hardware deployments and margin trajectory.', status: 'Accepted', meetingLink: 'https://meet.google.com/pc-greenpulse-demo' },
  ];
  for (const spec of meetingSpecs) {
    const { startupKey, founderKey, investorKey, investorUserKey, ...rest } = spec;
    await upsertMissing(
      Meeting,
      { founderUserId: userIds[founderKey], investorId: investorIds[investorKey], date: rest.date, startTime: rest.startTime },
      { ...rest, startupId: startupIds[startupKey], founderUserId: userIds[founderKey], investorId: investorIds[investorKey], investorUserId: userIds[investorUserKey] }
    );
  }

  const reviewSpecs = [
    { startupKey: 'stp1', investorKey: 'inv1', deckKey: 'pdk1', businessModelRating: 5, marketOpportunityRating: 5, productInnovationRating: 4, financialProjectionsRating: 4, overallRating: 5, writtenFeedback: 'Exceptional clarity on regulatory moat and customer acquisition economics.', interestLevel: 'High' },
    { startupKey: 'stp2', investorKey: 'inv2', deckKey: 'pdk2', businessModelRating: 4, marketOpportunityRating: 5, productInnovationRating: 5, financialProjectionsRating: 4, overallRating: 5, writtenFeedback: 'Strong technical validation on microgrid peak shaving and hardware margins.', interestLevel: 'High' },
  ];
  for (const spec of reviewSpecs) {
    const { startupKey, investorKey, deckKey, ...rest } = spec;
    await upsertMissing(
      Review,
      { startupId: startupIds[startupKey], investorId: investorIds[investorKey] },
      { ...rest, startupId: startupIds[startupKey], investorId: investorIds[investorKey], pitchDeckId: deckIds[deckKey] }
    );
  }

  const verificationSpecs = [
    { key: 'ver1', targetType: 'startup', targetKey: 'stp3', userKey: 'founder3', status: 'Pending', documents: [{ name: 'NovaPay_Certificate.pdf', url: DUMMY_PDF, docType: 'Incorporation Articles' }], adminNotes: 'Awaiting secondary KYC confirmation.' },
    { key: 'ver2', targetType: 'investor', targetKey: 'inv1', userKey: 'investor1', status: 'Approved', documents: [{ name: 'EmeraldCapital_Accreditation.pdf', url: DUMMY_PDF, docType: 'Institutional Registration' }], adminNotes: 'Institutional fund verified.' },
  ];
  for (const spec of verificationSpecs) {
    const { key, targetType, targetKey, userKey, ...rest } = spec;
    const targetId = targetType === 'startup' ? startupIds[targetKey] : investorIds[targetKey];
    await upsertMissing(
      Verification,
      { targetType, targetId },
      { ...rest, targetType, targetId, userId: userIds[userKey] }
    );
  }

  const convSpecs = [
    { key: 'conv1', founderKey: 'founder1', investorKey: 'investor1', startupKey: 'stp1', invKey: 'inv1', text: 'Looking forward to our discussion next Tuesday at 10:30 AM.', senderKey: 'investor1' },
  ];
  const convIds = {};
  for (const spec of convSpecs) {
    const { key, founderKey, investorKey, startupKey, invKey, text, senderKey } = spec;
    const participants = [userIds[founderKey], userIds[investorKey]];
    let conv = await Conversation.findOne({ participants: { $all: participants } }).lean();
    if (!conv) {
      conv = await Conversation.create({
        participants,
        startupId: startupIds[startupKey],
        investorId: investorIds[invKey],
        lastMessage: { text, senderId: userIds[senderKey], createdAt: new Date() },
        unreadCounts: { [userIds[investorKey].toString()]: 0, [userIds[founderKey].toString()]: 0 },
      });
      conv = conv.toObject();
    }
    convIds[key] = conv._id;
  }

  const messageSpecs = [
    { convKey: 'conv1', senderKey: 'founder1', senderName: 'Sarah Chen', senderRole: 'startup', content: 'Hello David! Thank you for accepting our pitch meeting. I uploaded our updated deck with retention metrics.', readByKeys: ['founder1', 'investor1'] },
    { convKey: 'conv1', senderKey: 'investor1', senderName: 'David Sterling', senderRole: 'investor', content: 'Looking forward to our discussion next Tuesday at 10:30 AM.', readByKeys: ['investor1'] },
  ];
  for (const spec of messageSpecs) {
    const { convKey, senderKey, readByKeys, ...rest } = spec;
    await upsertMissing(
      Message,
      { conversationId: convIds[convKey], content: rest.content },
      { ...rest, conversationId: convIds[convKey], senderId: userIds[senderKey], readBy: readByKeys.map((k) => userIds[k]) }
    );
  }

  const notificationSpecs = [
    { userKey: 'founder1', title: 'Meeting Accepted', message: 'David Sterling accepted your pitch meeting.', type: 'meeting_accepted', link: '/meetings', isRead: false },
    { userKey: 'founder1', title: 'New Deck Review', message: 'Emerald Capital Partners left a 5-star review on your pitch deck.', type: 'feedback', link: '/pitch-decks', isRead: false },
    { userKey: 'investor1', title: 'New Pitch Request', message: 'Sarah Chen from Zenith AI requested a 30-min pitch slot.', type: 'meeting_request', link: '/meetings', isRead: true },
    { userKey: 'admin', title: 'Pending Verification', message: 'NovaPay Global submitted credentials for verification.', type: 'verification', link: '/dashboard/admin', isRead: false },
  ];
  for (const spec of notificationSpecs) {
    const { userKey, ...rest } = spec;
    await upsertMissing(Notification, { userId: userIds[userKey], title: rest.title, message: rest.message }, { ...rest, userId: userIds[userKey] });
  }

  const favoriteSpecs = [
    { userKey: 'founder1', targetType: 'investor', targetKey: 'inv1', notes: 'Leading candidate for Seed round lead investor.' },
    { userKey: 'investor1', targetType: 'startup', targetKey: 'stp1', notes: 'Top AI pipeline candidate.' },
  ];
  for (const spec of favoriteSpecs) {
    const { userKey, targetType, targetKey, ...rest } = spec;
    const targetId = targetType === 'investor' ? investorIds[targetKey] : startupIds[targetKey];
    await upsertMissing(Favorite, { userId: userIds[userKey], targetType, targetId }, { ...rest, userId: userIds[userKey], targetType, targetId });
  }

  console.log('Local seed complete (inserted missing records only; nothing was deleted or overwritten).');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err && err.name ? err.name : 'UnknownError', err && err.code ? `code=${err.code}` : '');
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
