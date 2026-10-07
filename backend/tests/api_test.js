const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
const TEST_TOKEN = `dev_token_test_user_${Date.now()}`;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = {
      'Authorization': `Bearer ${TEST_TOKEN}`,
      ...headers
    };

    let postData = null;
    if (body && typeof body === 'object' && !(body instanceof Buffer)) {
      postData = JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    } else if (body instanceof Buffer) {
      postData = body;
    }

    const req = http.request(url, { method, headers: reqHeaders }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE FULL-STACK API TEST SUITE ---');
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Health
  await test('GET /api/health', async () => {
    const res = await request('GET', '/api/health');
    if (res.status !== 200 || res.data.status !== 'healthy') throw new Error(`Unexpected status ${res.status}`);
  });

  // 2. Static files
  await test('GET / (Index HTML)', async () => {
    const res = await request('GET', '/');
    if (res.status !== 200 || !res.raw.includes('SMART RESUME RANKER')) throw new Error('Failed to load index.html');
  });

  // 3. User Sign Up
  await test('POST /api/auth/verify (Sign Up)', async () => {
    const res = await request('POST', '/api/auth/verify', { authType: 'signup' });
    if (res.status !== 201 && res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
  });

  // 4. Duplicate Sign Up Prevention
  await test('POST /api/auth/verify (Duplicate Sign Up Block)', async () => {
    const res = await request('POST', '/api/auth/verify', { authType: 'signup' });
    if (res.status !== 409 || res.data.code !== 'ACCOUNT_EXISTS') {
      throw new Error(`Expected 409 ACCOUNT_EXISTS, got ${res.status}`);
    }
  });

  // 5. User Login with Existing Account
  await test('POST /api/auth/verify (Login Existing User)', async () => {
    const res = await request('POST', '/api/auth/verify', { authType: 'login' });
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Expected 200 OK, got ${res.status}`);
    }
  });

  // 6. User Profile Update & Fetch
  await test('PUT & GET /api/user/profile', async () => {
    const putRes = await request('PUT', '/api/user/profile', {
      fullName: 'Alex Test Engineer',
      designation: 'Senior Full Stack Engineer',
      phone: '+91 9999988888',
      address: 'Bengaluru, India',
      githubUrl: 'https://github.com/alex-test',
      linkedinUrl: 'https://linkedin.com/in/alex-test',
      portfolioUrl: 'https://alex-test.dev',
      profileCompleted: true
    });
    if (putRes.status !== 200) throw new Error('Failed to update profile');

    const getRes = await request('GET', '/api/user/profile');
    if (getRes.status !== 200 || getRes.data.user.fullName !== 'Alex Test Engineer') {
      throw new Error('Profile fetch mismatch');
    }
  });

  // 7. Tech Roles Catalog
  await test('GET /api/skills/roles', async () => {
    const res = await request('GET', '/api/skills/roles');
    if (res.status !== 200 || !res.data.roles || res.data.roles.length < 5) {
      throw new Error('Roles catalog empty or invalid');
    }
  });

  // 8. Skill Gap Analysis
  await test('POST /api/skills/analyze', async () => {
    const res = await request('POST', '/api/skills/analyze', {
      targetRoleId: 'frontend-developer',
      userSkills: ['HTML5', 'CSS3', 'JavaScript', 'Git']
    });
    if (res.status !== 200 || !res.data.data.missingSkills) {
      throw new Error('Skill gap analysis failed');
    }
  });

  // 9. Learning Roadmaps
  await test('GET /api/roadmaps and /api/roadmaps/frontend', async () => {
    const listRes = await request('GET', '/api/roadmaps');
    if (listRes.status !== 200 || !listRes.data.roadmaps.length) throw new Error('Roadmaps list failed');

    const detailRes = await request('GET', '/api/roadmaps/frontend');
    if (detailRes.status !== 200 || !detailRes.data.roadmap.topics.length) throw new Error('Roadmap detail failed');
  });

  // 10. Roadmap Progress Tracking
  await test('POST & GET /api/roadmaps/progress', async () => {
    const postRes = await request('POST', '/api/roadmaps/progress', {
      role: 'frontend',
      topicId: 'fe-internet',
      status: 'Completed'
    });
    if (postRes.status !== 200) throw new Error('Failed to save progress');

    const getRes = await request('GET', '/api/roadmaps/progress/frontend');
    if (getRes.status !== 200 || getRes.data.progress['fe-internet'] !== 'Completed') {
      throw new Error('Failed to fetch updated progress');
    }
  });

  // 11. AI Cover Letter Generation
  await test('POST /api/ai/cover-letter', async () => {
    const res = await request('POST', '/api/ai/cover-letter', {
      jobTitle: 'Senior Full Stack Engineer',
      targetCompany: 'Razorpay',
      letterTone: 'Professional',
      jobDescription: 'Looking for an experienced engineer skilled in React, Node.js, microservices.'
    });
    if (res.status !== 200 || !res.data.coverLetter || res.data.coverLetter.length < 50) {
      throw new Error('Cover letter output empty or invalid');
    }
  });

  // 12. AI Recruiter Outreach Generation
  await test('POST /api/ai/recruiter-outreach', async () => {
    const res = await request('POST', '/api/ai/recruiter-outreach', {
      companyName: 'Swiggy',
      jobTitle: 'Backend SDE-2',
      recruiterName: 'Priya'
    });
    if (res.status !== 200 || !res.data.messages.linkedinMessage || !res.data.messages.coldEmail) {
      throw new Error('Outreach messages missing required fields');
    }
  });

  // 13. Mock Interview Start (Unique Questions)
  let testInterviewId = null;
  let testQuestions = [];
  await test('POST /api/interview/start (Unique Questions Engine)', async () => {
    const res = await request('POST', '/api/interview/start', {
      targetPosition: 'Frontend Developer',
      difficulty: 'Medium',
      questionCount: 10
    });
    if (res.status !== 200 || !res.data.session.questions || res.data.session.questions.length !== 10) {
      throw new Error('Interview question generation failed');
    }
    testInterviewId = res.data.session.interviewId;
    testQuestions = res.data.session.questions;
  });

  // 14. Mock Interview Evaluate
  await test('POST /api/interview/evaluate', async () => {
    const answers = testQuestions.map(q => ({
      id: q.id,
      answer: 'The event loop processes microtasks like promises first before macrotasks.'
    }));

    const res = await request('POST', '/api/interview/evaluate', {
      interviewId: testInterviewId,
      answers
    });
    if (res.status !== 200 || typeof res.data.result.overallScore !== 'number') {
      throw new Error('Interview evaluation failed');
    }
  });

  // 15. Mock Interview History
  await test('GET /api/interview/history', async () => {
    const res = await request('GET', '/api/interview/history');
    if (res.status !== 200 || !Array.isArray(res.data.interviews) || res.data.interviews.length === 0) {
      throw new Error('Interview history failed');
    }
  });

  // 16. Job Explorer Search & Filters
  await test('GET /api/jobs', async () => {
    const res = await request('GET', '/api/jobs?location=Bengaluru');
    if (res.status !== 200 || !res.data.data.jobs || res.data.data.jobs.length === 0) {
      throw new Error('Job search failed');
    }
  });

  // 17. Save & Retrieve Job
  await test('POST & GET /api/jobs/save', async () => {
    const sampleJob = {
      id: 'test-job-99',
      title: 'Senior React Architect',
      company: 'TechCorp India',
      location: 'Bengaluru, Karnataka',
      experience: '4-7 Years',
      salary: '₹30 - ₹45 LPA',
      skills: ['React', 'TypeScript'],
      description: 'Lead next-generation architecture.',
      postedDate: 'Today',
      applyLink: 'https://example.com',
      source: 'Direct Careers'
    };
    const saveRes = await request('POST', '/api/jobs/save', sampleJob);
    if (saveRes.status !== 200) throw new Error('Failed to save job');

    const getRes = await request('GET', '/api/jobs/saved');
    if (getRes.status !== 200 || !getRes.data.jobs.some(j => j.id === 'test-job-99')) {
      throw new Error('Saved job not found in user list');
    }
  });

  // 18. Resume Builder Save & Load
  await test('POST & GET /api/resume-builder', async () => {
    const docData = {
      template: 'professional',
      personalInfo: { fullName: 'Builder Test Candidate', email: 'test@candidate.com' },
      skills: ['Node.js', 'React', 'Docker']
    };
    const saveRes = await request('POST', '/api/resume-builder/save', docData);
    if (saveRes.status !== 200) throw new Error('Save resume builder failed');

    const loadRes = await request('GET', '/api/resume-builder');
    if (loadRes.status !== 200 || loadRes.data.data.template !== 'professional') {
      throw new Error('Load resume builder failed');
    }
  });

  // 19. Dashboard Stats
  await test('GET /api/dashboard/stats', async () => {
    const res = await request('GET', '/api/dashboard/stats');
    if (res.status !== 200 || !res.data.stats || !res.data.stats.recentActivity) {
      throw new Error('Dashboard stats failed');
    }
  });

  // 20. Multipart Resume Upload & ATS Deterministic + Semantic Scoring
  await test('POST /api/resume/analyze (Upload & Immediate Cleanup)', async () => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const resumeText = `Alex Developer
alex.developer@example.com | +91 9876543210 | linkedin.com/in/alexdev | github.com/alexdev
Bengaluru, Karnataka, India

PROFESSIONAL SUMMARY
Senior Software Engineer with 4 years of experience architecting and developing full-stack web applications, microservices, and high-performance REST APIs. Proven record of optimizing web performance and engineering robust cloud solutions.

WORK EXPERIENCE
Senior Full Stack Engineer | Innovatech Solutions | 2022 - Present
- Architected and deployed microservices handling 2M+ requests per day with Node.js, Express, and PostgreSQL.
- Optimized database indexing and Redis caching, cutting P99 API latency by 45%.
- Engineered responsive React and TypeScript frontend, boosting Lighthouse Core Web Vitals to 96.
- Spearheaded CI/CD automation pipelines with Docker and GitHub Actions for zero-downtime releases.

Software Engineer | Alpha Technologies | 2020 - 2022
- Developed scalable backend services in Python and Django for financial data processing.
- Built reusable UI components with HTML5, CSS3, and modern JavaScript.
- Implemented unit testing and integration testing with Jest and PyTest, achieving 88% test coverage.

EDUCATION
B.Tech in Computer Science and Engineering | National Institute of Technology | 2020
CGPA: 8.7 / 10

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, SQL, HTML5, CSS3
Frameworks & Libraries: React, Node.js, Express, Django, Tailwind CSS, Redux
Databases & Cloud: PostgreSQL, MongoDB, Redis, Docker, AWS, Git, CI/CD, REST APIs
Soft Skills: Problem Solving, Leadership, Teamwork, Agile, Communication

PROJECTS
Smart Resume Ranker Platform
- Built end-to-end career acceleration platform with ATS deterministic scoring and AI evaluation.
- Implemented responsive mobile drawer navigation and real-time dashboard analytics.`;

    // Construct multipart form-data payload with a dummy text file as resume.doc
    const crlf = '\r\n';
    let body = Buffer.from(
      `--${boundary}${crlf}` +
      `Content-Disposition: form-data; name="targetRole"${crlf}${crlf}` +
      `Senior Full Stack Engineer${crlf}` +
      `--${boundary}${crlf}` +
      `Content-Disposition: form-data; name="resume"; filename="resume.doc"${crlf}` +
      `Content-Type: application/msword${crlf}${crlf}` +
      `${resumeText}${crlf}` +
      `--${boundary}--${crlf}`
    );

    const res = await request('POST', '/api/resume/analyze', body, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length
    });

    if (res.status !== 200 || !res.data.data || typeof res.data.data.atsScore !== 'number') {
      throw new Error(`Resume analysis failed with status ${res.status}: ${JSON.stringify(res.data)}`);
    }

    if (res.data.data.atsScore < 60) {
      throw new Error(`ATS score unexpected low: ${res.data.data.atsScore}`);
    }

    // Verify temp_uploads directory has no lingering files
    const tempDir = path.join(__dirname, '../temp_uploads');
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      if (files.length > 0) {
        throw new Error(`Temporary file was not cleaned up! Found: ${files.join(', ')}`);
      }
    }
  });

  console.log(`\n====================================================`);
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log(`====================================================`);

  if (passed === total) {
    console.log('🎉 ALL FULL-STACK SYSTEM TESTS PASSED SUCCESSFULLY!');
  } else {
    process.exit(1);
  }
}

runTests().catch(e => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
