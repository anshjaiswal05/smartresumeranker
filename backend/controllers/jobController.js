const { searchTechJobs } = require('../services/jobService');
const { getFirestore } = require('../config/firebase-admin');

/**
 * Search technology jobs
 */
async function getJobs(req, res) {
  try {
    const { query, location, company, experience, workplaceType, skills, sortBy } = req.query;

    const data = await searchTechJobs({
      query,
      location,
      company,
      experience,
      workplaceType,
      skills,
      sortBy
    });

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Job search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve jobs at this moment. ' + error.message
    });
  }
}

/**
 * Save job for user
 */
async function saveJob(req, res) {
  try {
    const { uid } = req.user;
    const job = req.body;

    if (!job || !job.id) {
      return res.status(400).json({
        success: false,
        message: 'Valid job object with id is required.'
      });
    }

    const db = getFirestore();
    const docId = `${uid}_${job.id}`;
    await db.collection('savedJobs').doc(docId).set({
      userId: uid,
      jobId: job.id,
      job,
      savedAt: new Date().toISOString()
    });

    // Activity log
    await db.collection('activityLogs').doc(`${uid}-${Date.now()}`).set({
      userId: uid,
      activityType: 'job_saved',
      title: 'Job Saved',
      details: `${job.title} at ${job.company}`,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Job saved successfully.'
    });
  } catch (error) {
    console.error('Save job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save job: ' + error.message
    });
  }
}

/**
 * Get user's saved jobs
 */
async function getSavedJobs(req, res) {
  try {
    const { uid } = req.user;
    const db = getFirestore();
    const snapshot = await db.collection('savedJobs')
      .where('userId', '==', uid)
      .get();

    const savedJobs = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.job) {
        savedJobs.push(data.job);
      }
    });

    return res.status(200).json({
      success: true,
      jobs: savedJobs
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve saved jobs: ' + error.message
    });
  }
}

/**
 * Remove a saved job
 */
async function removeSavedJob(req, res) {
  try {
    const { uid } = req.user;
    const { jobId } = req.params;

    const db = getFirestore();
    const docId = `${uid}_${jobId}`;
    await db.collection('savedJobs').doc(docId).delete();

    return res.status(200).json({
      success: true,
      message: 'Job removed from saved list.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete saved job: ' + error.message
    });
  }
}

module.exports = {
  getJobs,
  saveJob,
  getSavedJobs,
  removeSavedJob
};
