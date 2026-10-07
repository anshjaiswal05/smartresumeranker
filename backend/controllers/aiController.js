const { generateCoverLetter, generateRecruiterOutreach } = require('../services/geminiService');
const { getFirestore } = require('../config/firebase-admin');

/**
 * Generate personalized Cover Letter
 */
async function handleCoverLetter(req, res) {
  try {
    const { uid } = req.user;
    const { jobTitle, targetCompany, letterTone, jobDescription } = req.body;

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    const resumeDoc = await db.collection('resumes').doc(uid).get();

    const userData = userDoc.exists ? userDoc.data() : {};
    const resumeData = resumeDoc.exists ? resumeDoc.data() : {};

    const candidateName = userData.fullName || resumeData.candidateName || req.user.name || 'Applicant';
    const userSkills = resumeData.technicalSkills || [];
    const experienceSummary = resumeData.professionalSummary || `${userData.designation || 'Software professional'} experienced in engineering reliable applications.`;

    const generatedLetter = await generateCoverLetter({
      candidateName,
      userSkills,
      experienceSummary,
      targetRole: jobTitle,
      companyName: targetCompany,
      tone: letterTone || 'Professional',
      jobDescription: jobDescription || ''
    });

    // Save in user generated documents
    const docId = `letter-${Date.now()}`;
    await db.collection('generatedDocuments').doc(docId).set({
      docId,
      userId: uid,
      type: 'cover_letter',
      title: `Cover Letter - ${targetCompany || 'Application'}`,
      jobTitle: jobTitle || 'Software Engineer',
      targetCompany: targetCompany || 'Company',
      letterTone: letterTone || 'Professional',
      content: generatedLetter,
      createdAt: new Date().toISOString()
    });

    // Activity log
    await db.collection('activityLogs').doc(`${uid}-${Date.now()}`).set({
      userId: uid,
      activityType: 'cover_letter_generated',
      title: 'Cover Letter Generated',
      details: `Generated for ${jobTitle || 'Role'} at ${targetCompany || 'Company'}`,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Cover letter generated successfully.',
      coverLetter: generatedLetter
    });
  } catch (error) {
    console.error('Cover letter generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate cover letter: ' + error.message
    });
  }
}

/**
 * Generate Recruiter Outreach Messages
 */
async function handleRecruiterOutreach(req, res) {
  try {
    const { uid } = req.user;
    const { companyName, jobTitle, recruiterName, jobDescription } = req.body;

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    const resumeDoc = await db.collection('resumes').doc(uid).get();

    const userData = userDoc.exists ? userDoc.data() : {};
    const resumeData = resumeDoc.exists ? resumeDoc.data() : {};

    const candidateName = userData.fullName || resumeData.candidateName || req.user.name || 'Candidate';
    const topSkills = (resumeData.technicalSkills || []).slice(0, 4).join(', ');
    const highlights = topSkills ? `experience in ${topSkills}` : 'building robust software applications';

    const outreachMessages = await generateRecruiterOutreach({
      candidateName,
      role: jobTitle,
      companyName,
      recruiterName,
      highlights,
      platform: 'all'
    });

    return res.status(200).json({
      success: true,
      message: 'Outreach messages generated successfully.',
      messages: outreachMessages
    });
  } catch (error) {
    console.error('Outreach generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate outreach messages: ' + error.message
    });
  }
}

module.exports = {
  handleCoverLetter,
  handleRecruiterOutreach
};
