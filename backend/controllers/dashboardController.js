const { getFirestore } = require('../config/firebase-admin');

/**
 * Get aggregated dashboard statistics and recent activity
 */
async function getDashboardStats(req, res) {
  try {
    const { uid } = req.user;
    const db = getFirestore();

    // 1. Fetch user profile
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    // Calculate profile completion percentage
    let profileFieldsFilled = 0;
    const profileFields = ['fullName', 'email', 'phone', 'address', 'designation', 'githubUrl', 'linkedinUrl', 'portfolioUrl'];
    profileFields.forEach(f => {
      if (userData[f] && userData[f].trim() !== '') profileFieldsFilled++;
    });
    const profileCompletionPercent = Math.round((profileFieldsFilled / profileFields.length) * 100);

    // 2. Fetch latest resume analysis
    const resumeDoc = await db.collection('resumes').doc(uid).get();
    const resumeData = resumeDoc.exists ? resumeDoc.data() : null;

    // 3. Fetch latest skill gap
    const skillGapDoc = await db.collection('skillGapAnalyses').doc(uid).get();
    const skillGapData = skillGapDoc.exists ? skillGapDoc.data() : null;

    // 4. Fetch saved jobs count
    const savedJobsSnapshot = await db.collection('savedJobs')
      .where('userId', '==', uid)
      .get();
    const savedJobsCount = savedJobsSnapshot.size;

    // 5. Fetch latest mock interview
    const interviewsSnapshot = await db.collection('mockInterviews')
      .where('userId', '==', uid)
      .get();

    let latestInterviewScore = null;
    let latestInterviewDate = null;
    interviewsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'completed' && data.result) {
        if (!latestInterviewDate || new Date(data.completedAt) > new Date(latestInterviewDate)) {
          latestInterviewDate = data.completedAt;
          latestInterviewScore = data.result.overallScore;
        }
      }
    });

    // 6. Fetch recent activity logs
    const activitySnapshot = await db.collection('activityLogs')
      .where('userId', '==', uid)
      .get();

    const activityList = [];
    activitySnapshot.forEach(doc => {
      activityList.push(doc.data());
    });
    activityList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Fallback default activities if newly joined
    if (activityList.length === 0) {
      activityList.push({
        activityType: 'account_created',
        title: 'Account Created',
        details: 'Welcome to Smart Resume Ranker! Start by uploading your resume.',
        timestamp: userData.createdAt || new Date().toISOString()
      });
    }

    const stats = {
      atsScore: resumeData ? resumeData.atsScore : 0,
      profileCompletion: profileCompletionPercent,
      skillsDetectedCount: resumeData ? (resumeData.technicalSkills ? resumeData.technicalSkills.length : 0) : 0,
      missingSkillsCount: skillGapData ? (skillGapData.missingSkills ? skillGapData.missingSkills.totalMissing : 0) : 0,
      targetRole: (skillGapData && skillGapData.targetRole) ? skillGapData.targetRole.title : (userData.designation || 'Software Engineer'),
      savedJobsCount,
      latestMockInterviewScore: latestInterviewScore !== null ? `${latestInterviewScore}%` : 'Not Taken',
      resumeCandidateName: resumeData ? resumeData.candidateName : null,
      recentActivity: activityList.slice(0, 8)
    };

    return res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard stats: ' + error.message
    });
  }
}

module.exports = {
  getDashboardStats
};
