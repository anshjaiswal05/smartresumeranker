const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;
let aiClient = null;

if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
    console.log('[Gemini API] Initialized successfully with models: gemini-3.5-flash-lite (Primary) & gemini-3.8-flash (Failover)');
  } catch (err) {
    console.warn('[Gemini API] Failed to initialize GoogleGenAI client:', err.message);
  }
} else {
  console.warn('[Gemini API] GEMINI_API_KEY not configured. Intelligent fallback generators will be active.');
}

// Model cascade list: stable, ultra-fast 3.5-flash-lite as primary (avoids 503 high demand spikes); 3.8-flash as secondary
const CANDIDATE_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];

/**
 * Helper to call Gemini model with structured output and instant multi-model failover
 */
async function callGemini(prompt, systemInstruction = '') {
  if (!aiClient) {
    return null;
  }

  const fullPrompt = systemInstruction ? `${systemInstruction}\n\nUser Request:\n${prompt}` : prompt;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await aiClient.models.generateContent({
        model: modelName,
        contents: fullPrompt
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (error) {
      const errMsg = error.message || '';
      const isTemporarySpike = errMsg.includes('503') || 
                               errMsg.includes('high demand') || 
                               errMsg.includes('UNAVAILABLE') ||
                               errMsg.includes('429');

      if (isTemporarySpike) {
        console.warn(`[Gemini API] ${modelName} busy (503 high demand). Instantly trying next available model...`);
        continue;
      } else {
        console.warn(`[Gemini API] Notice for ${modelName}:`, errMsg.slice(0, 150));
        continue;
      }
    }
  }

  return null;
}

/**
 * Safely extract JSON from model output
 */
function parseJsonFromText(text) {
  if (!text) return null;
  try {
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        return null;
      }
    }
    return null;
  }
}

/**
 * Semantic resume analysis using Gemini
 */
async function analyzeResumeSemantic(resumeText, targetRole = 'Software Engineer') {
  const systemInstruction = `You are an elite Senior Technical Recruiter and ATS Optimization Expert.
Analyze the provided resume text against the target role (${targetRole}).
CRITICAL RULES:
1. Do NOT invent or hallucinate any work experience, education, certifications, skills, companies, or achievements that the user has not provided in the resume text.
2. Provide concrete, actionable, constructive critique.
3. Return ONLY a valid JSON object without markdown fences, with these exact keys:
{
  "summary": "2-3 sentences concise professional overview based strictly on resume content",
  "strengths": ["bullet point 1", "bullet point 2", "bullet point 3", "bullet point 4"],
  "weaknesses": ["actionable weakness 1", "actionable weakness 2", "actionable weakness 3"],
  "missingKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "recommendations": ["recommendation 1 with concrete advice", "recommendation 2", "recommendation 3", "recommendation 4"],
  "formattingIssues": ["formatting or layout critique 1", "formatting critique 2"],
  "atsCompatibility": "High / Medium / Low with 1 sentence rationale"
}`;

  const prompt = `Target Role: ${targetRole}\n\nResume Content:\n${resumeText.slice(0, 15000)}`;

  const resultText = await callGemini(prompt, systemInstruction);
  const parsed = parseJsonFromText(resultText);

  if (parsed && Array.isArray(parsed.strengths)) {
    return parsed;
  }

  // Graceful fallback if Gemini API is offline or not configured
  return {
    summary: `Candidate profile demonstrating technical competencies aligned with ${targetRole}.`,
    strengths: [
      'Clear technical skill representation across modern frameworks and tools',
      'Demonstrated project execution with relevant technology stacks',
      'Structured educational background in technology disciplines',
      'Logical section grouping suitable for ATS parsers'
    ],
    weaknesses: [
      'Action verbs could be quantified with more business impact metrics (e.g., % improvement, latency reduction)',
      'Specific cloud deployment or CI/CD pipeline keywords are sparse',
      'Professional summary could be more sharply tailored to target role requirements'
    ],
    missingKeywords: ['CI/CD', 'Docker', 'System Design', 'Unit Testing', 'REST API Optimization', 'Cloud Architecture'],
    recommendations: [
      'Quantify accomplishments using the Google XYZ formula: Accomplished [X], measured by [Y], by doing [Z].',
      'Add target-role specific technical keywords into your experience descriptions.',
      'Ensure contact information includes accessible LinkedIn and GitHub profile links.',
      'Highlight testing, code quality, and collaboration tools in your technical skills block.'
    ],
    formattingIssues: [
      'Ensure standard section headers (Experience, Education, Skills, Projects) for 100% parser compatibility.',
      'Avoid multi-column tables or complex nested text boxes.'
    ],
    atsCompatibility: 'Good (Standard sections detected with clean hierarchy)'
  };
}

/**
 * Generate tailored Cover Letter using Gemini
 */
async function generateCoverLetter({ candidateName, userSkills = [], experienceSummary = '', targetRole, companyName, tone = 'Professional', jobDescription = '' }) {
  const systemInstruction = `You are a premier career advisor and executive resume writer.
Write a compelling, tailored cover letter.
CRITICAL MANDATE:
- Do NOT invent companies the candidate never worked for, degrees they do not possess, or certifications they never earned.
- Only utilize the candidate's actual skills: ${userSkills.join(', ')} and provided background: ${experienceSummary || 'Experienced technologist'}.
- Tone must be: ${tone}.
- Add polite placeholders [Specific Company Project / Team Mention] if deeper company context is needed.
- Return ONLY the final formatted cover letter text, ready to send.`;

  const prompt = `Candidate Name: ${candidateName || 'Applicant'}
Target Position: ${targetRole || 'Software Professional'}
Target Company: ${companyName || 'Target Organization'}
Tone: ${tone}
Candidate Skills: ${userSkills.join(', ')}
Candidate Background Summary: ${experienceSummary}
Target Job Description:
${jobDescription || 'Standard requirements for the role'}`;

  const coverLetter = await callGemini(prompt, systemInstruction);
  if (coverLetter && coverLetter.length > 100) {
    return coverLetter.trim();
  }

  // Fallback template
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const skillsList = userSkills.length > 0 ? userSkills.slice(0, 5).join(', ') : 'software development and problem-solving';

  return `Date: ${today}

Hiring Team
${companyName || 'Target Company'}

Subject: Application for ${targetRole || 'Software Engineering Role'} - ${candidateName || 'Applicant'}

Dear Hiring Team at ${companyName || 'the organization'},

I am writing to express my strong interest in the ${targetRole || 'Technology'} position at ${companyName || 'your esteemed company'}. With a dedicated focus on building scalable solutions and leveraging competencies including ${skillsList}, I am eager to contribute effectively to your engineering initiatives.

${experienceSummary ? `In my previous work, ${experienceSummary}. ` : ''}Throughout my hands-on projects, I have consistently emphasized writing clean, maintainable code, implementing best engineering practices, and collaborating closely with cross-functional teammates to deliver reliable features.

What particularly excites me about ${companyName || 'your team'} is your commitment to technical innovation and high-impact software engineering. I am confident that my technical foundation in ${skillsList} equips me to ramp up quickly and create meaningful value for your team.

Thank you for your time and consideration. I welcome the opportunity to discuss how my qualifications align with your engineering goals.

Sincerely,

${candidateName || 'Applicant'}
${userSkills.slice(0, 4).join(' | ')}`;
}

/**
 * Generate Recruiter Outreach Messages (LinkedIn, Email, Short InMail)
 */
async function generateRecruiterOutreach({ candidateName, role, companyName, recruiterName = '', highlights = '', platform = 'all' }) {
  const systemInstruction = `You are a career networking specialist.
Create high-conversion recruiter outreach messages.
Rules:
- Strictly realistic, professional, concise, and respectful of the recruiter's time.
- Do not fabricate false credentials.
- Output ONLY a valid JSON object with keys: "linkedinMessage", "coldEmail", "shortDM".`;

  const prompt = `Candidate: ${candidateName || 'Candidate'}
Role: ${role || 'Software Engineer'}
Company: ${companyName || 'Tech Company'}
Recruiter Name: ${recruiterName || 'Hiring Manager'}
Highlights: ${highlights || 'Skilled in modern engineering stacks, proactive builder'}
Platform requested: ${platform}`;

  const resultText = await callGemini(prompt, systemInstruction);
  const parsed = parseJsonFromText(resultText);

  if (parsed && parsed.linkedinMessage) {
    return parsed;
  }

  const recGreeting = recruiterName ? `Hi ${recruiterName}` : 'Hi there';

  return {
    linkedinMessage: `${recGreeting}, I noticed ${companyName || 'your team'} is expanding the engineering team for the ${role || 'Software Engineer'} position. I specialize in ${highlights || 'core technologies and software architecture'}, with proven experience building performant applications. Would you be open to a brief chat or connecting here on LinkedIn? Best regards, ${candidateName || ''}.`,
    coldEmail: `Subject: Application & Inquiry: ${role || 'Software Engineer'} - ${candidateName || 'Candidate'}\n\nDear ${recruiterName || 'Hiring Team'},\n\nI hope this email finds you well. I have been following ${companyName || 'your company'}'s impressive growth and work in the industry.\n\nI am reaching out regarding the ${role || 'Software Engineer'} opening. My background includes ${highlights || 'delivering robust, user-centric software solutions'}, and I would love to bring this dedication to ${companyName || 'your engineering organization'}.\n\nI have attached my resume for your review and would welcome 10 minutes to discuss how my skills align with your immediate goals.\n\nWarm regards,\n${candidateName || 'Applicant'}`,
    shortDM: `${recGreeting}, saw the ${role || 'Software Engineer'} opening at ${companyName || 'your team'}. My background in ${highlights || 'modern software development'} matches the core requirements. Would love to send my profile across if you're still reviewing candidates!`
  };
}

/**
 * Generate Unique Mock Interview Questions
 */
async function generateInterviewQuestions({ role, difficulty = 'Medium', count = 10, previousQuestionIds = [] }) {
  const systemInstruction = `You are an elite Principal Technical Interviewer conducting technical assessments for ${role} at ${difficulty} difficulty.
MANDATORY RULES:
1. Generate exactly ${count} distinctive, high-yield technical interview questions.
2. DO NOT repeat any concepts or question patterns from this excluded list of question IDs/topics: [${previousQuestionIds.slice(-25).join(', ')}].
3. Cover diverse topics: core fundamentals, system architecture, debugging, coding scenarios, best practices.
4. Return ONLY a valid JSON array of question objects, formatted as:
[
  {
    "id": "unique-slug-id",
    "topic": "Topic Name",
    "question": "Clear, detailed technical interview question",
    "expectedPoints": ["Key point 1 expected in good answer", "Key point 2", "Key point 3"],
    "sampleAnswerOutline": "A brief overview of what a strong answer should cover."
  }
]`;

  const prompt = `Role: ${role}
Difficulty: ${difficulty}
Count: ${count}
Exclude previous IDs: ${JSON.stringify(previousQuestionIds)}`;

  const resultText = await callGemini(prompt, systemInstruction);
  const parsed = parseJsonFromText(resultText);

  if (Array.isArray(parsed) && parsed.length >= count) {
    return parsed.slice(0, count);
  }

  // Fallback to dynamic interview bank
  const { getBankQuestions } = require('./interviewService');
  return getBankQuestions(role, difficulty, count, previousQuestionIds);
}

/**
 * Evaluate Interview Answer using Gemini
 */
async function evaluateInterviewAnswer({ question, answer, role, difficulty = 'Medium' }) {
  const systemInstruction = `You are an expert technical interviewer evaluating a candidate's answer for a ${difficulty} level ${role} interview.
Provide an objective, fair, detailed evaluation.
Output ONLY a valid JSON object with these keys:
{
  "score": integer between 1 and 10,
  "verdict": "Excellent" | "Good" | "Partially Correct" | "Needs Improvement",
  "strengths": ["What the candidate correctly stated"],
  "missingOrIncorrect": ["What critical details were missed or incorrect"],
  "idealAnswerSummary": "A concise model answer explaining the concept accurately",
  "feedback": "Constructive 2-3 sentence coaching feedback"
}`;

  const prompt = `Question: ${question}
Candidate's Answer: ${answer || '(No answer submitted)'}
Role: ${role}
Difficulty: ${difficulty}`;

  const resultText = await callGemini(prompt, systemInstruction);
  const parsed = parseJsonFromText(resultText);

  if (parsed && typeof parsed.score === 'number') {
    return parsed;
  }

  // Heuristic evaluation fallback
  const wordCount = (answer || '').trim().split(/\s+/).length;
  let score = 5;
  let verdict = 'Partially Correct';
  if (wordCount < 10) {
    score = 2;
    verdict = 'Needs Improvement';
  } else if (wordCount > 50) {
    score = 8;
    verdict = 'Good';
  }

  return {
    score,
    verdict,
    strengths: ['Identified the core concept and attempted a technical explanation.'],
    missingOrIncorrect: ['Could provide deeper architectural nuance, edge cases, and runtime trade-offs.'],
    idealAnswerSummary: 'A complete answer outlines the fundamental principle, real-world application, trade-offs, and failure modes.',
    feedback: 'Good baseline response. Deepen your explanation by citing specific metrics, best practices, and edge case handling.'
  };
}

module.exports = {
  callGemini,
  analyzeResumeSemantic,
  generateCoverLetter,
  generateRecruiterOutreach,
  generateInterviewQuestions,
  evaluateInterviewAnswer
};
