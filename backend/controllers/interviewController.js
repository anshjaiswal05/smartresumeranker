const { startInterviewSession, evaluateInterviewSession } = require('../services/interviewService');
const { getFirestore } = require('../config/firebase-admin');

/**
 * Start a new mock interview session
 */
async function startInterview(req, res) {
  try {
    const { uid } = req.user;
    const { targetPosition, difficulty, questionCount } = req.body;

    if (!targetPosition) {
      return res.status(400).json({
        success: false,
        message: 'targetPosition is required.'
      });
    }

    const session = await startInterviewSession({
      userId: uid,
      targetPosition,
      difficulty: difficulty || 'Medium',
      questionCount: questionCount || 10
    });

    return res.status(200).json({
      success: true,
      message: 'Interview session generated successfully.',
      session
    });
  } catch (error) {
    console.error('Start interview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start interview: ' + error.message
    });
  }
}

/**
 * Submit answers and evaluate interview
 */
async function evaluateInterview(req, res) {
  try {
    const { uid } = req.user;
    const { interviewId, answers } = req.body;

    if (!interviewId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'interviewId and answers array are required.'
      });
    }

    const result = await evaluateInterviewSession({
      userId: uid,
      interviewId,
      answers
    });

    // Activity log
    const db = getFirestore();
    await db.collection('activityLogs').doc(`${uid}-${Date.now()}`).set({
      userId: uid,
      activityType: 'interview_completed',
      title: 'Mock Interview Completed',
      details: `${result.targetPosition} (${result.difficulty}): ${result.overallScore}% score`,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Interview evaluated successfully.',
      result
    });
  } catch (error) {
    console.error('Evaluate interview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to evaluate interview: ' + error.message
    });
  }
}

/**
 * Get interview history for the user
 */
async function getInterviewHistory(req, res) {
  try {
    const { uid } = req.user;
    const db = getFirestore();
    const snapshot = await db.collection('mockInterviews')
      .where('userId', '==', uid)
      .get();

    const interviews = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'completed' && data.result) {
        interviews.push(data.result);
      }
    });

    // Sort by completion date descending
    interviews.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    return res.status(200).json({
      success: true,
      interviews
    });
  } catch (error) {
    console.error('Interview history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve interview history: ' + error.message
    });
  }
}

module.exports = {
  startInterview,
  evaluateInterview,
  getInterviewHistory
};
