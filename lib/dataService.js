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

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// In-memory store is retained for LOCAL DEVELOPMENT ONLY.
// It is never consulted when NODE_ENV=production.
if (!IS_PRODUCTION && !global.__pitchconnect_store__) {
  global.__pitchconnect_store__ = JSON.parse(JSON.stringify(initialMockData));
}

// Hard guard: even a future accidental call cannot serve mock data in production.
export const getStore = () => {
  if (IS_PRODUCTION) {
    throw new Error('In-memory store is unavailable in production.');
  }
  return global.__pitchconnect_store__;
};

function logFallback(reason, err) {
  if (IS_PRODUCTION) return;
  console.warn(
    '[PitchConnect] MongoDB unavailable; using in-memory store:',
    reason,
    err && err.name ? err.name : ''
  );
}

/**
 * Returns true when MongoDB is usable.
 * In production, any connection problem is thrown so API routes return an error
 * instead of silently serving or saving demo data.
 */
async function useMongo() {
  try {
    const conn = await connectDB();
    if (!conn || !conn.connection || conn.connection.readyState !== 1) {
      const err = new Error('MongoDB connection is not ready');
      if (IS_PRODUCTION) throw err;
      logFallback('connection not ready', err);
      return false;
    }
    return true;
  } catch (err) {
    if (IS_PRODUCTION) throw err;
    logFallback('connection error', err);
    return false;
  }
}

function operationFailed(action, err) {
  if (IS_PRODUCTION) throw err;
  logFallback(action, err);
  return false;
}

export async function isMongoAvailable() {
  try {
    const conn = await connectDB();
    return !!(conn && conn.connection && conn.connection.readyState === 1);
  } catch (err) {
    if (IS_PRODUCTION) throw err;
    return false;
  }
}

// ================= USER OPERATIONS =================
export async function findUserByEmail(email) {
  const normEmail = String(email).toLowerCase().trim();

  if (await useMongo()) {
    try {
      const user = await User.findOne({ email: normEmail }).lean();
      if (user) return user;
      if (IS_PRODUCTION) return null;
    } catch (err) {
      operationFailed('findUserByEmail', err);
    }
  }

  return getStore().users.find((u) => u.email.toLowerCase() === normEmail) || null;
}

export async function findUserById(id) {
  if (await useMongo()) {
    try {
      const user = await User.findById(id).lean();
      if (user) return user;
      if (IS_PRODUCTION) return null;
    } catch (err) {
      operationFailed('findUserById', err);
    }
  }

  return getStore().users.find((u) => u._id.toString() === id.toString()) || null;
}

export async function getAllUsers() {
  if (await useMongo()) {
    try {
      const users = await User.find({}).lean();
      if (users.length > 0 || IS_PRODUCTION) return users;
    } catch (err) {
      operationFailed('getAllUsers', err);
    }
  }

  return [...getStore().users];
}

export async function createUser(userData) {
  if (await useMongo()) {
    try {
      const user = await User.create(userData);
      return user.toObject();
    } catch (err) {
      operationFailed('createUser', err);
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
  if (await useMongo()) {
    try {
      const startups = await Startup.find(filter).lean();
      if (startups.length > 0 || IS_PRODUCTION) return startups;
    } catch (err) {
      operationFailed('getStartups', err);
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
  return list;
}

export async function getStartupById(id) {
  if (await useMongo()) {
    try {
      const startup = await Startup.findById(id).lean();
      if (startup) return startup;
      if (IS_PRODUCTION) return null;
    } catch (err) {
      operationFailed('getStartupById', err);
    }
  }

  return getStore().startups.find((s) => s._id.toString() === id.toString()) || null;
}

export async function getStartupByUserId(userId) {
  if (await useMongo()) {
    try {
      const startup = await Startup.findOne({ userId }).lean();
      if (startup) return startup;
      if (IS_PRODUCTION) return null;
    } catch (err) {
      operationFailed('getStartupByUserId', err);
    }
  }

  return getStore().startups.find((s) => s.userId.toString() === userId.toString()) || null;
}

export async function upsertStartup(userId, data) {
  if (await useMongo()) {
    try {
      return await Startup.findOneAndUpdate(
        { userId },
        { ...data, userId },
        { new: true, upsert: true }
      ).lean();
    } catch (err) {
      operationFailed('upsertStartup', err);
    }
  }

  const store = getStore();
  const index = store.startups.findIndex((s) => s.userId.toString() === userId.toString());
  if (index !== -1) {
    store.startups[index] = { ...store.startups[index], ...data, updatedAt: new Date().toISOString() };
    return store.startups[index];
  }

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

// ================= INVESTOR OPERATIONS =================
export async function getInvestors(filter = {}) {
  if (await useMongo()) {
    try {
      const investors = await Investor.find(filter).lean();
      if (investors.length > 0 || IS_PRODUCTION) return investors;
    } catch (err) {
      operationFailed('getInvestors', err);
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
  return list;
}

export async function getInvestorById(id) {
  if (await useMongo()) {
    try {
      const inv = await Investor.findById(id).lean();
      if (inv) return inv;
      if (IS_PRODUCTION) return null;
    } catch (err) {
      operationFailed('getInvestorById', err);
    }
  }

  return getStore().investors.find((i) => i._id.toString() === id.toString()) || null;
}

export async function getInvestorByUserId(userId) {
  if (await useMongo()) {
    try {
      const inv = await Investor.findOne({ userId }).lean();
      if (inv) return inv;
      if (IS_PRODUCTION) return null;
    } catch (err) {
      operationFailed('getInvestorByUserId', err);
    }
  }

  return getStore().investors.find((i) => i.userId.toString() === userId.toString()) || null;
}

export async function upsertInvestor(userId, data) {
  if (await useMongo()) {
    try {
      return await Investor.findOneAndUpdate(
        { userId },
        { ...data, userId },
        { new: true, upsert: true }
      ).lean();
    } catch (err) {
      operationFailed('upsertInvestor', err);
    }
  }

  const store = getStore();
  const index = store.investors.findIndex((i) => i.userId.toString() === userId.toString());
  if (index !== -1) {
    store.investors[index] = { ...store.investors[index], ...data, updatedAt: new Date().toISOString() };
    return store.investors[index];
  }

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

// ================= MEETINGS =================
export async function getMeetings(query = {}) {
  if (await useMongo()) {
    try {
      const meetings = await Meeting.find(query).sort({ date: 1, startTime: 1 }).lean();
      if (meetings.length > 0 || IS_PRODUCTION) return meetings;
    } catch (err) {
      operationFailed('getMeetings', err);
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

  if (await useMongo()) {
    try {
      const meeting = await Meeting.create(meetingData);
      return meeting.toObject();
    } catch (err) {
      operationFailed('createMeeting', err);
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
  if (await useMongo()) {
    try {
      const meeting = await Meeting.findByIdAndUpdate(
        meetingId,
        { status, ...details },
        { new: true }
      ).lean();
      if (meeting) return meeting;
      if (IS_PRODUCTION) return null;
    } catch (err) {
      operationFailed('updateMeetingStatus', err);
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
  if (await useMongo()) {
    try {
      const decks = await PitchDeck.find({ startupId }).sort({ createdAt: -1 }).lean();
      if (decks.length > 0 || IS_PRODUCTION) return decks;
    } catch (err) {
      operationFailed('getPitchDecks', err);
    }
  }

  return getStore().pitchDecks.filter((p) => p.startupId.toString() === startupId.toString());
}

export async function addPitchDeck(deckData) {
  if (await useMongo()) {
    try {
      const deck = await PitchDeck.create(deckData);
      return deck.toObject();
    } catch (err) {
      operationFailed('addPitchDeck', err);
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
  if (await useMongo()) {
    try {
      const revs = await Review.find({ startupId }).sort({ createdAt: -1 }).lean();
      if (revs.length > 0 || IS_PRODUCTION) return revs;
    } catch (err) {
      operationFailed('getReviews', err);
    }
  }

  return getStore().reviews.filter((r) => r.startupId.toString() === startupId.toString());
}

export async function addReview(reviewData) {
  if (await useMongo()) {
    try {
      const rev = await Review.create(reviewData);
      return rev.toObject();
    } catch (err) {
      operationFailed('addReview', err);
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
  if (await useMongo()) {
    try {
      const notifs = await Notification.find({ userId }).sort({ createdAt: -1 }).lean();
      if (notifs.length > 0 || IS_PRODUCTION) return notifs;
    } catch (err) {
      operationFailed('getNotifications', err);
    }
  }

  return getStore().notifications.filter((n) => n.userId.toString() === userId.toString());
}

export async function createNotification(notifData) {
  if (await useMongo()) {
    try {
      const notif = await Notification.create(notifData);
      return notif.toObject();
    } catch (err) {
      operationFailed('createNotification', err);
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
  if (await useMongo()) {
    try {
      await Notification.findByIdAndUpdate(notifId, { isRead: true });
      return;
    } catch (err) {
      operationFailed('markNotificationRead', err);
    }
  }

  const n = getStore().notifications.find((item) => item._id.toString() === notifId.toString());
  if (n) n.isRead = true;
}

// ================= CONVERSATIONS & MESSAGES =================
export async function getConversations(userId) {
  if (await useMongo()) {
    try {
      const convs = await Conversation.find({ participants: userId }).sort({ updatedAt: -1 }).lean();
      if (convs.length > 0 || IS_PRODUCTION) return convs;
    } catch (err) {
      operationFailed('getConversations', err);
    }
  }

  return getStore().conversations.filter((c) =>
    c.participants.some((p) => p.toString() === userId.toString())
  );
}

export async function findConversationBetween(userA, userB) {
  if (await useMongo()) {
    try {
      const conv = await Conversation.findOne({ participants: { $all: [userA, userB] } }).lean();
      if (conv) return conv;
      if (IS_PRODUCTION) return null;
    } catch (err) {
      operationFailed('findConversationBetween', err);
    }
  }

  return (
    getStore().conversations.find(
      (c) => c.participants.includes(userA) && c.participants.includes(userB)
    ) || null
  );
}

export async function createConversation(conversationData) {
  if (await useMongo()) {
    try {
      const conv = await Conversation.create(conversationData);
      return conv.toObject();
    } catch (err) {
      operationFailed('createConversation', err);
    }
  }

  const store = getStore();
  const newConv = {
    _id: 'conv_' + Date.now(),
    ...conversationData,
    createdAt: new Date().toISOString(),
  };
  store.conversations.unshift(newConv);
  return newConv;
}

export async function getMessages(conversationId) {
  if (await useMongo()) {
    try {
      const msgs = await Message.find({ conversationId }).sort({ createdAt: 1 }).lean();
      if (msgs.length > 0 || IS_PRODUCTION) return msgs;
    } catch (err) {
      operationFailed('getMessages', err);
    }
  }

  return getStore().messages.filter((m) => m.conversationId.toString() === conversationId.toString());
}

export async function createMessage(msgData) {
  if (await useMongo()) {
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
    } catch (err) {
      operationFailed('createMessage', err);
    }
  }

  const store = getStore();
  const newMsg = {
    _id: 'msg_' + Date.now(),
    ...msgData,
    createdAt: new Date().toISOString(),
  };
  store.messages.push(newMsg);

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
  if (await useMongo()) {
    try {
      const favs = await Favorite.find({ userId }).lean();
      if (favs.length > 0 || IS_PRODUCTION) return favs;
    } catch (err) {
      operationFailed('getFavorites', err);
    }
  }

  return getStore().favorites.filter((f) => f.userId.toString() === userId.toString());
}

export async function toggleFavorite(userId, targetType, targetId) {
  if (await useMongo()) {
    try {
      const existing = await Favorite.findOne({ userId, targetType, targetId });
      if (existing) {
        await Favorite.deleteOne({ _id: existing._id });
        return { action: 'removed' };
      }
      await Favorite.create({ userId, targetType, targetId });
      return { action: 'added' };
    } catch (err) {
      operationFailed('toggleFavorite', err);
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
  }

  store.favorites.push({
    _id: 'fav_' + Date.now(),
    userId,
    targetType,
    targetId,
    createdAt: new Date().toISOString(),
  });
  return { action: 'added' };
}

// ================= ADMIN & VERIFICATION =================
export async function getVerifications() {
  if (await useMongo()) {
    try {
      const vers = await Verification.find().sort({ createdAt: -1 }).lean();
      if (vers.length > 0 || IS_PRODUCTION) return vers;
    } catch (err) {
      operationFailed('getVerifications', err);
    }
  }

  return [...getStore().verifications];
}

export async function updateVerificationStatus(verId, status, adminNotes = '', reviewedBy = null) {
  if (await useMongo()) {
    try {
      const ver = await Verification.findByIdAndUpdate(
        verId,
        { status, adminNotes, reviewedBy, reviewedAt: new Date() },
        { new: true }
      ).lean();
      if (ver) return ver;
      if (IS_PRODUCTION) return null;
    } catch (err) {
      operationFailed('updateVerificationStatus', err);
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

async function setVerified(Model, id, verified, label, storeKey) {
  if (await useMongo()) {
    try {
      return await Model.findByIdAndUpdate(id, { isVerified: verified }, { new: true }).lean();
    } catch (err) {
      operationFailed(`setVerified:${label}`, err);
    }
  }

  const item = getStore()[storeKey].find((entry) => entry._id.toString() === id.toString());
  if (item) item.isVerified = verified;
  return item || null;
}

export function setStartupVerified(id, verified) {
  return setVerified(Startup, id, verified, 'startup', 'startups');
}

export function setInvestorVerified(id, verified) {
  return setVerified(Investor, id, verified, 'investor', 'investors');
}

export function setUserVerified(id, verified) {
  return setVerified(User, id, verified, 'user', 'users');
}
