import connectDB from './mongodb';
import { initialMockData } from './mockData';
import User from '@/models/User';
import Startup from '@/models/Startup';
import Investor from '@/models/Investor';
import PitchDeck from '@/models/PitchDeck';
import Meeting from '@/models/Meeting';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import Notification from '@/models/Notification';
import Review from '@/models/Review';
import Favorite from '@/models/Favorite';
import Verification from '@/models/Verification';

// Global singleton store for mock fallback
if (!global.__pitchconnect_store__) {
  global.__pitchconnect_store__ = JSON.parse(JSON.stringify(initialMockData));
}

export const getStore = () => global.__pitchconnect_store__;

// In-Memory Query Cache for instant response times
if (!global.__pitchconnect_cache__) {
  global.__pitchconnect_cache__ = new Map();
}

function getCached(key) {
  const item = global.__pitchconnect_cache__.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    global.__pitchconnect_cache__.delete(key);
    return null;
  }
  return item.value;
}

function setCached(key, value, ttlMs = 15000) {
  global.__pitchconnect_cache__.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export function invalidateCache(pattern) {
  if (!pattern) {
    global.__pitchconnect_cache__.clear();
    return;
  }
  for (const k of global.__pitchconnect_cache__.keys()) {
    if (k.includes(pattern)) {
      global.__pitchconnect_cache__.delete(k);
    }
  }
}

// Helper to check if Mongoose is ready
export async function isMongoAvailable() {
  const conn = await connectDB();
  return !!(conn && conn.connection && conn.connection.readyState === 1);
}

// ================= USER OPERATIONS =================
export async function findUserByEmail(email) {
  if (!email) return null;
  const normEmail = email.toLowerCase().trim();
  const cacheKey = `user_email_${normEmail}`;
  const hit = getCached(cacheKey);
  if (hit) return hit;

  if (await isMongoAvailable()) {
    try {
      const user = await User.findOne({ email: normEmail }).lean();
      if (user) return setCached(cacheKey, user, 10000);
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  const user = store.users.find((u) => u.email.toLowerCase() === normEmail) || null;
  if (user) setCached(cacheKey, user, 10000);
  return user;
}

export async function findUserById(id) {
  if (!id) return null;
  const cacheKey = `user_id_${id}`;
  const hit = getCached(cacheKey);
  if (hit) return hit;

  if (await isMongoAvailable()) {
    try {
      const user = await User.findById(id).lean();
      if (user) return setCached(cacheKey, user, 10000);
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  const user = store.users.find((u) => u._id.toString() === id.toString()) || null;
  if (user) setCached(cacheKey, user, 10000);
  return user;
}

export async function createUser(userData) {
  invalidateCache('user');
  if (await isMongoAvailable()) {
    try {
      const user = await User.create(userData);
      return user.toObject();
    } catch (e) {
      console.warn('Mongoose create failed, fallback to store:', e.message);
    }
  }
  const store = getStore();
  const newUser = {
    _id: 'usr_' + Date.now(),
    ...userData,
    createdAt: new Date().toISOString(),
  };
  store.users.push(newUser);
  return newUser;
}

// ================= STARTUP OPERATIONS =================
export async function getStartups(filter = {}) {
  const isAll = Object.keys(filter).length === 0;
  const cacheKey = isAll ? 'startups_all' : `startups_${JSON.stringify(filter)}`;
  const hit = getCached(cacheKey);
  if (hit) return hit;

  if (await isMongoAvailable()) {
    try {
      const startups = await Startup.find(filter).lean();
      if (startups && startups.length > 0) return setCached(cacheKey, startups, 20000);
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  let list = [...store.startups];
  if (filter.userId) {
    list = list.filter((s) => s.userId.toString() === filter.userId.toString());
  }
  if (filter.isFeatured) {
    list = list.filter((s) => s.isFeatured === true);
  }
  setCached(cacheKey, list, 20000);
  return list;
}

export async function getStartupById(id) {
  if (!id) return null;
  const cacheKey = `startup_id_${id}`;
  const hit = getCached(cacheKey);
  if (hit) return hit;

  if (await isMongoAvailable()) {
    try {
      const startup = await Startup.findById(id).lean();
      if (startup) return setCached(cacheKey, startup, 20000);
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  const found = store.startups.find((s) => s._id.toString() === id.toString()) || null;
  if (found) setCached(cacheKey, found, 20000);
  return found;
}

export async function getStartupByUserId(userId) {
  if (!userId) return null;
  const cacheKey = `startup_user_${userId}`;
  const hit = getCached(cacheKey);
  if (hit) return hit;

  if (await isMongoAvailable()) {
    try {
      const startup = await Startup.findOne({ userId }).lean();
      if (startup) return setCached(cacheKey, startup, 20000);
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  const found = store.startups.find((s) => s.userId.toString() === userId.toString()) || null;
  if (found) setCached(cacheKey, found, 20000);
  return found;
}

export async function upsertStartup(userId, data) {
  invalidateCache('startup');
  if (await isMongoAvailable()) {
    try {
      const updated = await Startup.findOneAndUpdate(
        { userId },
        { ...data, userId },
        { new: true, upsert: true }
      ).lean();
      return updated;
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  const index = store.startups.findIndex((s) => s.userId.toString() === userId.toString());
  if (index !== -1) {
    store.startups[index] = { ...store.startups[index], ...data, updatedAt: new Date().toISOString() };
    return store.startups[index];
  } else {
    const newStartup = {
      _id: 'stp_' + Date.now(),
      userId,
      ...data,
      isVerified: false,
      isFeatured: false,
      createdAt: new Date().toISOString(),
    };
    store.startups.push(newStartup);
    return newStartup;
  }
}

// ================= INVESTOR OPERATIONS =================
export async function getInvestors(filter = {}) {
  const isAll = Object.keys(filter).length === 0;
  const cacheKey = isAll ? 'investors_all' : `investors_${JSON.stringify(filter)}`;
  const hit = getCached(cacheKey);
  if (hit) return hit;

  if (await isMongoAvailable()) {
    try {
      const investors = await Investor.find(filter).lean();
      if (investors && investors.length > 0) return setCached(cacheKey, investors, 20000);
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  let list = [...store.investors];
  if (filter.userId) {
    list = list.filter((i) => i.userId.toString() === filter.userId.toString());
  }
  if (filter.isFeatured) {
    list = list.filter((i) => i.isFeatured === true);
  }
  setCached(cacheKey, list, 20000);
  return list;
}

export async function getInvestorById(id) {
  if (!id) return null;
  const cacheKey = `investor_id_${id}`;
  const hit = getCached(cacheKey);
  if (hit) return hit;

  if (await isMongoAvailable()) {
    try {
      const inv = await Investor.findById(id).lean();
      if (inv) return setCached(cacheKey, inv, 20000);
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  const found = store.investors.find((i) => i._id.toString() === id.toString()) || null;
  if (found) setCached(cacheKey, found, 20000);
  return found;
}

export async function getInvestorByUserId(userId) {
  if (!userId) return null;
  const cacheKey = `investor_user_${userId}`;
  const hit = getCached(cacheKey);
  if (hit) return hit;

  if (await isMongoAvailable()) {
    try {
      const inv = await Investor.findOne({ userId }).lean();
      if (inv) return setCached(cacheKey, inv, 20000);
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  const found = store.investors.find((i) => i.userId.toString() === userId.toString()) || null;
  if (found) setCached(cacheKey, found, 20000);
  return found;
}

export async function upsertInvestor(userId, data) {
  invalidateCache('investor');
  if (await isMongoAvailable()) {
    try {
      const updated = await Investor.findOneAndUpdate(
        { userId },
        { ...data, userId },
        { new: true, upsert: true }
      ).lean();
      return updated;
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  const index = store.investors.findIndex((i) => i.userId.toString() === userId.toString());
  if (index !== -1) {
    store.investors[index] = { ...store.investors[index], ...data, updatedAt: new Date().toISOString() };
    return store.investors[index];
  } else {
    const newInvestor = {
      _id: 'inv_' + Date.now(),
      userId,
      ...data,
      isVerified: true,
      isFeatured: false,
      createdAt: new Date().toISOString(),
    };
    store.investors.push(newInvestor);
    return newInvestor;
  }
}

// ================= MEETINGS =================
export async function getMeetings(query = {}) {
  if (await isMongoAvailable()) {
    try {
      const meetings = await Meeting.find(query).sort({ date: 1, startTime: 1 }).lean();
      if (meetings && meetings.length > 0) return meetings;
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  return store.meetings.filter((m) => {
    if (query.founderUserId && m.founderUserId.toString() !== query.founderUserId.toString()) return false;
    if (query.investorUserId && m.investorUserId.toString() !== query.investorUserId.toString()) return false;
    if (query.investorId && m.investorId.toString() !== query.investorId.toString()) return false;
    if (query.status && m.status !== query.status) return false;
    return true;
  });
}

export async function createMeeting(meetingData) {
  // Check double booking
  const existing = await getMeetings({
    investorId: meetingData.investorId,
    date: meetingData.date,
    startTime: meetingData.startTime,
  });

  const conflict = existing.find((m) => m.status === 'Accepted' || m.status === 'Pending');
  if (conflict) {
    throw new Error('This time slot has already been requested or booked. Please select another slot.');
  }

  if (await isMongoAvailable()) {
    try {
      const meeting = await Meeting.create(meetingData);
      return meeting.toObject();
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }

  const store = getStore();
  const newMeeting = {
    _id: 'mtg_' + Date.now(),
    ...meetingData,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  store.meetings.push(newMeeting);
  return newMeeting;
}

export async function updateMeetingStatus(meetingId, status, details = {}) {
  if (await isMongoAvailable()) {
    try {
      const meeting = await Meeting.findByIdAndUpdate(
        meetingId,
        { status, ...details },
        { new: true }
      ).lean();
      if (meeting) return meeting;
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }

  const store = getStore();
  const m = store.meetings.find((item) => item._id.toString() === meetingId.toString());
  if (m) {
    m.status = status;
    Object.assign(m, details);
    m.updatedAt = new Date().toISOString();
    return m;
  }
  return null;
}

// ================= PITCH DECKS & REVIEWS =================
export async function getPitchDecks(startupId) {
  if (await isMongoAvailable()) {
    try {
      const decks = await PitchDeck.find({ startupId }).sort({ createdAt: -1 }).lean();
      if (decks && decks.length > 0) return decks;
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  return store.pitchDecks.filter((p) => p.startupId.toString() === startupId.toString());
}

export async function addPitchDeck(deckData) {
  if (await isMongoAvailable()) {
    try {
      const deck = await PitchDeck.create(deckData);
      return deck.toObject();
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  const newDeck = {
    _id: 'pdk_' + Date.now(),
    ...deckData,
    createdAt: new Date().toISOString(),
  };
  store.pitchDecks.unshift(newDeck);
  return newDeck;
}

export async function getReviews(startupId) {
  if (await isMongoAvailable()) {
    try {
      const revs = await Review.find({ startupId }).sort({ createdAt: -1 }).lean();
      if (revs && revs.length > 0) return revs;
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  return store.reviews.filter((r) => r.startupId.toString() === startupId.toString());
}

export async function addReview(reviewData) {
  if (await isMongoAvailable()) {
    try {
      const rev = await Review.create(reviewData);
      return rev.toObject();
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  const newRev = {
    _id: 'rev_' + Date.now(),
    ...reviewData,
    createdAt: new Date().toISOString(),
  };
  store.reviews.unshift(newRev);
  return newRev;
}

// ================= NOTIFICATIONS =================
export async function getNotifications(userId) {
  if (await isMongoAvailable()) {
    try {
      const notifs = await Notification.find({ userId }).sort({ createdAt: -1 }).lean();
      if (notifs && notifs.length > 0) return notifs;
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  return store.notifications.filter((n) => n.userId.toString() === userId.toString());
}

export async function createNotification(notifData) {
  if (await isMongoAvailable()) {
    try {
      const notif = await Notification.create(notifData);
      return notif.toObject();
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  const newNotif = {
    _id: 'notif_' + Date.now(),
    ...notifData,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  store.notifications.unshift(newNotif);
  return newNotif;
}

export async function markNotificationRead(notifId) {
  if (await isMongoAvailable()) {
    try {
      await Notification.findByIdAndUpdate(notifId, { isRead: true });
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  const n = store.notifications.find((item) => item._id.toString() === notifId.toString());
  if (n) n.isRead = true;
}

// ================= CONVERSATIONS & MESSAGES =================
export async function getConversations(userId) {
  if (await isMongoAvailable()) {
    try {
      const convs = await Conversation.find({ participants: userId }).sort({ updatedAt: -1 }).lean();
      if (convs && convs.length > 0) return convs;
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  return store.conversations.filter((c) =>
    c.participants.some((p) => p.toString() === userId.toString())
  );
}

export async function getMessages(conversationId) {
  if (await isMongoAvailable()) {
    try {
      const msgs = await Message.find({ conversationId }).sort({ createdAt: 1 }).lean();
      if (msgs && msgs.length > 0) return msgs;
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  return store.messages.filter((m) => m.conversationId.toString() === conversationId.toString());
}

export async function createMessage(msgData) {
  if (await isMongoAvailable()) {
    try {
      const msg = await Message.create(msgData);
      await Conversation.findByIdAndUpdate(msgData.conversationId, {
        lastMessage: {
          text: msgData.content,
          senderId: msgData.senderId,
          createdAt: new Date(),
        },
      });
      return msg.toObject();
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  const newMsg = {
    _id: 'msg_' + Date.now(),
    ...msgData,
    createdAt: new Date().toISOString(),
  };
  store.messages.push(newMsg);

  // update conversation
  const conv = store.conversations.find((c) => c._id.toString() === msgData.conversationId.toString());
  if (conv) {
    conv.lastMessage = {
      text: msgData.content,
      senderId: msgData.senderId,
      createdAt: new Date().toISOString(),
    };
  }
  return newMsg;
}

// ================= FAVORITES =================
export async function getFavorites(userId) {
  if (await isMongoAvailable()) {
    try {
      const favs = await Favorite.find({ userId }).lean();
      if (favs && favs.length > 0) return favs;
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  return store.favorites.filter((f) => f.userId.toString() === userId.toString());
}

export async function toggleFavorite(userId, targetType, targetId) {
  if (await isMongoAvailable()) {
    try {
      const existing = await Favorite.findOne({ userId, targetType, targetId });
      if (existing) {
        await Favorite.deleteOne({ _id: existing._id });
        return { action: 'removed' };
      } else {
        await Favorite.create({ userId, targetType, targetId });
        return { action: 'added' };
      }
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }

  const store = getStore();
  const idx = store.favorites.findIndex(
    (f) =>
      f.userId.toString() === userId.toString() &&
      f.targetType === targetType &&
      f.targetId.toString() === targetId.toString()
  );

  if (idx !== -1) {
    store.favorites.splice(idx, 1);
    return { action: 'removed' };
  } else {
    store.favorites.push({
      _id: 'fav_' + Date.now(),
      userId,
      targetType,
      targetId,
      createdAt: new Date().toISOString(),
    });
    return { action: 'added' };
  }
}

// ================= ADMIN & VERIFICATION =================
export async function getVerifications() {
  if (await isMongoAvailable()) {
    try {
      const vers = await Verification.find().sort({ createdAt: -1 }).lean();
      if (vers && vers.length > 0) return vers;
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }
  const store = getStore();
  return store.verifications;
}

export async function updateVerificationStatus(verId, status, adminNotes = '', reviewedBy = null) {
  if (await isMongoAvailable()) {
    try {
      const ver = await Verification.findByIdAndUpdate(
        verId,
        { status, adminNotes, reviewedBy, reviewedAt: new Date() },
        { new: true }
      ).lean();
      return ver;
    } catch (e) {
      console.warn('Fallback to local store:', e.message);
    }
  }

  const store = getStore();
  const v = store.verifications.find((item) => item._id.toString() === verId.toString());
  if (v) {
    v.status = status;
    v.adminNotes = adminNotes;
    v.reviewedAt = new Date().toISOString();
    return v;
  }
  return null;
}

