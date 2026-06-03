import axios from 'axios';

// Main AI Assistant helper
export const getAISummary = async (resourceTitle, resourceDescription) => {
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Provide a detailed academic study summary (3 bullet points of core concepts, 2 bullet points of key takeaways) for the educational resource titled "${resourceTitle}". Context: ${resourceDescription}. Make it professional, clear, and structured for university students.`,
                },
              ],
            },
          ],
        }
      );
      const summaryText = response.data.candidates[0].content.parts[0].text;
      return summaryText;
    } catch (error) {
      console.error('Gemini API Error (Summarize):', error.message);
      // Fallback to local heuristic summary
    }
  }

  // Local Heuristic Summary
  return `### Study Overview for ${resourceTitle}
* **Core Topic**: Deep dive into the fundamentals of ${resourceTitle.replace(/notes|slides|exam|assignment/gi, '').trim()}.
* **Key Concept**: Analyzes practical applications, foundational theories, and problem-solving methodologies within the ${resourceDescription.slice(0, 50)}... domain.
* **Academic Value**: Highly recommended study resource for exam revision, college assignments, and self-paced tutorial reinforcement.
* **Suggested Study Focus**: Focus on definitions, core diagrams, and the sample questions outlined in the document.`;
};

export const generateAIQuiz = async (resourceTitle, resourceDescription) => {
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Generate exactly three Multiple Choice Questions based on: Title: "${resourceTitle}", Description: "${resourceDescription}". 
Return ONLY a JSON array matching this format (no markdown formatting, no comments):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0
  }
]`,
                },
              ],
            },
          ],
        }
      );
      let text = response.data.candidates[0].content.parts[0].text;
      // Strip markdown code block wrappers if any
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini API Error (Quiz):', error.message);
      // Fallback to local quiz questions
    }
  }

  // Local Heuristic Quiz
  return [
    {
      question: `What is the primary academic focus of "${resourceTitle}"?`,
      options: [
        'Advanced system design and performance testing',
        'Core concepts and foundational principles discussed in the notes',
        'Industry-level compliance standard implementations',
        'Historical development and socio-economic timeline',
      ],
      correctIndex: 1,
    },
    {
      question: `Under what course material category is "${resourceTitle}" classified?`,
      options: [
        'Extra-curricular reading and reference lists',
        'Laboratory code repository and API documents',
        'University curriculum-aligned resources & notes',
        'Industry guest lecture presentation slides',
      ],
      correctIndex: 2,
    },
    {
      question: `Based on: "${resourceDescription}", what is the primary learning objective?`,
      options: [
        'To memorize historical timelines without applications',
        'To configure cloud-scale load-balancers manually',
        'To acquire core theoretical insights and review practical examples',
        'To build commercial compilers from scratch in Assembly',
      ],
      correctIndex: 2,
    },
  ];
};

export const parseNaturalLanguageQuery = (query) => {
  const q = query.toLowerCase().trim();
  const result = {
    search: '',
    university: null, // to be matched in controller
    year: null,
    semester: null,
    fileType: null,
  };

  // 1. Identify University keywords
  const uniKeywords = {
    'addis ababa': 'Addis Ababa University',
    'bahir dar': 'Bahir Dar University',
    'jimma': 'Jimma University',
    'adama': 'Adama Science and Technology University',
    'hawassa': 'Hawassa University',
    'mekelle': 'Mekelle University',
    'haramaya': 'Haramaya University',
    'arba minch': 'Arba Minch University',
    'debre berhan': 'Debre Berhan University',
    'wollo': 'Wollo University',
  };

  for (const [key, value] of Object.entries(uniKeywords)) {
    if (q.includes(key)) {
      result.university = value;
      break;
    }
  }

  // 2. Identify Year
  if (q.includes('first year') || q.includes('1st year') || q.includes('freshman') || q.includes('year 1')) {
    result.year = 1;
  } else if (q.includes('second year') || q.includes('2nd year') || q.includes('sophomore') || q.includes('year 2')) {
    result.year = 2;
  } else if (q.includes('third year') || q.includes('3rd year') || q.includes('junior') || q.includes('year 3')) {
    result.year = 3;
  } else if (q.includes('fourth year') || q.includes('4th year') || q.includes('senior') || q.includes('year 4')) {
    result.year = 4;
  } else if (q.includes('fifth year') || q.includes('5th year') || q.includes('year 5')) {
    result.year = 5;
  }

  // 3. Identify Semester
  if (q.includes('semester 1') || q.includes('1st semester') || q.includes('sem 1')) {
    result.semester = 1;
  } else if (q.includes('semester 2') || q.includes('2nd semester') || q.includes('sem 2')) {
    result.semester = 2;
  } else if (q.includes('semester 3') || q.includes('3rd semester') || q.includes('sem 3')) {
    result.semester = 3;
  }

  // 4. Identify Resource/File Type
  if (q.includes('exam') || q.includes('mid') || q.includes('final') || q.includes('test')) {
    result.fileType = 'pdf'; // Defaulting to PDF structure for exams
    result.searchType = 'exam';
  } else if (q.includes('slide') || q.includes('ppt') || q.includes('powerpoint')) {
    result.fileType = 'pptx';
  } else if (q.includes('assignment') || q.includes('project')) {
    result.searchType = 'assignment';
  }

  // 5. Clean search string (remove stop words, university names, years, etc.)
  let cleanStr = q
    .replace(/(show|me|find|get|list|exams?|notes?|slides?|assignments?|papers?|projects?|from|for|students?|university|univ|in|at|the|of|a|an|year|semester)/gi, '')
    .replace(/(addis ababa|bahir dar|jimma|adama|hawassa|mekelle|haramaya|arba minch|debre berhan|wollo)/gi, '')
    .replace(/(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th|freshman|sophomore|junior|senior|sem \d|semester \d)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  result.search = cleanStr;
  return result;
};

export const chatWithStudyAssistant = async (message, history = []) => {
  if (process.env.GEMINI_API_KEY) {
    try {
      const messages = history.map((h) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      }));
      messages.push({ role: 'user', parts: [{ text: message }] });

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: messages,
          systemInstruction: {
            parts: [{ text: "You are the EthioStudyHub AI Study Assistant. Help Ethiopian university students understand academic concepts, suggest tutorial links, and guide them in selecting resources. Keep responses concise, clear, and encouraging. Use markdown formatting." }]
          }
        }
      );
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini Chat Error:', error.message);
      // Fallback
    }
  }

  // Local Rule-Based Chatbot Response
  const msg = message.toLowerCase();
  if (msg.includes('database') || msg.includes('sql') || msg.includes('nosql')) {
    return `### Database Systems Study Support
Database concepts revolve around storage, retrieval, and schema integrity:
- **Relational Databases (SQL)**: Uses tables with rows and columns (e.g. MySQL, PostgreSQL). It enforces strict constraints and ACID compliance.
- **Non-Relational (NoSQL)**: Key-value, Document-based (e.g. MongoDB), Column-family, or Graph-based. Great for horizontal scaling.

*Study Hub Tip:* Go to the **Resources** page and filter by "Database Systems" to get slides and sample mid-exams!`;
  }

  if (msg.includes('java') || msg.includes('oop') || msg.includes('programming')) {
    return `### Object-Oriented Programming (OOP) in Java
OOP is built on four core pillars:
1. **Encapsulation**: Hiding internal state by providing getters/setters.
2. **Inheritance**: Creating hierarchical relationships (\`extends\` keyword).
3. **Polymorphism**: Overriding methods to customize behavior.
4. **Abstraction**: Hiding structural details using Interfaces and Abstract classes.

*Tutorial recommendation:* Check out the **Useful Links** inside Java Programming notes for top YouTube reference courses!`;
  }

  if (msg.includes('exam') || msg.includes('prepare') || msg.includes('study tip')) {
    return `### 📚 Study & Exam Preparation Tips:
1. **Solve Past Exams**: Go to our sidebar and click **Previous Exams**. Active recall is the #1 way to prepare.
2. **Feynman Technique**: Explain complex concepts to a peer or try teaching it in the **Community Forum**.
3. **AI Quiz Generator**: Open any resource on EthioStudyHub and click **"Generate AI Quiz"** to self-test immediately.`;
  }

  return `Hello! I am your **EthioStudyHub AI Study Assistant**. 

I can help you:
- Explain difficult academic concepts (e.g., "What is encapsulation in OOP?")
- Provide study strategies for exams (e.g., "How to prepare for Calculus final?")
- Guide you to relevant course categories.

What are you studying today?`;
};
