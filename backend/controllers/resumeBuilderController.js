const { getFirestore } = require('../config/firebase-admin');

/**
 * Save resume builder document
 */
async function saveResumeBuilderDocument(req, res) {
  try {
    const { uid } = req.user;
    const resumeData = req.body;

    const db = getFirestore();
    const docRef = db.collection('resumeBuilderDocuments').doc(uid);

    const documentToSave = {
      userId: uid,
      ...resumeData,
      updatedAt: new Date().toISOString()
    };

    await docRef.set(documentToSave, { merge: true });

    // Activity log
    await db.collection('activityLogs').doc(`${uid}-${Date.now()}`).set({
      userId: uid,
      activityType: 'resume_built',
      title: 'Resume Updated in Builder',
      details: `Template: ${resumeData.template || 'Modern'}`,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Resume saved successfully.',
      data: documentToSave
    });
  } catch (error) {
    console.error('Save resume builder error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save resume: ' + error.message
    });
  }
}

/**
 * Load resume builder document
 */
async function getResumeBuilderDocument(req, res) {
  try {
    const { uid } = req.user;
    const db = getFirestore();
    const doc = await db.collection('resumeBuilderDocuments').doc(uid).get();

    if (!doc.exists) {
      // If user has analyzed a resume, prefill builder with analyzed details!
      const resumeDoc = await db.collection('resumes').doc(uid).get();
      const userDoc = await db.collection('users').doc(uid).get();

      const userProfile = userDoc.exists ? userDoc.data() : {};
      const parsedResume = resumeDoc.exists ? resumeDoc.data() : {};

      const prefilled = {
        template: 'modern',
        personalInfo: {
          fullName: userProfile.fullName || parsedResume.candidateName || '',
          email: userProfile.email || (parsedResume.contactInfo && parsedResume.contactInfo.email) || '',
          phone: userProfile.phone || (parsedResume.contactInfo && parsedResume.contactInfo.phone) || '',
          address: userProfile.address || '',
          designation: userProfile.designation || 'Software Engineer',
          githubUrl: userProfile.githubUrl || (parsedResume.contactInfo && parsedResume.contactInfo.github) || '',
          linkedinUrl: userProfile.linkedinUrl || (parsedResume.contactInfo && parsedResume.contactInfo.linkedin) || '',
          portfolioUrl: userProfile.portfolioUrl || ''
        },
        summary: parsedResume.professionalSummary || 'Passionate software engineer focused on building robust, scalable digital applications and delivering high quality technical solutions.',
        experience: [
          {
            id: 'exp-1',
            role: 'Software Engineer',
            company: 'Tech Solutions Inc.',
            location: 'Bengaluru, India',
            startDate: '2023',
            endDate: 'Present',
            description: 'Designed and deployed scalable RESTful APIs and modern frontend interfaces, improving application load performance by 35%.'
          }
        ],
        education: [
          {
            id: 'edu-1',
            degree: 'B.Tech in Computer Science & Engineering',
            institution: 'National Institute of Technology',
            location: 'India',
            year: '2023',
            score: '8.4 CGPA'
          }
        ],
        skills: parsedResume.technicalSkills && parsedResume.technicalSkills.length > 0
          ? parsedResume.technicalSkills
          : ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'SQL', 'Git'],
        projects: [
          {
            id: 'proj-1',
            title: 'Smart Resume Ranker Platform',
            technologies: 'Node.js, Express, Vanilla JS, Firebase, Gemini AI',
            link: 'https://github.com/project',
            description: 'Architected full-stack resume intelligence application with deterministic ATS scoring and automated feedback loops.'
          }
        ],
        certifications: [
          { id: 'cert-1', name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: '2024' }
        ],
        achievements: [
          { id: 'ach-1', text: 'Won 1st prize in National Hackathon among 120 participating engineering teams.' }
        ],
        languages: ['English (Fluent)', 'Hindi (Native)']
      };

      return res.status(200).json({
        success: true,
        data: prefilled
      });
    }

    return res.status(200).json({
      success: true,
      data: doc.data()
    });
  } catch (error) {
    console.error('Get resume builder error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load resume document: ' + error.message
    });
  }
}

module.exports = {
  saveResumeBuilderDocument,
  getResumeBuilderDocument
};
