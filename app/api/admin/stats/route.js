import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import {
  getAllUsers,
  getStartups,
  getInvestors,
  getMeetings,
  getVerifications,
} from '@/lib/dataService';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const [users, startups, investors, meetings, verifications] = await Promise.all([
      getAllUsers(),
      getStartups(),
      getInvestors(),
      getMeetings(),
      getVerifications(),
    ]);

    const totalFundingRequired = startups.reduce((acc, s) => acc + (Number(s.fundingRequired) || 0), 0);
    const totalFundingRaised = startups.reduce((acc, s) => acc + (Number(s.fundingRaised) || 0), 0);

    const pendingVerifications = verifications.filter((v) => v.status === 'Pending').length;
    const acceptedMeetings = meetings.filter((m) => m.status === 'Accepted').length;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalStartups: startups.length,
        totalInvestors: investors.length,
        totalMeetings: meetings.length,
        acceptedMeetings,
        pendingVerifications,
        totalFundingRequired,
        totalFundingRaised,
        fundingProgressPercent: totalFundingRequired > 0 ? Math.round((totalFundingRaised / totalFundingRequired) * 100) : 0,
      },
      usersList: users.map((u) => ({
        id: u._id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        isVerified: u.isVerified,
        status: u.status,
        createdAt: u.createdAt,
      })),
      recentMeetings: meetings.slice(0, 10),
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
