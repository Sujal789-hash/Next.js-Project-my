import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import {
  getVerifications,
  updateVerificationStatus,
  createNotification,
  setStartupVerified,
  setInvestorVerified,
  setUserVerified,
} from '@/lib/dataService';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const verifications = await getVerifications();
    return NextResponse.json({ success: true, verifications });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { verificationId, status, adminNotes } = body;

    if (!verificationId || !['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid verification payload' }, { status: 400 });
    }

    // Persist the verification decision to MongoDB.
    const updated = await updateVerificationStatus(verificationId, status, adminNotes, user.id);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Verification record not found' }, { status: 404 });
    }

    // Persist the resulting verified flag to the actual target documents.
    if (status === 'Approved') {
      if (updated.targetType === 'startup') {
        await setStartupVerified(updated.targetId, true);
      } else if (updated.targetType === 'investor') {
        await setInvestorVerified(updated.targetId, true);
      }
      await setUserVerified(updated.userId, true);
    }

    // Notify the affected user.
    await createNotification({
      userId: updated.userId,
      title: `Profile Verification: ${status}`,
      message: `Your ${updated.targetType} credential verification was ${status.toLowerCase()} by platform compliance.`,
      type: 'verification',
      link: '/profile',
    });

    return NextResponse.json({
      success: true,
      message: `Verification record marked as ${status}`,
      verification: updated,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
