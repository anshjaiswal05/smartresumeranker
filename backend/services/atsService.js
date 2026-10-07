const { analyzeResumeSemantic } = require('./geminiService');

// Comprehensive Technical Skills Catalog
const TECH_SKILLS_DICTIONARY = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'golang', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'dart', 'matlab', 'shell', 'bash', 'powershell',
  'react', 'react.js', 'react native', 'angular', 'vue', 'vue.js', 'next.js', 'nuxt', 'svelte', 'jquery', 'html', 'html5', 'css', 'css3', 'sass', 'scss', 'tailwind', 'tailwind css', 'bootstrap', 'material-ui',
  'node.js', 'nodejs', 'express', 'express.js', 'nest.js', 'nestjs', 'fastapi', 'flask', 'django', 'spring', 'spring boot', 'asp.net', 'laravel', 'rails', 'ruby on rails', 'koa',
  'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'oracle', 'ms sql', 'mongodb', 'redis', 'cassandra', 'dynamodb', 'elasticsearch', 'couchdb', 'neo4j', 'firebase', 'firestore', 'supabase',
  'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'jenkins', 'gitlab ci', 'github actions', 'circleci', 'helm', 'prometheus', 'grafana', 'datadog', 'linux', 'unix', 'nginx', 'apache',
  'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'rest', 'rest api', 'restful', 'graphql', 'grpc', 'soap', 'websockets', 'kafka', 'rabbitmq', 'microservices', 'serverless', 'lambda',
  'machine learning', 'deep learning', 'artificial intelligence', 'nlp', 'computer vision', 'tensorflow', 'pytorch', 'scikit-learn', 'keras', 'opencv', 'pandas', 'numpy', 'scipy', 'tableau', 'power bi', 'spark', 'hadoop',
  'unit testing', 'jest', 'mocha', 'chai', 'cypress', 'selenium', 'playwright', 'pytest', 'junit', 'postman', 'swagger', 'ci/cd', 'agile', 'scrum', 'system design', 'data structures', 'algorithms'
];

const SOFT_SKILLS_DICTIONARY = [
  'problem solving', 'communication', 'teamwork', 'collaboration', 'leadership', 'adaptability', 'critical thinking',
  'time management', 'work ethic', 'conflict resolution', 'emotional intelligence', 'active listening', 'mentoring',
  'analytical thinking', 'attention to detail', 'decision making', 'creativity', 'presentation skills', 'interpersonal skills', 'agile mindset'
];

const ACTION_VERBS = [
  'architected', 'developed', 'engineered', 'implemented', 'designed', 'built', 'spearheaded', 'optimized',
  'refactored', 'deployed', 'automated', 'integrated', 'orchestrated', 'accelerated', 'launched', 'delivered',
  'streamlined', 'mentored', 'led', 'analyzed', 'enhanced', 'managed', 'created', 'resolved'
];

/**
 * Deterministically extract sections, contacts, skills and calculate ATS score
 */
function parseResumeDeterministic(text) {
  const cleanText = text.replace(/\r\n/g, '\n');
  const lowerText = cleanText.toLowerCase();

  // 1. Extract Contact Info
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
  const phoneRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}/;
  const linkedinRegex = /(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i;
  const githubRegex = /(github\.com\/[a-zA-Z0-9_-]+)/i;
  const portfolioRegex = /(https?:\/\/[^\s]+)/i;

  const emailMatch = cleanText.match(emailRegex);
  const phoneMatch = cleanText.match(phoneRegex);
  const linkedinMatch = cleanText.match(linkedinRegex);
  const githubMatch = cleanText.match(githubRegex);

  // 2. Extract Candidate Name (First non-empty line or capitalized block)
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let candidateName = 'Job Seeker';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (!line.includes('@') && !line.includes('http') && !line.match(/\d{5,}/) && line.length < 50 && line.length > 2) {
      if (!line.toLowerCase().includes('resume') && !line.toLowerCase().includes('curriculum')) {
        candidateName = line;
        break;
      }
    }
  }

  // 3. Section Detection
  const sectionKeywords = {
    summary: ['summary', 'professional summary', 'profile', 'objective', 'about me'],
    experience: ['experience', 'work experience', 'employment', 'work history', 'internship', 'professional experience'],
    education: ['education', 'academic background', 'academics', 'qualifications', 'degrees'],
    skills: ['skills', 'technical skills', 'technologies', 'competencies', 'core competencies', 'tech stack'],
    projects: ['projects', 'academic projects', 'personal projects', 'key projects'],
    certifications: ['certifications', 'licenses', 'certificates', 'courses']
  };

  const detectedSections = {};
  for (const [section, keywords] of Object.entries(sectionKeywords)) {
    detectedSections[section] = keywords.some(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(cleanText);
    });
  }

  // 4. Skills Extraction
  const detectedTechSkills = [];
  for (const skill of TECH_SKILLS_DICTIONARY) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9+#])${escaped}([^a-zA-Z0-9+#]|$)`, 'i');
    if (regex.test(lowerText)) {
      // Capitalize nicely
      const formattedSkill = skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (!detectedTechSkills.includes(formattedSkill)) {
        detectedTechSkills.push(formattedSkill);
      }
    }
  }

  const detectedSoftSkills = [];
  for (const skill of SOFT_SKILLS_DICTIONARY) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');
    if (regex.test(lowerText)) {
      const formatted = skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (!detectedSoftSkills.includes(formatted)) {
        detectedSoftSkills.push(formatted);
      }
    }
  }

  // 5. Action verbs detection
  const detectedVerbs = ACTION_VERBS.filter(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'i');
    return regex.test(lowerText);
  });

  // 6. Section Content Extraction Heuristics
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // 7. Calculate Deterministic ATS Score (0 - 100)
  let contactScore = 0;
  if (emailMatch) contactScore += 5;
  if (phoneMatch) contactScore += 4;
  if (linkedinMatch) contactScore += 3;
  if (githubMatch) contactScore += 3;

  let sectionScore = 0;
  if (detectedSections.experience) sectionScore += 7;
  if (detectedSections.education) sectionScore += 6;
  if (detectedSections.skills) sectionScore += 6;
  if (detectedSections.summary) sectionScore += 3;
  if (detectedSections.projects) sectionScore += 3;

  let skillScore = Math.min(25, (detectedTechSkills.length * 2) + Math.min(5, detectedSoftSkills.length));

  let depthScore = 0;
  if (wordCount >= 250 && wordCount <= 1200) depthScore += 10;
  else if (wordCount > 100) depthScore += 5;
  depthScore += Math.min(10, detectedVerbs.length * 2);

  let formatScore = 15;
  const formattingCritiques = [];
  if (wordCount < 180) {
    formatScore -= 5;
    formattingCritiques.push('Resume length is too short; recommend 300 to 700 words.');
  } else if (wordCount > 1400) {
    formatScore -= 3;
    formattingCritiques.push('Resume exceeds 1400 words; consider condensing to 1-2 focused pages.');
  }

  const bulletCount = (cleanText.match(/[•\-\*]\s+/g) || []).length;
  if (bulletCount < 5) {
    formatScore -= 3;
    formattingCritiques.push('Limited bullet points detected; ATS systems prefer clear bulleted achievements.');
  }

  const rawScore = contactScore + sectionScore + skillScore + depthScore + formatScore;
  const totalScore = Math.max(25, Math.min(98, Math.round(rawScore)));

  return {
    candidateName,
    contactInfo: {
      email: emailMatch ? emailMatch[1] : null,
      phone: phoneMatch ? phoneMatch[0].trim() : null,
      linkedin: linkedinMatch ? `https://${linkedinMatch[1]}` : null,
      github: githubMatch ? `https://${githubMatch[1]}` : null
    },
    sectionsDetected: detectedSections,
    technicalSkills: detectedTechSkills,
    softSkills: detectedSoftSkills,
    wordCount,
    actionVerbsDetected: detectedVerbs,
    scoreBreakdown: {
      totalScore,
      contactScore: `${contactScore}/15`,
      sectionScore: `${sectionScore}/25`,
      skillScore: `${skillScore}/25`,
      depthScore: `${depthScore}/20`,
      formatScore: `${formatScore}/15`
    },
    formattingIssues: formattingCritiques
  };
}

/**
 * Orchestrator: Deterministic Parsing + Gemini Semantic AI
 */
async function analyzeResume({ text, targetRole = 'Software Engineer' }) {
  if (!text || text.trim().length === 0) {
    throw new Error('Resume content is empty.');
  }

  // 1. Deterministic Extraction
  const deterministicData = parseResumeDeterministic(text);

  // 2. Gemini Semantic AI Analysis
  let semanticData = null;
  try {
    semanticData = await analyzeResumeSemantic(text, targetRole);
  } catch (err) {
    console.error('Semantic analysis error:', err);
  }

  // 3. Synthesize comprehensive ATS report
  const atsScore = deterministicData.scoreBreakdown.totalScore;
  const strengths = (semanticData && semanticData.strengths && semanticData.strengths.length > 0)
    ? semanticData.strengths
    : [
        `Strong technical skills identified (${deterministicData.technicalSkills.slice(0, 5).join(', ')})`,
        'Includes essential contact and identity information',
        'Standard chronological structure compatible with ATS engines',
        'Demonstrates practical project implementation experience'
      ];

  const weaknesses = (semanticData && semanticData.weaknesses && semanticData.weaknesses.length > 0)
    ? semanticData.weaknesses
    : [
        'Could include more quantifiable business metrics (latency %, user count, revenue impact)',
        'Key cloud automation & testing frameworks could be more prominently emphasized'
      ];

  const recommendations = (semanticData && semanticData.recommendations && semanticData.recommendations.length > 0)
    ? semanticData.recommendations
    : [
        'Align keywords specifically with the target role job description.',
        'Adopt the STAR or Google XYZ impact formula for each project bullet.',
        'Keep standard resume section headings: Summary, Skills, Experience, Education, Projects.'
      ];

  const missingKeywords = (semanticData && semanticData.missingKeywords && semanticData.missingKeywords.length > 0)
    ? semanticData.missingKeywords
    : ['CI/CD', 'Docker', 'System Design', 'Testing', 'Cloud Platforms'];

  const formattingIssues = [
    ...deterministicData.formattingIssues,
    ...((semanticData && semanticData.formattingIssues) || [])
  ];

  return {
    candidateName: deterministicData.candidateName,
    contactInfo: deterministicData.contactInfo,
    professionalSummary: (semanticData && semanticData.summary) ? semanticData.summary : `Software professional equipped with skills in ${deterministicData.technicalSkills.slice(0, 4).join(', ')}.`,
    technicalSkills: deterministicData.technicalSkills,
    softSkills: deterministicData.softSkills,
    detectedKeywords: [...deterministicData.technicalSkills, ...deterministicData.softSkills],
    sectionsDetected: deterministicData.sectionsDetected,
    wordCount: deterministicData.wordCount,
    actionVerbsCount: deterministicData.actionVerbsDetected.length,
    atsScore,
    scoreBreakdown: deterministicData.scoreBreakdown,
    strengths,
    weaknesses,
    missingKeywords,
    formattingIssues,
    keywordOptimization: {
      densityRating: deterministicData.technicalSkills.length > 8 ? 'High' : 'Moderate',
      totalDetectedSkills: deterministicData.technicalSkills.length,
      actionVerbsCount: deterministicData.actionVerbsDetected.length
    },
    atsCompatibility: (semanticData && semanticData.atsCompatibility) ? semanticData.atsCompatibility : (atsScore >= 75 ? 'High (ATS-Friendly layout and section structure)' : 'Moderate (Requires keyword refinement)'),
    recommendations,
    analyzedAt: new Date().toISOString()
  };
}

module.exports = {
  parseResumeDeterministic,
  analyzeResume
};
