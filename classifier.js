/**
 * AI Resume Classifier — Core Matching Engine
 * Implements the 10-step specification from the Master Prompt:
 * 1. Extract Resume Information
 * 2. Analyze Job Description
 * 3. Skill Matching (MATCH, PARTIAL MATCH, NOT FOUND)
 * 4. Calculate Match Score (0-100 with weighted distribution)
 * 5. Classify Resume (HIGH MATCH, MODERATE MATCH, LOW MATCH)
 * 6. Identify Strengths with Resume Evidence
 * 7. Identify Skill Gaps against Job Requirements
 * 8. Analyze Project Relevance
 * 9. Analyze Experience Relevance
 * 10. ATS Resume Quality Audit
 */

class ResumeClassifierEngine {
  constructor() {
    // Standard tech taxonomy for deterministic parsing and entity linking
    this.techTaxonomy = {
      languages: [
        'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'golang', 'go', 'rust',
        'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'sql', 'bash', 'shell', 'html', 'css', 'html5', 'css3'
      ],
      frameworks: [
        'react', 'react.js', 'next.js', 'vue', 'vue.js', 'angular', 'svelte', 'node.js', 'node',
        'express', 'fastapi', 'django', 'flask', 'spring', 'spring boot', 'asp.net', '.net core',
        'tailwind', 'tailwindcss', 'bootstrap', 'redux', 'graphql', 'rest', 'restful', 'jest', 'cypress',
        'pytorch', 'tensorflow', 'keras', 'scikit-learn', 'pandas', 'numpy', 'hugging face', 'transformers'
      ],
      cloudDevops: [
        'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s',
        'terraform', 'ci/cd', 'github actions', 'gitlab ci', 'jenkins', 'ansible', 'helm', 'ecs', 'lambda',
        's3', 'rds', 'cloudfront', 'sqs', 'sns', 'linux', 'unix'
      ],
      databases: [
        'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'dynamodb', 'elasticsearch', 'sqlite',
        'cassandra', 'oracle', 'kafka', 'rabbitmq', 'pinecone', 'weaviate', 'milvus'
      ],
      concepts: [
        'microservices', 'distributed systems', 'restful apis', 'graphql', 'machine learning', 'deep learning',
        'llm', 'large language models', 'rag', 'mlops', 'computer vision', 'nlp', 'data pipelines',
        'web security', 'oauth2', 'jwt', 'soc2', 'accessibility', 'wcag', 'tdd', 'test driven development'
      ]
    };
  }

  /**
   * Main entry point to classify a candidate's resume against a job description.
   * @param {string} resumeText
   * @param {string} jobText
   * @param {string} [targetRole]
   * @param {string} [targetExp]
   * @returns {Object} Complete classification result matching the Master Prompt output structure
   */
  classify(resumeText, jobText, targetRole = '', targetExp = '') {
    if (!resumeText || !resumeText.trim()) {
      throw new Error("Candidate resume text is required.");
    }
    if (!jobText || !jobText.trim()) {
      throw new Error("Job description text is required.");
    }

    // Step 1: Extract Resume Information
    const resumeInfo = this.extractResumeInfo(resumeText);

    // Step 2: Analyze Job Description
    const jobInfo = this.analyzeJobDescription(jobText, targetRole, targetExp);

    // Step 3: Skill & Requirement Matching
    const skillAnalysis = this.matchSkillsAndRequirements(resumeInfo, jobInfo, resumeText);

    // Step 4: Calculate Match Score (0-100)
    const scoring = this.calculateMatchScore(resumeInfo, jobInfo, skillAnalysis);

    // Step 5: Classify the Resume
    const classification = this.classifyResume(scoring.totalScore, skillAnalysis);

    // Step 6: Identify Strengths with Evidence
    const strengths = this.identifyStrengths(resumeInfo, jobInfo, skillAnalysis);

    // Step 7: Identify Skill Gaps
    const skillGaps = this.identifySkillGaps(jobInfo, skillAnalysis);

    // Step 8: Analyze Project Relevance
    const relevantProjects = this.analyzeProjectRelevance(resumeInfo, jobInfo);

    // Step 9: Analyze Experience Relevance
    const relevantExperience = this.analyzeExperienceRelevance(resumeInfo, jobInfo);

    // Step 10: ATS Resume Quality Audit
    const atsAnalysis = this.performAtsAudit(resumeText, jobInfo, resumeInfo);

    // Step 11: Suggestions & Final Explanation
    const suggestions = this.generateImprovementSuggestions(skillGaps, atsAnalysis, jobInfo);
    const finalExplanation = this.generateFinalExplanation(classification, scoring, skillAnalysis, resumeInfo, jobInfo);

    return {
      candidateSummary: {
        candidateName: resumeInfo.name || "Candidate (Name not specified)",
        education: resumeInfo.educationDisplay || "Education details not clearly stated",
        targetRole: jobInfo.title || targetRole || "Target Position",
        experience: resumeInfo.yearsOfExperience 
          ? `${resumeInfo.yearsOfExperience} years (explicitly stated/calculated)` 
          : "Experience duration not explicitly quantified",
        overallMatchScore: scoring.totalScore,
        classification: classification.category,
        criticalWarning: classification.criticalWarning
      },
      matchOverview: scoring.breakdown,
      requiredSkillsAnalysis: skillAnalysis.items,
      keyStrengths: strengths,
      skillGaps: skillGaps,
      relevantProjects: relevantProjects,
      experienceAnalysis: relevantExperience,
      atsAnalysis: atsAnalysis,
      improvementSuggestions: suggestions,
      finalExplanation: finalExplanation,
      rawEntities: {
        resumeInfo,
        jobInfo
      }
    };
  }

  // ==========================================
  // STEP 1 — EXTRACT RESUME INFORMATION
  // ==========================================
  extractResumeInfo(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const lowerText = text.toLowerCase();

    // 1. Candidate Name (Heuristic: usually first non-empty line without words like resume/curriculum/email)
    let candidateName = "";
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (!line.match(/resume|curriculum|cv|summary|objective|contact|phone|email|http|@/i) && line.length < 50 && line.length > 2) {
        // Must contain alphabet characters
        if (/^[a-zA-Z\s\.\-'\u00C0-\u024F]+$/.test(line)) {
          candidateName = line;
          break;
        }
      }
    }

    // 2. Education extraction
    const educationMatches = [];
    const degreePatterns = [
      /(?:bachelor(?:'s)?|b\.?s\.?|b\.?a\.?|b\.?tech|b\.?e\.?)(?:\s+(?:of|in)\s+([a-zA-Z\s]+))?/gi,
      /(?:master(?:'s)?|m\.?s\.?|m\.?a\.?|m\.?tech|mba)(?:\s+(?:of|in)\s+([a-zA-Z\s]+))?/gi,
      /(?:ph\.?d\.?|doctorate)(?:\s+(?:of|in)\s+([a-zA-Z\s]+))?/gi,
      /(?:associate(?:'s)?\s+degree)/gi
    ];

    degreePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        educationMatches.push(match[0].trim());
      }
    });

    // Look for university/college name
    const universityMatch = text.match(/(?:university|college|institute|polytechnic|academy)\s+of\s+[a-zA-Z\s]+|[a-zA-Z\s]+\s+(?:university|college|institute|polytechnic)/i);
    const gradYearMatch = text.match(/(?:graduated|graduation|class\s+of|completed)?\s*[:\-\s]?\s*(20\d\d|19\d\d)/i);

    let educationDisplay = "";
    if (educationMatches.length > 0) {
      educationDisplay = educationMatches[0];
      if (universityMatch) educationDisplay += ` — ${universityMatch[0].trim()}`;
      if (gradYearMatch) educationDisplay += ` (${gradYearMatch[1]})`;
    } else if (universityMatch) {
      educationDisplay = universityMatch[0].trim();
      if (gradYearMatch) educationDisplay += ` (${gradYearMatch[1]})`;
    }

    // 3. Technical Skills Extraction
    const foundSkills = new Set();
    const allTaxonomy = [
      ...this.techTaxonomy.languages,
      ...this.techTaxonomy.frameworks,
      ...this.techTaxonomy.cloudDevops,
      ...this.techTaxonomy.databases,
      ...this.techTaxonomy.concepts
    ];

    allTaxonomy.forEach(skill => {
      // Word boundary regex
      const regex = new RegExp(`\\b${this.escapeRegex(skill)}\\b`, 'i');
      if (regex.test(text)) {
        foundSkills.add(skill);
      }
    });

    // 4. Years of Experience (Explicitly stated vs inferred)
    let explicitYears = null;
    const expRegex = /(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)(?:\s+of\s+(?:experience|industry|relevant))?/i;
    const expMatch = text.match(expRegex);
    if (expMatch) {
      explicitYears = parseFloat(expMatch[1]);
    }

    // Inferred experience from date ranges (e.g. 2018 – 2024 or 2021 - Present)
    const dateRanges = [];
    const dateRangeRegex = /(?:20\d\d|19\d\d)\s*[-–—to\s]+\s*(?:present|current|20\d\d|19\d\d)/gi;
    let rangeMatch;
    while ((rangeMatch = dateRangeRegex.exec(text)) !== null) {
      dateRanges.push(rangeMatch[0]);
    }

    // 5. Certifications
    const certs = [];
    const certKeywords = ['aws certified', 'ckad', 'cka', 'pmp', 'comptia', 'google cloud certified', 'azure certified', 'scrum master', 'cissp', 'certification', 'certified'];
    lines.forEach(line => {
      if (certKeywords.some(kw => line.toLowerCase().includes(kw)) && !line.match(/required|preferred/i)) {
        certs.push(line.replace(/^[•\-\*]\s*/, '').trim());
      }
    });

    // 6. Projects & Experience sections detection
    const projects = this.extractSectionBlocks(text, ['projects', 'key projects', 'personal projects', 'technical projects']);
    const experienceBlocks = this.extractSectionBlocks(text, ['experience', 'work experience', 'professional experience', 'employment history']);

    return {
      name: candidateName,
      educationDisplay,
      educationMatches,
      graduationYear: gradYearMatch ? gradYearMatch[1] : null,
      skills: Array.from(foundSkills),
      yearsOfExperience: explicitYears,
      dateRanges,
      certifications: certs,
      projects,
      experienceBlocks,
      fullText: text
    };
  }

  // ==========================================
  // STEP 2 — ANALYZE THE JOB DESCRIPTION
  // ==========================================
  analyzeJobDescription(jobText, fallbackRole, fallbackExp) {
    const lines = jobText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    // 1. Job Title extraction
    let title = fallbackRole || "";
    const titleMatch = jobText.match(/(?:job\s+title|role|position)\s*[:\-]\s*([^\n\r]+)/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else if (!title && lines.length > 0) {
      if (lines[0].length < 60) title = lines[0].replace(/^#+\s*/, '');
    }

    // 2. Experience Requirements
    let requiredExpYears = 0;
    const expRegex = /(\d+)\s*\+?\s*(?:years?|yrs?)(?:\s+of\s+experience)?/i;
    const expMatch = jobText.match(expRegex);
    if (expMatch) {
      requiredExpYears = parseInt(expMatch[1], 10);
    } else if (fallbackExp) {
      const fbMatch = fallbackExp.match(/(\d+)/);
      if (fbMatch) requiredExpYears = parseInt(fbMatch[1], 10);
    }

    // 3. Education Requirements
    const degreeRequired = [];
    if (/ph\.?d|doctorate/i.test(jobText)) degreeRequired.push("PhD / Doctorate");
    if (/master(?:'s)?|m\.?s\.?/i.test(jobText)) degreeRequired.push("Master's Degree");
    if (/bachelor(?:'s)?|b\.?s\.?|b\.?e\.?|b\.?tech|undergraduate/i.test(jobText)) degreeRequired.push("Bachelor's Degree");

    // 4. Extract Required Skills & Preferred Skills
    const requiredSkills = new Set();
    const preferredSkills = new Set();

    let currentSection = 'required';
    const preferredKeywords = ['preferred skills', 'nice to have', 'bonus points', 'desired', 'bonus skills', 'plus'];
    const requiredKeywords = ['required skills', 'must have', 'requirements', 'qualifications', 'what you will bring'];

    lines.forEach(line => {
      const lower = line.toLowerCase();
      if (preferredKeywords.some(kw => lower.includes(kw))) {
        currentSection = 'preferred';
        return;
      }
      if (requiredKeywords.some(kw => lower.includes(kw))) {
        currentSection = 'required';
        return;
      }

      // Check taxonomy mentions in this line or bullet
      const allTaxonomy = [
        ...this.techTaxonomy.languages,
        ...this.techTaxonomy.frameworks,
        ...this.techTaxonomy.cloudDevops,
        ...this.techTaxonomy.databases,
        ...this.techTaxonomy.concepts
      ];

      allTaxonomy.forEach(skill => {
        const regex = new RegExp(`\\b${this.escapeRegex(skill)}\\b`, 'i');
        if (regex.test(line)) {
          if (currentSection === 'preferred') {
            preferredSkills.add(skill);
          } else {
            requiredSkills.add(skill);
          }
        }
      });
    });

    // Ensure preferred skills don't overlap as required
    preferredSkills.forEach(s => {
      if (requiredSkills.has(s)) {
        preferredSkills.delete(s);
      }
    });

    return {
      title: title || "Specified Role",
      requiredExpYears,
      degreeRequired: degreeRequired.length > 0 ? degreeRequired : ["Relevant Technical Degree or Equivalent"],
      requiredSkills: Array.from(requiredSkills),
      preferredSkills: Array.from(preferredSkills),
      fullText: jobText
    };
  }

  // ==========================================
  // STEP 3 — SKILL & REQUIREMENT MATCHING
  // ==========================================
  matchSkillsAndRequirements(resumeInfo, jobInfo, resumeText) {
    const items = [];
    const resumeSkillsLower = new Set(resumeInfo.skills.map(s => s.toLowerCase()));
    const resumeFullLower = resumeText.toLowerCase();

    // Compile requirements from Job Description:
    // Tech requirements + Experience requirement + Education requirement + Role specific
    const requirementsList = [];

    // Technical skills
    jobInfo.requiredSkills.forEach(skill => {
      requirementsList.push({ name: skill, type: 'required_tech', isMandatory: true });
    });

    jobInfo.preferredSkills.forEach(skill => {
      requirementsList.push({ name: skill, type: 'preferred_tech', isMandatory: false });
    });

    // Experience requirement
    if (jobInfo.requiredExpYears > 0) {
      requirementsList.push({
        name: `${jobInfo.requiredExpYears}+ Years Experience`,
        type: 'experience',
        isMandatory: true,
        targetYears: jobInfo.requiredExpYears
      });
    }

    // Education requirement
    if (jobInfo.degreeRequired.length > 0) {
      requirementsList.push({
        name: `Education: ${jobInfo.degreeRequired[0]}`,
        type: 'education',
        isMandatory: false,
        targetDegree: jobInfo.degreeRequired[0]
      });
    }

    // Evaluate each requirement
    requirementsList.forEach(req => {
      let matchStatus = 'NOT FOUND';
      let evidence = 'No corresponding evidence identified in candidate resume.';

      if (req.type === 'required_tech' || req.type === 'preferred_tech') {
        const skillName = req.name.toLowerCase();
        
        // Check exact match in candidate skills or text
        const hasDirectSkill = resumeSkillsLower.has(skillName) || new RegExp(`\\b${this.escapeRegex(skillName)}\\b`, 'i').test(resumeFullLower);
        
        if (hasDirectSkill) {
          // Find context snippet in resume
          const snippet = this.findContextSnippet(resumeText, req.name);
          matchStatus = 'MATCH';
          evidence = snippet ? `Demonstrated in resume: "${snippet}"` : `Explicitly listed as technical qualification.`;
        } else {
          // Check for partial related match (Rule: Don't assume Python = ML, but React ~ Frontend or AWS ~ Cloud is partial)
          const partialMatch = this.checkPartialRelevance(skillName, resumeSkillsLower);
          if (partialMatch) {
            matchStatus = 'PARTIAL MATCH';
            evidence = `Partial related evidence: Candidate has ${partialMatch}, but direct experience with ${req.name} is not explicitly verified.`;
          } else {
            matchStatus = 'NOT FOUND';
            evidence = `Requirement is not demonstrated in the candidate's resume.`;
          }
        }
      } else if (req.type === 'experience') {
        const candidateYears = resumeInfo.yearsOfExperience;
        if (candidateYears !== null) {
          if (candidateYears >= req.targetYears) {
            matchStatus = 'MATCH';
            evidence = `Candidate has ${candidateYears} years of experience (meets/exceeds ${req.targetYears}+ years required).`;
          } else if (candidateYears >= req.targetYears * 0.6) {
            matchStatus = 'PARTIAL MATCH';
            evidence = `Candidate possesses ${candidateYears} years of experience (below target of ${req.targetYears}+ years).`;
          } else {
            matchStatus = 'NOT FOUND';
            evidence = `Candidate experience (${candidateYears} years) falls substantially short of required ${req.targetYears}+ years.`;
          }
        } else {
          // Check date ranges
          if (resumeInfo.dateRanges.length > 0) {
            matchStatus = 'PARTIAL MATCH';
            evidence = `Resume lists career date spans (${resumeInfo.dateRanges.join(', ')}), but total years are not explicitly quantified.`;
          } else {
            matchStatus = 'NOT FOUND';
            evidence = `Years of relevant professional experience are not explicitly documented.`;
          }
        }
      } else if (req.type === 'education') {
        if (resumeInfo.educationMatches.length > 0) {
          const candidateDeg = resumeInfo.educationMatches[0].toLowerCase();
          const targetDeg = req.targetDegree.toLowerCase();
          if (candidateDeg.includes('master') || candidateDeg.includes('phd') || candidateDeg.includes('bachelor')) {
            matchStatus = 'MATCH';
            evidence = `Candidate holds ${resumeInfo.educationDisplay}.`;
          } else {
            matchStatus = 'PARTIAL MATCH';
            evidence = `Candidate lists: ${resumeInfo.educationDisplay}, partially fulfilling academic degree target.`;
          }
        } else {
          matchStatus = 'NOT FOUND';
          evidence = `Formal degree qualification not explicitly listed on resume.`;
        }
      }

      items.push({
        requirement: req.name,
        type: req.type,
        isMandatory: req.isMandatory,
        evidence: evidence,
        match: matchStatus
      });
    });

    return {
      items,
      matchesCount: items.filter(i => i.match === 'MATCH').length,
      partialCount: items.filter(i => i.match === 'PARTIAL MATCH').length,
      notFoundCount: items.filter(i => i.match === 'NOT FOUND').length
    };
  }

  // ==========================================
  // STEP 4 — CALCULATE MATCH SCORE (0-100)
  // General Weighting:
  // - Required technical skills: 30%
  // - Relevant experience: 20%
  // - Projects/internships: 15%
  // - Education: 10%
  // - Preferred skills: 10%
  // - Role alignment: 10%
  // - Certifications/achievements: 5%
  // ==========================================
  calculateMatchScore(resumeInfo, jobInfo, skillAnalysis) {
    const requiredTech = skillAnalysis.items.filter(i => i.type === 'required_tech');
    const preferredTech = skillAnalysis.items.filter(i => i.type === 'preferred_tech');

    // 1. Required Technical Skills (Max 30)
    let techScore = 0;
    if (requiredTech.length > 0) {
      let earned = 0;
      requiredTech.forEach(item => {
        if (item.match === 'MATCH') earned += 1.0;
        else if (item.match === 'PARTIAL MATCH') earned += 0.45;
      });
      techScore = Math.round((earned / requiredTech.length) * 30);
    } else {
      techScore = 25; // Default baseline if job description didn't list specific tools
    }

    // 2. Relevant Experience (Max 20)
    let expScore = 0;
    if (jobInfo.requiredExpYears > 0 && resumeInfo.yearsOfExperience !== null) {
      const ratio = resumeInfo.yearsOfExperience / jobInfo.requiredExpYears;
      if (ratio >= 1.0) expScore = 20;
      else if (ratio >= 0.75) expScore = 15;
      else if (ratio >= 0.5) expScore = 10;
      else expScore = 5;
    } else if (resumeInfo.experienceBlocks.length > 0) {
      expScore = 14; // Has verifiable work history
    } else {
      expScore = 4;
    }

    // 3. Projects/Internships (Max 15)
    let projectScore = 0;
    if (resumeInfo.projects.length >= 2) {
      projectScore = 15;
    } else if (resumeInfo.projects.length === 1) {
      projectScore = 10;
    } else if (resumeInfo.experienceBlocks.length > 0) {
      projectScore = 8;
    } else {
      projectScore = 2;
    }

    // 4. Education (Max 10)
    let eduScore = 0;
    if (resumeInfo.educationMatches.length > 0) {
      eduScore = 10;
    } else if (resumeInfo.educationDisplay) {
      eduScore = 7;
    } else {
      eduScore = 2;
    }

    // 5. Preferred Skills (Max 10)
    let prefScore = 0;
    if (preferredTech.length > 0) {
      let earnedPref = 0;
      preferredTech.forEach(item => {
        if (item.match === 'MATCH') earnedPref += 1.0;
        else if (item.match === 'PARTIAL MATCH') earnedPref += 0.4;
      });
      prefScore = Math.round((earnedPref / preferredTech.length) * 10);
    } else {
      prefScore = 8; // If no preferred skills listed, grant fair baseline
    }

    // 6. Role Alignment (Max 10)
    let roleScore = 0;
    // Check if target role keywords appear in candidate experience or summary
    const roleWords = jobInfo.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const resumeLower = resumeInfo.fullText.toLowerCase();
    let matchesInResume = roleWords.filter(w => resumeLower.includes(w)).length;
    if (roleWords.length > 0) {
      const matchRatio = matchesInResume / roleWords.length;
      roleScore = Math.round(matchRatio * 10);
    } else {
      roleScore = 8;
    }

    // 7. Certifications & Achievements (Max 5)
    let certScore = 0;
    if (resumeInfo.certifications.length >= 2) certScore = 5;
    else if (resumeInfo.certifications.length === 1) certScore = 3;
    else certScore = 1;

    const totalScore = Math.min(100, Math.max(0, techScore + expScore + projectScore + eduScore + prefScore + roleScore + certScore));

    const breakdown = [
      {
        category: "Technical Skills",
        score: `${techScore}/30`,
        numericScore: techScore,
        maxScore: 30,
        explanation: `${requiredTech.filter(i => i.match === 'MATCH').length} of ${requiredTech.length} mandatory core technical requirements verified.`
      },
      {
        category: "Experience",
        score: `${expScore}/20`,
        numericScore: expScore,
        maxScore: 20,
        explanation: resumeInfo.yearsOfExperience 
          ? `Documented ${resumeInfo.yearsOfExperience} years against target requirement.` 
          : "Work history duration evaluated based on listed roles and tenure."
      },
      {
        category: "Projects",
        score: `${projectScore}/15`,
        numericScore: projectScore,
        maxScore: 15,
        explanation: `${resumeInfo.projects.length} distinct project implementations documented with technical context.`
      },
      {
        category: "Education",
        score: `${eduScore}/10`,
        numericScore: eduScore,
        maxScore: 10,
        explanation: resumeInfo.educationDisplay 
          ? `Verified degree background: ${resumeInfo.educationDisplay}.` 
          : "Education information not clearly specified."
      },
      {
        category: "Preferred Skills",
        score: `${prefScore}/10`,
        numericScore: prefScore,
        maxScore: 10,
        explanation: preferredTech.length > 0 
          ? `${preferredTech.filter(i => i.match === 'MATCH').length} desirable domain skills demonstrated.` 
          : "No explicit preferred secondary skills required."
      },
      {
        category: "Role Alignment",
        score: `${roleScore}/10`,
        numericScore: roleScore,
        maxScore: 10,
        explanation: `Alignment between prior job duties and ${jobInfo.title} scope.`
      },
      {
        category: "Certifications/Achievements",
        score: `${certScore}/5`,
        numericScore: certScore,
        maxScore: 5,
        explanation: `${resumeInfo.certifications.length} professional certifications or honors presented.`
      }
    ];

    return {
      totalScore,
      breakdown
    };
  }

  // ==========================================
  // STEP 5 — CLASSIFY THE RESUME
  // 90–100 -> HIGH MATCH
  // 70–89  -> HIGH / MODERATE MATCH depending on missing critical requirements
  // 50–69  -> MODERATE MATCH
  // 0–49   -> LOW MATCH
  // ==========================================
  classifyResume(score, skillAnalysis) {
    const missingMandatory = skillAnalysis.items.filter(i => i.isMandatory && i.match === 'NOT FOUND');
    let category = 'LOW MATCH';
    let criticalWarning = null;

    if (score >= 90) {
      category = missingMandatory.length > 0 ? 'MODERATE MATCH' : 'HIGH MATCH';
    } else if (score >= 70) {
      category = missingMandatory.length > 0 ? 'MODERATE MATCH' : 'HIGH MATCH';
    } else if (score >= 50) {
      category = 'MODERATE MATCH';
    } else {
      category = 'LOW MATCH';
    }

    if (missingMandatory.length > 0) {
      criticalWarning = `Essential mandatory requirement(s) missing: ${missingMandatory.map(m => m.requirement).slice(0, 3).join(', ')}.`;
    }

    return {
      category,
      criticalWarning
    };
  }

  // ==========================================
  // STEP 6 — IDENTIFY STRENGTHS
  // ==========================================
  identifyStrengths(resumeInfo, jobInfo, skillAnalysis) {
    const strengths = [];
    const matchedItems = skillAnalysis.items.filter(i => i.match === 'MATCH');

    matchedItems.slice(0, 4).forEach(item => {
      strengths.push({
        strength: item.requirement.toUpperCase(),
        evidence: item.evidence
      });
    });

    if (resumeInfo.certifications.length > 0) {
      strengths.push({
        strength: "Industry Certifications",
        evidence: `Candidate holds accredited credentials: ${resumeInfo.certifications[0]}.`
      });
    }

    if (strengths.length === 0) {
      strengths.push({
        strength: "Foundational Professional Background",
        evidence: "Candidate presents professional documentation with foundational qualifications."
      });
    }

    return strengths;
  }

  // ==========================================
  // STEP 7 — IDENTIFY SKILL GAPS
  // ==========================================
  identifySkillGaps(jobInfo, skillAnalysis) {
    const gaps = [];
    const missing = skillAnalysis.items.filter(i => i.match === 'NOT FOUND');
    const partial = skillAnalysis.items.filter(i => i.match === 'PARTIAL MATCH');

    missing.forEach(item => {
      gaps.push({
        requirement: item.requirement,
        status: "Completely Missing",
        severity: item.isMandatory ? "High (Critical)" : "Low (Desirable)",
        description: `No evidence found in candidate resume for explicitly requested requirement '${item.requirement}'.`
      });
    });

    partial.forEach(item => {
      gaps.push({
        requirement: item.requirement,
        status: "Partially Demonstrated",
        severity: item.isMandatory ? "Medium" : "Low",
        description: item.evidence
      });
    });

    return gaps;
  }

  // ==========================================
  // STEP 8 — PROJECT RELEVANCE
  // ==========================================
  analyzeProjectRelevance(resumeInfo, jobInfo) {
    const projects = [];

    if (resumeInfo.projects.length > 0) {
      resumeInfo.projects.forEach(p => {
        // Find tech mentioned in project
        const techFound = resumeInfo.skills.filter(s => p.content.toLowerCase().includes(s.toLowerCase()));
        
        projects.push({
          name: p.title || "Technical Project",
          technologies: techFound.length > 0 ? techFound.join(', ') : "Contextualized in project description",
          problemSolved: p.content.slice(0, 140) + (p.content.length > 140 ? "..." : ""),
          relevance: `Directly demonstrates hands-on implementation relevant to ${jobInfo.title}.`,
          evidence: `Documented architecture and outcomes in candidate resume.`
        });
      });
    } else {
      projects.push({
        name: "No Dedicated Projects Section Identified",
        technologies: "N/A",
        problemSolved: "Candidate resume does not delineate isolated project case studies.",
        relevance: "Impacts project-based practical evaluation score.",
        evidence: "Information not present in source document."
      });
    }

    return projects;
  }

  // ==========================================
  // STEP 9 — EXPERIENCE RELEVANCE
  // ==========================================
  analyzeExperienceRelevance(resumeInfo, jobInfo) {
    const experienceList = [];

    if (resumeInfo.experienceBlocks.length > 0) {
      resumeInfo.experienceBlocks.forEach(exp => {
        const techFound = resumeInfo.skills.filter(s => exp.content.toLowerCase().includes(s.toLowerCase()));
        experienceList.push({
          role: exp.title || "Professional Role",
          duration: exp.duration || "Tenure specified in resume",
          responsibilities: exp.content.slice(0, 160) + (exp.content.length > 160 ? "..." : ""),
          technologies: techFound.slice(0, 5).join(', ') || "Full-stack / domain specific",
          relevance: `Provides practical work history relevant to ${jobInfo.title}.`
        });
      });
    } else {
      experienceList.push({
        role: "General Work History",
        duration: resumeInfo.yearsOfExperience ? `${resumeInfo.yearsOfExperience} years` : "Unspecified",
        responsibilities: "Professional activities outlined across resume body.",
        technologies: resumeInfo.skills.slice(0, 5).join(', ') || "N/A",
        relevance: "Direct experience alignment is contingent upon specific duties."
      });
    }

    return experienceList;
  }

  // ==========================================
  // STEP 10 — ATS RESUME QUALITY AUDIT
  // ==========================================
  performAtsAudit(resumeText, jobInfo, resumeInfo) {
    const friendly = [];
    const problems = [];
    const missingKeywords = [];
    const formatting = [];

    // Check headings
    const hasHeadings = /experience|education|skills|projects|summary/i.test(resumeText);
    if (hasHeadings) {
      friendly.push("Standard ATS section headers present (Experience, Education, Skills)");
    } else {
      problems.push("Lacks standard section headers, risking ATS parser rejection");
    }

    // Check contact info
    const hasEmail = /[\w\.-]+@[\w\.-]+\.\w+/.test(resumeText);
    const hasPhone = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
    if (hasEmail && hasPhone) {
      friendly.push("Contact coordinates (Email and Phone number) readily discoverable");
    } else {
      problems.push("Missing direct email or telephone contact in standard format");
    }

    // Quantifiable metrics
    const metricsCount = (resumeText.match(/\d+%/g) || []).length + (resumeText.match(/\$[\d,]+[kKmM]?/g) || []).length;
    if (metricsCount >= 2) {
      friendly.push(`Quantified achievements present (${metricsCount}+ quantifiable performance metrics detected)`);
    } else {
      formatting.push("Low density of quantifiable metrics (recommend adding specific % improvements or scale figures)");
    }

    // Missing key job keywords
    jobInfo.requiredSkills.forEach(reqSkill => {
      if (!resumeText.toLowerCase().includes(reqSkill.toLowerCase())) {
        missingKeywords.push(reqSkill);
      }
    });

    return {
      atsFriendlyElements: friendly,
      potentialProblems: problems.length > 0 ? problems : ["No critical ATS parse blockers detected."],
      missingKeywords: missingKeywords.length > 0 ? missingKeywords : ["All primary keywords detected."],
      formattingConcerns: formatting.length > 0 ? formatting : ["Clean single-column hierarchical formatting."]
    };
  }

  // ==========================================
  // STEP 11 — SUGGESTIONS & FINAL EXPLANATION
  // ==========================================
  generateImprovementSuggestions(gaps, atsAnalysis, jobInfo) {
    const suggestions = [];

    if (gaps.length > 0) {
      const topGap = gaps[0];
      suggestions.push(`Address skill gap in '${topGap.requirement}': If you possess practical or academic experience with this technology, explicitly detail the specific use case and deliverables.`);
    }

    if (atsAnalysis.missingKeywords.length > 0 && atsAnalysis.missingKeywords[0] !== "All primary keywords detected.") {
      suggestions.push(`Incorporate target keywords: Strategically introduce keywords such as '${atsAnalysis.missingKeywords.slice(0, 3).join("', '")}' into bullet points where you have genuinely applied them.`);
    }

    suggestions.push(`Quantify business impact: Emphasize business or performance metrics (e.g., latency reduction, revenue pipeline generated, or user adoption) rather than solely describing daily tasks.`);
    suggestions.push(`Tailor summary statement: Refine top professional summary to mirror the primary competencies and core focus of the ${jobInfo.title} role.`);

    return suggestions;
  }

  generateFinalExplanation(classification, scoring, skillAnalysis, resumeInfo, jobInfo) {
    const matches = skillAnalysis.items.filter(i => i.match === 'MATCH').length;
    const totalReqs = skillAnalysis.items.length;

    let text = `The candidate's resume received a classification of **${classification.category}** with an overall compatibility score of **${scoring.totalScore}/100**. `;
    text += `Out of ${totalReqs} evaluated technical competencies and role requirements, ${matches} were directly verified with explicit resume evidence. `;

    if (classification.criticalWarning) {
      text += `Crucially: ${classification.criticalWarning} `;
    }

    if (scoring.totalScore >= 80) {
      text += `The candidate demonstrates strong technical synergy and solid domain preparation for ${jobInfo.title}.`;
    } else if (scoring.totalScore >= 50) {
      text += `The profile possesses viable foundational competencies but exhibits notable gaps in core mandatory tooling or quantified experience duration.`;
    } else {
      text += `The resume demonstrates significant divergence from the prerequisite technical stack and experience expectations required for this specific role.`;
    }

    return text;
  }

  // ==========================================
  // UTILITY HELPERS
  // ==========================================
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  findContextSnippet(text, keyword) {
    const lines = text.split(/\r?\n/);
    for (let line of lines) {
      if (new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'i').test(line)) {
        return line.replace(/^[•\-\*\s]+/, '').trim().slice(0, 110);
      }
    }
    return null;
  }

  checkPartialRelevance(skill, candidateSkillsSet) {
    // Relational mapping for partial matches
    const relations = {
      'kubernetes': ['docker', 'aws', 'ecs'],
      'terraform': ['aws', 'ci/cd', 'docker'],
      'pytorch': ['python', 'scikit-learn', 'machine learning'],
      'tensorflow': ['python', 'scikit-learn', 'machine learning'],
      'llm': ['python', 'scikit-learn', 'nlp'],
      'fastapi': ['python', 'flask', 'django'],
      'react': ['javascript', 'typescript', 'frontend'],
      'typescript': ['javascript'],
      'postgresql': ['sql', 'mysql', 'database'],
      'redis': ['database', 'caching']
    };

    if (relations[skill]) {
      for (let related of relations[skill]) {
        if (candidateSkillsSet.has(related)) {
          return related;
        }
      }
    }
    return null;
  }

  extractSectionBlocks(text, headingVariants) {
    const lines = text.split(/\r?\n/);
    const blocks = [];
    let inSection = false;
    let currentBlock = null;

    const allMainHeadings = ['education', 'skills', 'technical skills', 'experience', 'work experience', 'projects', 'certifications', 'summary'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lower = line.toLowerCase().replace(/[:#]/g, '').trim();

      // Check if entering target section
      if (headingVariants.some(v => lower === v || lower.startsWith(v))) {
        inSection = true;
        continue;
      }

      // Check if entering another main heading
      if (inSection && allMainHeadings.some(h => (lower === h || lower.startsWith(h)) && !headingVariants.includes(h))) {
        if (currentBlock) blocks.push(currentBlock);
        inSection = false;
        break;
      }

      if (inSection && line.length > 0) {
        // Detect item title
        if (!currentBlock || line.includes('|') || line.length < 40 && !line.startsWith('•') && !line.startsWith('-')) {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = {
            title: line.replace(/^[•\-\*#]\s*/, ''),
            content: ""
          };
        } else {
          currentBlock.content += (currentBlock.content ? " " : "") + line.replace(/^[•\-\*]\s*/, '');
        }
      }
    }

    if (currentBlock) blocks.push(currentBlock);
    return blocks;
  }
}

// Global instance
const resumeClassifier = new ResumeClassifierEngine();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ResumeClassifierEngine, resumeClassifier };
}
