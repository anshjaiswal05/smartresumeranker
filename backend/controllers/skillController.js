const { TECH_ROLES_DATASET, analyzeSkillGap } = require('../services/skillService');
const { getFirestore } = require('../config/firebase-admin');

/**
 * Get all available technology roles
 */
async function getTechnologyRoles(req, res) {
  try {
    return res.status(200).json({
      success: true,
      roles: TECH_ROLES_DATASET
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch roles: ' + error.message
    });
  }
}

/**
 * Run Skill Gap Analysis
 */
async function runSkillGapAnalysis(req, res) {
  try {
    const { uid } = req.user;
    const { targetRoleId, customTargetRole, userSkills: providedSkills } = req.body;

    const db = getFirestore();

    // If user didn't explicitly send skills, pull extracted skills from their latest analyzed resume
    let activeSkills = providedSkills;
    if (!activeSkills || !Array.isArray(activeSkills) || activeSkills.length === 0) {
      const resumeDoc = await db.collection('resumes').doc(uid).get();
      if (resumeDoc.exists) {
        activeSkills = resumeDoc.data().technicalSkills || [];
      }
    }

    if (!activeSkills || activeSkills.length === 0) {
      activeSkills = ['JavaScript', 'HTML5', 'CSS3', 'Git'];
    }

    const gapResult = analyzeSkillGap({
      userSkills: activeSkills,
      targetRoleId,
      customTargetRole
    });

    // Save result to Firestore
    await db.collection('skillGapAnalyses').doc(uid).set({
      userId: uid,
      ...gapResult,
      analyzedAt: new Date().toISOString()
    });

    // Activity log
    await db.collection('activityLogs').doc(`${uid}-${Date.now()}`).set({
      userId: uid,
      activityType: 'skill_gap_analyzed',
      title: 'Skill Gap Analyzed',
      details: `${gapResult.matchPercentage}% match for ${gapResult.targetRole.title}`,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Skill gap analyzed successfully.',
      data: gapResult
    });
  } catch (error) {
    console.error('Skill gap error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze skill gap: ' + error.message
    });
  }
}

module.exports = {
  getTechnologyRoles,
  runSkillGapAnalysis
};
