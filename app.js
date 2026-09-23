/**
 * AI Resume Classifier — Application Logic & UI Handlers
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const resumeTextEl = document.getElementById('resumeText');
  const jobTextEl = document.getElementById('jobText');
  const targetRoleInput = document.getElementById('targetRoleInput');
  const targetExpInput = document.getElementById('targetExpInput');
  const btnRunClassifier = document.getElementById('btnRunClassifier');
  const resultsDashboard = document.getElementById('resultsDashboard');

  // Sample Buttons
  const btnSampleHigh = document.getElementById('btnSampleHigh');
  const btnSampleModerate = document.getElementById('btnSampleModerate');
  const btnSampleLow = document.getElementById('btnSampleLow');

  // File Upload Elements
  const resumeDropzone = document.getElementById('resumeDropzone');
  const resumeFileInput = document.getElementById('resumeFileInput');
  const loadedFileBadge = document.getElementById('loadedFileBadge');
  const loadedFileName = document.getElementById('loadedFileName');
  const btnClearLoadedFile = document.getElementById('btnClearLoadedFile');

  // Clear All
  const btnResetAll = document.getElementById('btnResetAll');

  // Export Buttons
  const btnCopyMarkdown = document.getElementById('btnCopyMarkdown');
  const btnDownloadJson = document.getElementById('btnDownloadJson');
  const btnPrintReport = document.getElementById('btnPrintReport');

  // Settings Modal
  const btnSettingsModal = document.getElementById('btnSettingsModal');
  const settingsModal = document.getElementById('settingsModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const engineModeSelect = document.getElementById('engineModeSelect');
  const apiKeyGroup = document.getElementById('apiKeyGroup');
  const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
  const btnSaveSettings = document.getElementById('btnSaveSettings');

  // Toast
  const toast = document.getElementById('toast');

  // Global state
  let currentResult = null;
  let activeFilter = 'all';

  // Configure PDF.js worker
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  // Load saved settings
  const savedMode = localStorage.getItem('ai_engine_mode') || 'offline';
  const savedKey = localStorage.getItem('gemini_api_key') || '';
  engineModeSelect.value = savedMode;
  geminiApiKeyInput.value = savedKey;
  if (savedMode === 'gemini') apiKeyGroup.style.display = 'block';

  // -------------------------------------------------------------
  // Sample Loaders
  // -------------------------------------------------------------
  function loadSample(sampleKey) {
    const sample = SAMPLES[sampleKey];
    if (!sample) return;

    resumeTextEl.value = sample.resume;
    jobTextEl.value = sample.jobDescription;
    targetRoleInput.value = sample.jobRole;
    targetExpInput.value = sample.experienceLevel;

    loadedFileBadge.classList.remove('active');
    showToast(`Loaded "${sample.name}"`);
    
    // Automatically trigger classification for instant test-drive
    runClassification();
  }

  btnSampleHigh.addEventListener('click', () => loadSample('highMatch'));
  btnSampleModerate.addEventListener('click', () => loadSample('moderateMatch'));
  btnSampleLow.addEventListener('click', () => loadSample('lowMatch'));

  // -------------------------------------------------------------
  // Drag & Drop / File Upload Handling
  // -------------------------------------------------------------
  resumeDropzone.addEventListener('click', () => resumeFileInput.click());

  resumeDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    resumeDropzone.classList.add('dragover');
  });

  resumeDropzone.addEventListener('dragleave', () => {
    resumeDropzone.classList.remove('dragover');
  });

  resumeDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    resumeDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  resumeFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  });

  btnClearLoadedFile.addEventListener('click', () => {
    loadedFileBadge.classList.remove('active');
    resumeFileInput.value = '';
    resumeTextEl.value = '';
  });

  async function handleFileUpload(file) {
    loadedFileName.textContent = file.name;
    loadedFileBadge.classList.add('active');

    if (file.name.endsWith('.pdf')) {
      showToast("Parsing PDF document...");
      try {
        const text = await extractTextFromPdf(file);
        resumeTextEl.value = text;
        showToast(`Parsed ${file.name} successfully!`);
      } catch (err) {
        console.error("PDF Parsing error:", err);
        showToast("Error extracting PDF text. Please paste text directly.");
      }
    } else {
      // Read text/markdown/txt directly
      const reader = new FileReader();
      reader.onload = (event) => {
        resumeTextEl.value = event.target.result;
        showToast(`Loaded ${file.name}`);
      };
      reader.readAsText(file);
    }
  }

  async function extractTextFromPdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items.map(item => item.str);
      fullText += pageStrings.join(' ') + '\n\n';
    }
    return fullText;
  }

  // -------------------------------------------------------------
  // Execution: Run Classification
  // -------------------------------------------------------------
  btnRunClassifier.addEventListener('click', () => runClassification());

  async function runClassification() {
    const resumeText = resumeTextEl.value.trim();
    const jobText = jobTextEl.value.trim();
    const targetRole = targetRoleInput.value.trim();
    const targetExp = targetExpInput.value.trim();

    if (!resumeText) {
      alert("Please provide candidate resume content (paste text or upload a PDF/TXT file).");
      resumeTextEl.focus();
      return;
    }
    if (!jobText) {
      alert("Please provide the target Job Description content.");
      jobTextEl.focus();
      return;
    }

    btnRunClassifier.disabled = true;
    btnRunClassifier.innerHTML = `<span>⏳</span> Evaluating 10 Dimensions...`;

    try {
      const mode = localStorage.getItem('ai_engine_mode') || 'offline';
      const apiKey = localStorage.getItem('gemini_api_key');

      if (mode === 'gemini' && apiKey) {
        // Run deep LLM analysis using Gemini API
        currentResult = await runGeminiEvaluation(resumeText, jobText, targetRole, targetExp, apiKey);
      } else {
        // Run Built-in 10-step Engine
        currentResult = resumeClassifier.classify(resumeText, jobText, targetRole, targetExp);
      }

      renderResults(currentResult);
      resultsDashboard.classList.add('visible');
      resultsDashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      console.error(err);
      alert(`Classification error: ${err.message}`);
    } finally {
      btnRunClassifier.disabled = false;
      btnRunClassifier.innerHTML = `<span>⚡</span> Analyze & Classify Resume`;
    }
  }

  // -------------------------------------------------------------
  // Render Results Dashboard (10 Steps)
  // -------------------------------------------------------------
  function renderResults(result) {
    const summary = result.candidateSummary;

    // 1. Hero Summary & Score Gauge
    document.getElementById('candidateNameDisplay').textContent = summary.candidateName;
    document.getElementById('targetRoleDisplay').textContent = summary.targetRole;
    document.getElementById('experienceDisplay').textContent = summary.experience;
    document.getElementById('educationDisplay').textContent = summary.education;

    // Classification Badge
    const badgeEl = document.getElementById('classificationBadge');
    badgeEl.textContent = summary.classification;
    badgeEl.className = 'classification-badge';
    if (summary.classification.includes('HIGH')) {
      badgeEl.classList.add('badge-high');
    } else if (summary.classification.includes('MODERATE')) {
      badgeEl.classList.add('badge-moderate');
    } else {
      badgeEl.classList.add('badge-low');
    }

    // Critical Alert Banner
    const alertBanner = document.getElementById('criticalAlertBanner');
    const alertText = document.getElementById('criticalAlertText');
    if (summary.criticalWarning) {
      alertBanner.style.display = 'flex';
      alertText.textContent = summary.criticalWarning;
    } else {
      alertBanner.style.display = 'none';
    }

    // Animate Score Gauge
    const scoreNumEl = document.getElementById('scoreNumberDisplay');
    const progressCircle = document.getElementById('gaugeProgressCircle');
    const score = summary.overallMatchScore;

    // Count-up animation
    animateScoreNumber(scoreNumEl, score);

    // Circle circumference = 2 * PI * 70 ≈ 440
    const circumference = 2 * Math.PI * 70;
    const offset = circumference - (score / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;

    if (score >= 85) {
      progressCircle.style.stroke = 'var(--match-emerald)';
      scoreNumEl.style.color = 'var(--match-emerald)';
    } else if (score >= 60) {
      progressCircle.style.stroke = 'var(--partial-amber)';
      scoreNumEl.style.color = 'var(--partial-amber)';
    } else {
      progressCircle.style.stroke = 'var(--notfound-rose)';
      scoreNumEl.style.color = 'var(--notfound-rose)';
    }

    // 2. Categories Breakdown Grid
    const catGrid = document.getElementById('categoriesGrid');
    catGrid.innerHTML = '';
    result.matchOverview.forEach(cat => {
      const percentage = Math.round((cat.numericScore / cat.maxScore) * 100);
      const catCard = document.createElement('div');
      catCard.className = 'category-card';
      catCard.innerHTML = `
        <div class="category-card-header">
          <span class="category-name">${cat.category}</span>
          <span class="category-score">${cat.score}</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
        </div>
        <div class="category-explanation">${cat.explanation}</div>
      `;
      catGrid.appendChild(catCard);
    });

    // 3. Required Skills Analysis Table
    renderSkillsTable(result.requiredSkillsAnalysis);

    // 4. Key Strengths
    const strengthsList = document.getElementById('strengthsList');
    strengthsList.innerHTML = '';
    result.keyStrengths.forEach(st => {
      const item = document.createElement('div');
      item.className = 'strength-item';
      item.innerHTML = `
        <div class="strength-title">✓ ${escapeHtml(st.strength)}</div>
        <div class="strength-evidence">${escapeHtml(st.evidence)}</div>
      `;
      strengthsList.appendChild(item);
    });

    // 5. Skill Gaps
    const gapsList = document.getElementById('gapsList');
    gapsList.innerHTML = '';
    if (result.skillGaps.length === 0) {
      gapsList.innerHTML = `<div style="font-size: 13px; color: var(--match-emerald);">No critical skill deficiencies detected.</div>`;
    } else {
      result.skillGaps.forEach(gap => {
        const item = document.createElement('div');
        item.className = 'gap-item';
        item.innerHTML = `
          <div class="gap-header">
            <span class="gap-title">${escapeHtml(gap.requirement)}</span>
            <span class="gap-severity">${gap.severity}</span>
          </div>
          <div class="gap-desc">${escapeHtml(gap.description)}</div>
        `;
        gapsList.appendChild(item);
      });
    }

    // 6. Relevant Projects
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = '';
    result.relevantProjects.forEach(p => {
      const pCard = document.createElement('div');
      pCard.className = 'project-card';
      const techPills = p.technologies.split(',').map(t => `<span class="tech-tag">${t.trim()}</span>`).join('');
      pCard.innerHTML = `
        <div class="project-top">
          <span class="project-name">${escapeHtml(p.name)}</span>
        </div>
        <div class="tech-tags">${techPills}</div>
        <div class="project-detail-row"><strong>Problem / Deliverable:</strong> ${escapeHtml(p.problemSolved)}</div>
        <div class="project-detail-row"><strong>Relevance:</strong> ${escapeHtml(p.relevance)}</div>
      `;
      projectsList.appendChild(pCard);
    });

    // 7. Experience Analysis
    const expList = document.getElementById('experienceList');
    expList.innerHTML = '';
    result.experienceAnalysis.forEach(exp => {
      const expCard = document.createElement('div');
      expCard.className = 'exp-card';
      expCard.innerHTML = `
        <div class="exp-top">
          <span class="exp-role">${escapeHtml(exp.role)}</span>
          <span class="exp-duration">${escapeHtml(exp.duration)}</span>
        </div>
        <div class="project-detail-row"><strong>Duties & Impact:</strong> ${escapeHtml(exp.responsibilities)}</div>
        <div class="project-detail-row"><strong>Tech Applied:</strong> ${escapeHtml(exp.technologies)}</div>
        <div class="project-detail-row"><strong>Relevance:</strong> ${escapeHtml(exp.relevance)}</div>
      `;
      expList.appendChild(expCard);
    });

    // 8. ATS Analysis
    renderAtsList('atsFriendlyList', result.atsAnalysis.atsFriendlyElements);
    renderAtsList('atsProblemsList', result.atsAnalysis.potentialProblems);
    renderAtsList('atsKeywordsList', result.atsAnalysis.missingKeywords);
    renderAtsList('atsFormattingList', result.atsAnalysis.formattingConcerns);

    // 9. Improvement Suggestions
    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = '';
    result.improvementSuggestions.forEach((sug, idx) => {
      const sugItem = document.createElement('div');
      sugItem.className = 'strength-item';
      sugItem.style.borderLeftColor = 'var(--cyan)';
      sugItem.innerHTML = `
        <div class="strength-title" style="color: var(--cyan);">Suggestion #${idx + 1}</div>
        <div class="strength-evidence">${escapeHtml(sug)}</div>
      `;
      suggestionsList.appendChild(sugItem);
    });

    // 10. Final Explanation
    document.getElementById('finalExplanationDisplay').innerHTML = formatMarkdownSnippets(result.finalExplanation);
  }

  function renderAtsList(elementId, items) {
    const el = document.getElementById(elementId);
    el.innerHTML = '';
    if (!items || items.length === 0) {
      el.innerHTML = '<li>None detected.</li>';
      return;
    }
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      el.appendChild(li);
    });
  }

  // -------------------------------------------------------------
  // Filterable Skills Table
  // -------------------------------------------------------------
  function renderSkillsTable(items) {
    const tbody = document.getElementById('skillsTableBody');
    tbody.innerHTML = '';

    // Counts
    const matchCount = items.filter(i => i.match === 'MATCH').length;
    const partialCount = items.filter(i => i.match === 'PARTIAL MATCH').length;
    const notFoundCount = items.filter(i => i.match === 'NOT FOUND').length;

    document.getElementById('countAll').textContent = items.length;
    document.getElementById('countMatch').textContent = matchCount;
    document.getElementById('countPartial').textContent = partialCount;
    document.getElementById('countNotFound').textContent = notFoundCount;

    const filtered = items.filter(i => {
      if (activeFilter === 'all') return true;
      return i.match === activeFilter;
    });

    filtered.forEach(item => {
      const tr = document.createElement('tr');
      let badgeClass = 'match-tag-notfound';
      if (item.match === 'MATCH') badgeClass = 'match-tag-match';
      if (item.match === 'PARTIAL MATCH') badgeClass = 'match-tag-partial';

      tr.innerHTML = `
        <td style="font-weight: 600; color: #fff;">
          ${escapeHtml(item.requirement)}
          ${item.isMandatory ? '<span style="color:var(--notfound-rose); font-size:11px; margin-left:4px;">*Required</span>' : ''}
        </td>
        <td style="color: var(--text-secondary);">${escapeHtml(item.evidence)}</td>
        <td style="text-align: center;">
          <span class="match-badge ${badgeClass}">${item.match}</span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Filter Buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      activeFilter = e.currentTarget.getAttribute('data-filter');
      if (currentResult) {
        renderSkillsTable(currentResult.requiredSkillsAnalysis);
      }
    });
  });

  // -------------------------------------------------------------
  // Exports: Markdown, JSON, Print
  // -------------------------------------------------------------
  btnCopyMarkdown.addEventListener('click', () => {
    if (!currentResult) return;
    const md = generateMasterPromptMarkdown(currentResult);
    navigator.clipboard.writeText(md).then(() => {
      showToast("Master Prompt Markdown Report copied to clipboard!");
    });
  });

  btnDownloadJson.addEventListener('click', () => {
    if (!currentResult) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentResult, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `Resume_Classification_${currentResult.candidateSummary.candidateName.replace(/\s+/g, '_')}.json`);
    dlAnchor.click();
    showToast("JSON report downloaded.");
  });

  btnPrintReport.addEventListener('click', () => {
    window.print();
  });

  // Reset All
  btnResetAll.addEventListener('click', () => {
    resumeTextEl.value = '';
    jobTextEl.value = '';
    targetRoleInput.value = '';
    targetExpInput.value = '';
    loadedFileBadge.classList.remove('active');
    resultsDashboard.classList.remove('visible');
    currentResult = null;
    showToast("Reset all inputs and results.");
  });

  // -------------------------------------------------------------
  // Modal & Engine Settings
  // -------------------------------------------------------------
  btnSettingsModal.addEventListener('click', () => {
    settingsModal.classList.add('active');
  });

  btnCloseModal.addEventListener('click', () => {
    settingsModal.classList.remove('active');
  });

  engineModeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'gemini') {
      apiKeyGroup.style.display = 'block';
    } else {
      apiKeyGroup.style.display = 'none';
    }
  });

  btnSaveSettings.addEventListener('click', () => {
    localStorage.setItem('ai_engine_mode', engineModeSelect.value);
    localStorage.setItem('gemini_api_key', geminiApiKeyInput.value.trim());
    settingsModal.classList.remove('active');
    showToast("Settings saved successfully.");
  });

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function animateScoreNumber(el, target) {
    let current = 0;
    const duration = 1000;
    const stepTime = 20;
    const increment = target / (duration / stepTime);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        clearInterval(timer);
        el.textContent = target;
      } else {
        el.textContent = Math.round(current);
      }
    }, stepTime);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatMarkdownSnippets(str) {
    if (!str) return '';
    return escapeHtml(str).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  /**
   * Generates exact Master Prompt Output Format markdown string
   */
  function generateMasterPromptMarkdown(res) {
    const s = res.candidateSummary;
    let md = `# AI Resume Classification & Job Matching Report\n\n`;

    md += `## 1. Candidate Summary\n\n`;
    md += `Candidate Name: ${s.candidateName}\n`;
    md += `Education: ${s.education}\n`;
    md += `Target Role: ${s.targetRole}\n`;
    md += `Experience: ${s.experience}\n`;
    md += `Overall Match Score: ${s.overallMatchScore}/100\n`;
    md += `Classification: ${s.classification}\n\n`;

    md += `## 2. Match Overview\n\n`;
    md += `| Category | Score | Explanation |\n`;
    md += `| :--- | :---: | :--- |\n`;
    res.matchOverview.forEach(cat => {
      md += `| ${cat.category} | ${cat.score} | ${cat.explanation} |\n`;
    });
    md += `\n`;

    md += `## 3. Required Skills Analysis\n\n`;
    md += `| Job Requirement | Resume Evidence | Match |\n`;
    md += `| :--- | :--- | :---: |\n`;
    res.requiredSkillsAnalysis.forEach(item => {
      md += `| ${item.requirement} | ${item.evidence.replace(/\|/g, '-')} | ${item.match} |\n`;
    });
    md += `\n`;

    md += `## 4. Key Strengths\n\n`;
    res.keyStrengths.forEach(st => {
      md += `* **Strength:** ${st.strength}\n  *Evidence:* ${st.evidence}\n`;
    });
    md += `\n`;

    md += `## 5. Skill Gaps\n\n`;
    res.skillGaps.forEach(g => {
      md += `* **Requirement:** ${g.requirement} (${g.status})\n  *Details:* ${g.description}\n`;
    });
    md += `\n`;

    md += `## 6. Relevant Projects\n\n`;
    res.relevantProjects.forEach(p => {
      md += `### ${p.name}\n`;
      md += `* **Technologies Used:** ${p.technologies}\n`;
      md += `* **Problem Solved:** ${p.problemSolved}\n`;
      md += `* **Relevance:** ${p.relevance}\n\n`;
    });

    md += `## 7. Experience Analysis\n\n`;
    res.experienceAnalysis.forEach(e => {
      md += `### ${e.role} (${e.duration})\n`;
      md += `* **Responsibilities:** ${e.responsibilities}\n`;
      md += `* **Technologies:** ${e.technologies}\n`;
      md += `* **Relevance:** ${e.relevance}\n\n`;
    });

    md += `## 8. ATS Analysis\n\n`;
    md += `### ATS-Friendly Elements\n`;
    res.atsAnalysis.atsFriendlyElements.forEach(i => md += `* ${i}\n`);
    md += `\n### Potential ATS Problems\n`;
    res.atsAnalysis.potentialProblems.forEach(i => md += `* ${i}\n`);
    md += `\n### Missing Keywords\n`;
    res.atsAnalysis.missingKeywords.forEach(i => md += `* ${i}\n`);
    md += `\n### Formatting Concerns\n`;
    res.atsAnalysis.formattingConcerns.forEach(i => md += `* ${i}\n`);
    md += `\n`;

    md += `## 9. Resume Improvement Suggestions\n\n`;
    res.improvementSuggestions.forEach((sug, idx) => {
      md += `${idx + 1}. ${sug}\n`;
    });
    md += `\n`;

    md += `## 10. Final Explanation\n\n`;
    md += `${res.finalExplanation}\n`;

    return md;
  }

  // -------------------------------------------------------------
  // Optional Direct Gemini LLM Evaluation
  // -------------------------------------------------------------
  async function runGeminiEvaluation(resumeText, jobText, targetRole, targetExp, apiKey) {
    const prompt = `You are an AI-powered Resume Classification and Job Matching Assistant.
Follow the AI Resume Classifier Master Prompt rules and format.
Analyze this resume against the job description.

Candidate Resume:
${resumeText}

Job Description:
${jobText}

Target Role: ${targetRole || 'Not specified'}
Target Experience Level: ${targetExp || 'Not specified'}

Respond ONLY with a valid JSON object strictly matching this schema:
{
  "candidateSummary": {
    "candidateName": string,
    "education": string,
    "targetRole": string,
    "experience": string,
    "overallMatchScore": number (0-100),
    "classification": "HIGH MATCH" | "MODERATE MATCH" | "LOW MATCH",
    "criticalWarning": string or null
  },
  "matchOverview": [
    { "category": "Technical Skills", "score": "XX/30", "numericScore": number, "maxScore": 30, "explanation": string },
    { "category": "Experience", "score": "XX/20", "numericScore": number, "maxScore": 20, "explanation": string },
    { "category": "Projects", "score": "XX/15", "numericScore": number, "maxScore": 15, "explanation": string },
    { "category": "Education", "score": "XX/10", "numericScore": number, "maxScore": 10, "explanation": string },
    { "category": "Preferred Skills", "score": "XX/10", "numericScore": number, "maxScore": 10, "explanation": string },
    { "category": "Role Alignment", "score": "XX/10", "numericScore": number, "maxScore": 10, "explanation": string },
    { "category": "Certifications/Achievements", "score": "XX/5", "numericScore": number, "maxScore": 5, "explanation": string }
  ],
  "requiredSkillsAnalysis": [
    { "requirement": string, "evidence": string, "match": "MATCH" | "PARTIAL MATCH" | "NOT FOUND", "isMandatory": boolean }
  ],
  "keyStrengths": [
    { "strength": string, "evidence": string }
  ],
  "skillGaps": [
    { "requirement": string, "status": string, "severity": string, "description": string }
  ],
  "relevantProjects": [
    { "name": string, "technologies": string, "problemSolved": string, "relevance": string }
  ],
  "experienceAnalysis": [
    { "role": string, "duration": string, "responsibilities": string, "technologies": string, "relevance": string }
  ],
  "atsAnalysis": {
    "atsFriendlyElements": [string],
    "potentialProblems": [string],
    "missingKeywords": [string],
    "formattingConcerns": [string]
  },
  "improvementSuggestions": [string],
  "finalExplanation": string
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error (${response.status}): ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error("Empty response received from Gemini API.");

    return JSON.parse(candidateText);
  }

});
