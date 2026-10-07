const { extractTextFromFile, cleanupTempFile } = require('../utils/fileParser');
const { analyzeResume } = require('../services/atsService');
const { getFirestore } = require('../config/firebase-admin');

/**
 * Handle resume upload, temporary extraction, deterministic + Gemini ATS scoring,
 * persistent structured storage in Firestore, and immediate cleanup of temp file.
 */
async function uploadAndAnalyzeResume(req, res) {
  let tempFilePath = null;
  try {
    const { uid } = req.user;
    const targetRole = req.body.targetRole || 'Software Engineer';

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded. Please upload a PDF, DOC, or DOCX file.'
      });
    }

    tempFilePath = req.file.path;
    const originalName = req.file.originalname;

    // 1. Temporarily extract text content from file
    const extractedText = await extractTextFromFile(tempFilePath, originalName);

    if (!extractedText || extractedText.trim().length < 50) {
      cleanupTempFile(tempFilePath);
      return res.status(400).json({
        success: false,
        message: 'The uploaded file appears to be empty or unreadable. Please check the document and try again.'
      });
    }

    // 2. Immediate cleanup of the temporary file (NEVER stored permanently)
    cleanupTempFile(tempFilePath);
    tempFilePath = null;

    // 3. Deterministic + Gemini AI ATS Analysis
    const analysisResult = await analyzeResume({
      text: extractedText,
      targetRole
    });

    // 4. Save only structured information into Firestore
    const db = getFirestore();
    const resumeDocData = {
      userId: uid,
      targetRole,
      candidateName: analysisResult.candidateName,
      contactInfo: analysisResult.contactInfo,
      professionalSummary: analysisResult.professionalSummary,
      technicalSkills: analysisResult.technicalSkills,
      softSkills: analysisResult.softSkills,
      detectedKeywords: analysisResult.detectedKeywords,
      sectionsDetected: analysisResult.sectionsDetected,
      wordCount: analysisResult.wordCount,
      atsScore: analysisResult.atsScore,
      scoreBreakdown: analysisResult.scoreBreakdown,
      strengths: analysisResult.strengths,
      weaknesses: analysisResult.weaknesses,
      missingKeywords: analysisResult.missingKeywords,
      formattingIssues: analysisResult.formattingIssues,
      keywordOptimization: analysisResult.keywordOptimization,
      atsCompatibility: analysisResult.atsCompatibility,
      recommendations: analysisResult.recommendations,
      updatedAt: new Date().toISOString()
    };

    // Save to user's primary resume document
    await db.collection('resumes').doc(uid).set(resumeDocData);

    // Also record an entry in resumeAnalyses history
    const analysisHistoryId = `analysis-${Date.now()}`;
    await db.collection('resumeAnalyses').doc(analysisHistoryId).set({
      ...resumeDocData,
      analysisId: analysisHistoryId
    });

    // Also log recent activity for the user
    await db.collection('activityLogs').doc(`${uid}-${Date.now()}`).set({
      userId: uid,
      activityType: 'resume_analyzed',
      title: 'Resume Analyzed',
      details: `ATS Score: ${analysisResult.atsScore}/100 for ${targetRole}`,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully.',
      data: resumeDocData
    });

  } catch (error) {
    if (tempFilePath) {
      cleanupTempFile(tempFilePath);
    }
    console.error('Resume analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to analyze your resume right now. ' + error.message
    });
  }
}

/**
 * Get latest structured resume analysis for the user
 */
async function getLatestResume(req, res) {
  try {
    const { uid } = req.user;
    const db = getFirestore();
    const resumeDoc = await db.collection('resumes').doc(uid).get();

    if (!resumeDoc.exists) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No resume analyzed yet.'
      });
    }

    return res.status(200).json({
      success: true,
      data: resumeDoc.data()
    });
  } catch (error) {
    console.error('Get latest resume error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve resume data: ' + error.message
    });
  }
}

module.exports = {
  uploadAndAnalyzeResume,
  getLatestResume
};
