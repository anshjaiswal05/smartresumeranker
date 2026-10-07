// Comprehensive Technology Roles Dataset with Required & Desirable Skills
const TECH_ROLES_DATASET = [
  // Software Development
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    category: 'Software Development',
    description: 'Builds responsive, accessible, interactive web interfaces and client-side applications.',
    requiredSkills: ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Git', 'REST APIs', 'Responsive Design'],
    recommendedSkills: ['Next.js', 'Tailwind CSS', 'Redux', 'Jest', 'Webpack', 'Web Performance', 'CI/CD']
  },
  {
    id: 'backend-developer',
    title: 'Backend Developer',
    category: 'Software Development',
    description: 'Engineers server architectures, databases, microservices, and high-performance APIs.',
    requiredSkills: ['Node.js', 'Express', 'SQL', 'PostgreSQL', 'MongoDB', 'REST APIs', 'Git', 'Data Structures'],
    recommendedSkills: ['Docker', 'Redis', 'Kafka', 'Microservices', 'AWS', 'GraphQL', 'System Design', 'CI/CD']
  },
  {
    id: 'fullstack-developer',
    title: 'Full Stack Developer',
    category: 'Software Development',
    description: 'Handles end-to-end development covering both modern client-side and robust server-side systems.',
    requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'MongoDB', 'REST APIs', 'Git'],
    recommendedSkills: ['Next.js', 'Docker', 'PostgreSQL', 'Redis', 'AWS', 'Tailwind CSS', 'CI/CD', 'Testing']
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    category: 'Software Development',
    description: 'Applies software engineering principles to design, test, and maintain enterprise software.',
    requiredSkills: ['Java', 'Python', 'C++', 'Data Structures', 'Algorithms', 'SQL', 'Git', 'Object-Oriented Programming'],
    recommendedSkills: ['System Design', 'Docker', 'CI/CD', 'Linux', 'Microservices', 'Spring Boot', 'Unit Testing']
  },
  {
    id: 'mobile-developer',
    title: 'Mobile App Developer',
    category: 'Software Development',
    description: 'Designs and builds mobile applications for iOS and Android platforms.',
    requiredSkills: ['Flutter', 'React Native', 'Dart', 'JavaScript', 'Mobile UI/UX', 'REST APIs', 'Git'],
    recommendedSkills: ['Kotlin', 'Swift', 'Firebase', 'State Management', 'App Store Deployment', 'CI/CD']
  },

  // Data
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    category: 'Data',
    description: 'Uncovers actionable business insights using statistical models, machine learning, and data pipelines.',
    requiredSkills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Scikit-learn', 'Statistics', 'Data Visualization', 'Git'],
    recommendedSkills: ['TensorFlow', 'PyTorch', 'Tableau', 'Spark', 'Feature Engineering', 'Big Data']
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    category: 'Data',
    description: 'Translates numbers and metrics into strategic business recommendations and interactive dashboards.',
    requiredSkills: ['SQL', 'Excel', 'Python', 'Tableau', 'Power BI', 'Data Cleaning', 'Statistics'],
    recommendedSkills: ['R', 'Pandas', 'ETL Processes', 'A/B Testing', 'Business Intelligence', 'Snowflake']
  },
  {
    id: 'data-engineer',
    title: 'Data Engineer',
    category: 'Data',
    description: 'Architects large-scale data ingestion pipelines, data lakes, and distributed warehousing systems.',
    requiredSkills: ['Python', 'SQL', 'Apache Spark', 'Kafka', 'Data Warehousing', 'PostgreSQL', 'Airflow', 'Git'],
    recommendedSkills: ['Hadoop', 'AWS Redshift', 'Snowflake', 'Scala', 'Docker', 'Kubernetes', 'ETL Architecture']
  },

  // AI & ML
  {
    id: 'machine-learning-engineer',
    title: 'Machine Learning Engineer',
    category: 'AI/ML',
    description: 'Researches, trains, optimizes, and ships predictive models and deep learning networks to production.',
    requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Mathematics & Linear Algebra', 'Docker', 'Git'],
    recommendedSkills: ['MLOps', 'Kubeflow', 'Model Quantization', 'FastAPI', 'AWS SageMaker', 'CUDA', 'NLP']
  },
  {
    id: 'ai-engineer',
    title: 'AI Engineer / LLM Specialist',
    category: 'AI/ML',
    description: 'Builds intelligent agentic workflows, fine-tunes LLMs, implements RAG, and integrates multi-modal AI.',
    requiredSkills: ['Python', 'OpenAI API / Gemini API', 'LangChain', 'LlamaIndex', 'Vector Databases', 'Prompt Engineering', 'Git'],
    recommendedSkills: ['FastAPI', 'Embeddings', 'Fine-Tuning', 'Docker', 'RAG Pipelines', 'Evaluation Frameworks']
  },

  // Cloud & DevOps
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    category: 'Cloud/DevOps',
    description: 'Automates deployment pipelines, provisions infrastructure as code, and maintains production reliability.',
    requiredSkills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'GitLab CI / GitHub Actions', 'Terraform', 'Bash', 'Git'],
    recommendedSkills: ['AWS', 'Ansible', 'Prometheus', 'Grafana', 'Helm', 'ArgoCD', 'Python']
  },
  {
    id: 'cloud-engineer',
    title: 'Cloud Engineer / Cloud Architect',
    category: 'Cloud/DevOps',
    description: 'Designs resilient, cost-efficient cloud architectures across AWS, Azure, or Google Cloud.',
    requiredSkills: ['AWS', 'Azure', 'Linux', 'Terraform', 'Networking & VPC', 'IAM Security', 'Docker'],
    recommendedSkills: ['Kubernetes', 'Serverless', 'CloudFormation', 'Python', 'Cost Optimization', 'Disaster Recovery']
  },

  // Cybersecurity
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    category: 'Cybersecurity',
    description: 'Monitors, investigates, and responds to cybersecurity incidents and fortifies defense infrastructure.',
    requiredSkills: ['Network Security', 'SIEM Tools', 'Vulnerability Assessment', 'Linux', 'Firewalls', 'Incident Response'],
    recommendedSkills: ['Wireshark', 'Python', 'SOC Operations', 'Penetration Testing', 'Splunk', 'OWASP Top 10']
  },
  {
    id: 'security-engineer',
    title: 'Security Engineer',
    category: 'Cybersecurity',
    description: 'Implements zero-trust architectures, secures software supply chains, and runs automated penetration tests.',
    requiredSkills: ['Cryptography', 'AppSec', 'Linux', 'Python', 'Cloud Security', 'OWASP', 'Penetration Testing'],
    recommendedSkills: ['Burp Suite', 'Docker Security', 'CI/CD Security (DevSecOps)', 'Kubernetes Security']
  },

  // Testing & QA
  {
    id: 'qa-automation-engineer',
    title: 'QA Automation Engineer',
    category: 'Testing',
    description: 'Designs automated end-to-end testing suites, performance benchmarks, and CI/CD test gates.',
    requiredSkills: ['Selenium', 'Cypress', 'Playwright', 'JavaScript', 'Python', 'API Testing', 'Postman', 'Git'],
    recommendedSkills: ['CI/CD Integration', 'Performance Testing', 'JMeter', 'Jest', 'Test Automation Frameworks']
  },

  // Database
  {
    id: 'database-administrator',
    title: 'Database Administrator (DBA)',
    category: 'Database',
    description: 'Maintains high availability, backups, replication, indexing, and tuning for enterprise database engines.',
    requiredSkills: ['PostgreSQL', 'MySQL', 'SQL Performance Tuning', 'Database Indexing', 'Linux', 'Backup & Recovery'],
    recommendedSkills: ['MongoDB', 'Oracle', 'High Availability Replication', 'Connection Pooling', 'Sharding']
  }
];

/**
 * Perform Skill Gap Analysis
 */
function analyzeSkillGap({ userSkills = [], targetRoleId, customTargetRole = '' }) {
  // Normalize user skills
  const normalizedUserSkills = (userSkills || []).map(s => s.trim().toLowerCase());

  let targetRole = TECH_ROLES_DATASET.find(r => r.id === targetRoleId);
  if (!targetRole && customTargetRole) {
    targetRole = TECH_ROLES_DATASET.find(r => r.title.toLowerCase() === customTargetRole.toLowerCase()) || {
      id: 'custom-role',
      title: customTargetRole,
      category: 'General Technology',
      requiredSkills: ['Git', 'Problem Solving', 'Data Structures', 'APIs'],
      recommendedSkills: ['Docker', 'Cloud', 'System Architecture']
    };
  }

  if (!targetRole) {
    targetRole = TECH_ROLES_DATASET[0]; // Default to Frontend Developer
  }

  const skillsYouHave = [];
  const missingHighPriority = [];
  const missingMediumPriority = [];
  const missingLowPriority = [];

  const checkMatch = (skillName) => {
    const sLower = skillName.toLowerCase();
    return normalizedUserSkills.some(u => {
      return u === sLower || u.includes(sLower) || sLower.includes(u);
    });
  };

  // Evaluate Required Skills (High Priority)
  for (const skill of targetRole.requiredSkills) {
    if (checkMatch(skill)) {
      skillsYouHave.push(skill);
    } else {
      missingHighPriority.push(skill);
    }
  }

  // Evaluate Recommended Skills (Medium / Low Priority)
  for (let i = 0; i < targetRole.recommendedSkills.length; i++) {
    const skill = targetRole.recommendedSkills[i];
    if (checkMatch(skill)) {
      if (!skillsYouHave.includes(skill)) {
        skillsYouHave.push(skill);
      }
    } else {
      if (i < 4) {
        missingMediumPriority.push(skill);
      } else {
        missingLowPriority.push(skill);
      }
    }
  }

  const totalEvaluatedSkills = targetRole.requiredSkills.length + targetRole.recommendedSkills.length;
  const matchPercentage = Math.round((skillsYouHave.length / totalEvaluatedSkills) * 100);

  return {
    targetRole: {
      id: targetRole.id,
      title: targetRole.title,
      category: targetRole.category,
      description: targetRole.description
    },
    matchPercentage,
    skillsYouHave,
    missingSkills: {
      highPriority: missingHighPriority,
      mediumPriority: missingMediumPriority,
      lowPriority: missingLowPriority,
      totalMissing: missingHighPriority.length + missingMediumPriority.length + missingLowPriority.length
    },
    recommendations: [
      `Prioritize learning high-impact essentials: ${missingHighPriority.slice(0, 3).join(', ') || 'Keep expanding advanced projects'}.`,
      `Incorporate projects demonstrating hands-on experience in ${missingMediumPriority.slice(0, 2).join(' and ') || 'specialized tools'}.`,
      `Target a match rate of 80%+ to substantially boost interview callbacks for ${targetRole.title}.`
    ]
  };
}

module.exports = {
  TECH_ROLES_DATASET,
  analyzeSkillGap
};
