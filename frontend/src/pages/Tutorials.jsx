import React from 'react';
import { Youtube, Globe, BookOpen, ExternalLink, Code } from 'lucide-react';

const Tutorials = () => {
  const references = [
    {
      category: 'Web Development & Basics',
      icon: Code,
      items: [
        { label: 'W3Schools Online Tutorials', desc: 'Standard references for HTML, CSS, JavaScript, SQL, and Python.', url: 'https://www.w3schools.com' },
        { label: 'freeCodeCamp Developer Path', desc: 'Full-length video courses covering frontend, backend, databases, and algorithms.', url: 'https://www.freecodecamp.org' },
        { label: 'MDN Web Docs', desc: 'Comprehensive API documentation and developer guides for building web pages.', url: 'https://developer.mozilla.org' },
      ],
    },
    {
      category: 'Academic Video Courses',
      icon: Youtube,
      items: [
        { label: 'MIT OpenCourseWare (YouTube)', desc: 'Official lecture videos covering linear algebra, calculus, physics, and computer algorithms.', url: 'https://www.youtube.com/@mitocw' },
        { label: 'CrashCourse Education (YouTube)', desc: 'Concise animated videos explaining world history, computer science fundamentals, and biology.', url: 'https://www.youtube.com/@crashcourse' },
        { label: 'Neso Academy (YouTube)', desc: 'In-depth engineering notes, digital electronics tutorials, and database lectures.', url: 'https://www.youtube.com/@nesoacademy' },
      ],
    },
    {
      category: 'Interactive E-learning Platforms',
      icon: Globe,
      items: [
        { label: 'Coursera Hub', desc: 'University-accredited certifications from top global companies and institutions.', url: 'https://www.coursera.org' },
        { label: 'Udemy Courses', desc: 'Self-paced coding bootcamps, project tutorials, and math workshops.', url: 'https://www.udemy.com' },
        { label: 'Khan Academy Math', desc: 'Step-by-step calculus, statistics, algebra, and chemistry learning exercises.', url: 'https://www.khanacademy.org' },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Learning References & Tutorials
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Hand-picked external links, documentation references, and video lectures to supplement your university course notes.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {references.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div key={idx} className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="font-display font-bold text-sm text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <Icon className="h-4.5 w-4.5" />
                {section.category}
              </h3>
              <div className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <a
                    key={itemIdx}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-3 rounded-xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:border-blue-500 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{item.label}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tutorials;
