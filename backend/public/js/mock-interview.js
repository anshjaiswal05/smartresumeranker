// Smart Resume Ranker - Mock Interview System Logic

let currentSession = null;
let currentQuestionIndex = 0;
let userAnswersMap = {}; // questionId -> answerText

async function initMockInterview() {
  bindConfigControls();
  await loadInterviewHistory();
}

function bindConfigControls() {
  const startBtn = document.getElementById('btn-start-interview');
  if (startBtn) {
    startBtn.addEventListener('click', startNewInterview);
  }

  const nextBtn = document.getElementById('btn-next-question');
  if (nextBtn) {
    nextBtn.addEventListener('click', goToNextQuestion);
  }

  const prevBtn = document.getElementById('btn-prev-question');
  if (prevBtn) {
    prevBtn.addEventListener('click', goToPrevQuestion);
  }

  const submitBtn = document.getElementById('btn-submit-interview');
  if (submitBtn) {
    submitBtn.addEventListener('click', submitAndEvaluateInterview);
  }

  const retakeBtn = document.getElementById('btn-retake-interview');
  if (retakeBtn) {
    retakeBtn.addEventListener('click', resetInterviewView);
  }
}

/**
 * Start Interview
 */
async function startNewInterview() {
  const roleSelect = document.getElementById('select-interview-role');
  const diffSelect = document.getElementById('select-interview-difficulty');
  const countSelect = document.getElementById('select-question-count');
  const startBtn = document.getElementById('btn-start-interview');

  const targetPosition = roleSelect ? roleSelect.value : 'Frontend Developer';
  const difficulty = diffSelect ? diffSelect.value : 'Medium';
  const questionCount = countSelect ? parseInt(countSelect.value, 10) : 10;

  if (startBtn) {
    startBtn.disabled = true;
    startBtn.innerHTML = '<span class="spinner"></span> Selecting unique questions...';
  }

  try {
    const res = await apiRequest('/interview/start', {
      method: 'POST',
      body: JSON.stringify({
        targetPosition,
        difficulty,
        questionCount
      })
    });

    if (res.success && res.session) {
      currentSession = res.session;
      currentQuestionIndex = 0;
      userAnswersMap = {};

      document.getElementById('interview-setup-card').style.display = 'none';
      document.getElementById('interview-active-card').style.display = 'block';
      document.getElementById('interview-results-card').style.display = 'none';

      renderCurrentQuestion();
      showToast(`Interview started: ${currentSession.questions.length} questions loaded.`, 'success');
    }
  } catch (error) {
    console.error('Start interview error:', error);
    showToast('Failed to start interview: ' + error.message, 'error');
  } finally {
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.innerHTML = '🚀 Start AI Mock Interview';
    }
  }
}

/**
 * Render Active Question Card
 */
function renderCurrentQuestion() {
  if (!currentSession || !currentSession.questions) return;

  const total = currentSession.questions.length;
  const q = currentSession.questions[currentQuestionIndex];

  // Header progress
  const progressElem = document.getElementById('interview-progress-text');
  if (progressElem) progressElem.textContent = `Question ${currentQuestionIndex + 1} of ${total}`;

  const topicElem = document.getElementById('interview-question-topic');
  if (topicElem) topicElem.textContent = q.topic || 'General';

  const textElem = document.getElementById('interview-question-text');
  if (textElem) textElem.textContent = q.question;

  // Answer field
  const answerInput = document.getElementById('textarea-user-answer');
  if (answerInput) {
    answerInput.value = userAnswersMap[q.id] || '';
  }

  // Update navigation buttons
  const prevBtn = document.getElementById('btn-prev-question');
  if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;

  const nextBtn = document.getElementById('btn-next-question');
  const submitBtn = document.getElementById('btn-submit-interview');

  if (currentQuestionIndex === total - 1) {
    if (nextBtn) nextBtn.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'inline-flex';
  } else {
    if (nextBtn) nextBtn.style.display = 'inline-flex';
    if (submitBtn) submitBtn.style.display = 'none';
  }

  // Progress Bar
  const bar = document.getElementById('interview-stepper-bar');
  if (bar) {
    const pct = Math.round(((currentQuestionIndex + 1) / total) * 100);
    bar.style.width = `${pct}%`;
  }
}

function saveCurrentAnswer() {
  if (!currentSession || !currentSession.questions) return;
  const q = currentSession.questions[currentQuestionIndex];
  const answerInput = document.getElementById('textarea-user-answer');
  if (q && answerInput) {
    userAnswersMap[q.id] = answerInput.value.trim();
  }
}

function goToNextQuestion() {
  saveCurrentAnswer();
  if (currentQuestionIndex < currentSession.questions.length - 1) {
    currentQuestionIndex++;
    renderCurrentQuestion();
  }
}

function goToPrevQuestion() {
  saveCurrentAnswer();
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderCurrentQuestion();
  }
}

/**
 * Submit answers and evaluate with Gemini
 */
async function submitAndEvaluateInterview() {
  saveCurrentAnswer();

  const submitBtn = document.getElementById('btn-submit-interview');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> AI is grading your responses...';
  }

  const answersPayload = Object.entries(userAnswersMap).map(([id, answer]) => ({
    id,
    answer
  }));

  try {
    const res = await apiRequest('/interview/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        interviewId: currentSession.interviewId,
        answers: answersPayload
      })
    });

    if (res.success && res.result) {
      document.getElementById('interview-active-card').style.display = 'none';
      document.getElementById('interview-results-card').style.display = 'block';
      renderInterviewResults(res.result);
      await loadInterviewHistory();
      showToast('Interview successfully evaluated!', 'success');
    }
  } catch (error) {
    console.error('Evaluation error:', error);
    showToast('Failed to evaluate interview: ' + error.message, 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '🏁 Finish & Evaluate Interview';
    }
  }
}

function renderInterviewResults(result) {
  const scoreElem = document.getElementById('result-overall-score');
  if (scoreElem) scoreElem.textContent = `${result.overallScore}%`;

  const correctElem = document.getElementById('result-correct-count');
  if (correctElem) correctElem.textContent = `${result.correctAnswers} / ${result.totalQuestions}`;

  const roleElem = document.getElementById('result-interview-role');
  if (roleElem) roleElem.textContent = `${result.targetPosition} (${result.difficulty})`;

  // Topic Performance
  const topicListElem = document.getElementById('result-topic-breakdown');
  if (topicListElem) {
    topicListElem.innerHTML = (result.topicPerformance || []).map(tp => `
      <div style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:4px;">
          <span>${tp.topic}</span>
          <span>${tp.scorePercentage}%</span>
        </div>
        <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${tp.scorePercentage}%;background:${tp.scorePercentage >= 70 ? 'var(--accent-success)' : 'var(--accent-warning)'};"></div>
        </div>
      </div>
    `).join('');
  }

  // Strengths & Weaknesses
  const strengthsElem = document.getElementById('result-interview-strengths');
  if (strengthsElem) {
    strengthsElem.innerHTML = (result.strengths || []).map(s => `<li>${s}</li>`).join('');
  }

  const weaknessesElem = document.getElementById('result-interview-weaknesses');
  if (weaknessesElem) {
    weaknessesElem.innerHTML = (result.weaknesses || []).map(w => `<li>${w}</li>`).join('');
  }

  // Question by question review
  const reviewsContainer = document.getElementById('result-detailed-breakdown');
  if (reviewsContainer) {
    reviewsContainer.innerHTML = (result.evaluatedQuestions || []).map((eq, idx) => {
      const evalData = eq.evaluation || {};
      const verdictColor = evalData.score >= 7 ? 'var(--accent-success)' : (evalData.score >= 5 ? 'var(--accent-warning)' : 'var(--accent-danger)');

      return `
        <div class="card" style="margin-bottom:16px;border-left:4px solid ${verdictColor};">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span class="badge badge-primary">Q${idx + 1}: ${eq.topic}</span>
            <span class="badge" style="background:${verdictColor};color:#fff;">Score: ${evalData.score}/10 (${evalData.verdict || 'Reviewed'})</span>
          </div>
          <h4 style="font-size:15px;margin-bottom:8px;">${eq.question}</h4>
          <p style="font-size:13px;color:var(--text-secondary);background:var(--bg-tertiary);padding:10px;border-radius:6px;margin-bottom:8px;">
            <strong>Your Answer:</strong> ${eq.userAnswer || '<em>No answer provided</em>'}
          </p>
          <div style="font-size:13px;">
            <p style="color:var(--text-primary);margin-bottom:4px;"><strong>AI Feedback:</strong> ${evalData.feedback || ''}</p>
            <p style="color:var(--text-muted);"><strong>Model Outline:</strong> ${evalData.idealAnswerSummary || ''}</p>
          </div>
        </div>
      `;
    }).join('');
  }
}

function resetInterviewView() {
  document.getElementById('interview-setup-card').style.display = 'block';
  document.getElementById('interview-active-card').style.display = 'none';
  document.getElementById('interview-results-card').style.display = 'none';
}

async function loadInterviewHistory() {
  const historyContainer = document.getElementById('interview-history-list');
  if (!historyContainer) return;

  try {
    const res = await apiRequest('/interview/history');
    if (res.success && res.interviews && res.interviews.length > 0) {
      historyContainer.innerHTML = res.interviews.map(item => `
        <div class="card" style="padding:14px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h4 style="font-size:14px;">${item.targetPosition} (${item.difficulty})</h4>
            <span style="font-size:12px;color:var(--text-muted);">${new Date(item.completedAt).toLocaleDateString()}</span>
          </div>
          <div style="text-align:right;">
            <span class="badge badge-success" style="font-size:13px;">${item.overallScore}%</span>
          </div>
        </div>
      `).join('');
    } else {
      historyContainer.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:8px 0;">No previous mock interviews yet. Take your first one above!</div>';
    }
  } catch (err) {
    console.warn('History error:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initMockInterview();
});
