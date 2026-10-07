const { getAllRoadmaps, getRoadmapByRole } = require('../services/roadmapService');
const { getFirestore } = require('../config/firebase-admin');

/**
 * List all roadmap roles
 */
async function listRoadmaps(req, res) {
  try {
    const list = getAllRoadmaps();
    return res.status(200).json({
      success: true,
      roadmaps: list
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve roadmaps: ' + error.message
    });
  }
}

/**
 * Get roadmap details for a specific role
 */
async function getRoadmapDetails(req, res) {
  try {
    const { role } = req.params;
    const roadmap = getRoadmapByRole(role);
    return res.status(200).json({
      success: true,
      roadmap
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve roadmap: ' + error.message
    });
  }
}

/**
 * Save user topic progress for a roadmap
 */
async function saveRoadmapProgress(req, res) {
  try {
    const { uid } = req.user;
    const { role, topicId, status } = req.body; // status: 'Not Started', 'In Progress', 'Completed'

    if (!role || !topicId || !status) {
      return res.status(400).json({
        success: false,
        message: 'role, topicId, and status are required.'
      });
    }

    const db = getFirestore();
    const docRef = db.collection('roadmapProgress').doc(`${uid}_${role}`);
    const existing = await docRef.get();

    const currentProgress = (existing.exists && existing.data().progress) ? existing.data().progress : {};
    currentProgress[topicId] = status;

    await docRef.set({
      userId: uid,
      role,
      progress: currentProgress,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return res.status(200).json({
      success: true,
      message: 'Progress updated successfully.',
      progress: currentProgress
    });
  } catch (error) {
    console.error('Roadmap progress error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update progress: ' + error.message
    });
  }
}

/**
 * Get saved progress for a role
 */
async function getRoadmapProgress(req, res) {
  try {
    const { uid } = req.user;
    const { role } = req.params;

    const db = getFirestore();
    const docRef = db.collection('roadmapProgress').doc(`${uid}_${role}`);
    const doc = await docRef.get();

    return res.status(200).json({
      success: true,
      progress: (doc.exists && doc.data().progress) ? doc.data().progress : {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch roadmap progress: ' + error.message
    });
  }
}

module.exports = {
  listRoadmaps,
  getRoadmapDetails,
  saveRoadmapProgress,
  getRoadmapProgress
};
