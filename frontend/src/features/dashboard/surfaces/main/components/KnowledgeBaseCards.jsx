// Extracted verbatim from pages/DashboardPage.js (Faz1 refactor).
import React from "react";
import Arrow from "./Arrow";

export default function KnowledgeBaseCards({ navigate }) {
  const tools = [
    { name: "Strategies", route: "/tips", tone: "var(--liz)" },
    { name: "Vocabulary", route: "/vocabulary", tone: "var(--gold-ink)" },
    { name: "Grammar", route: "/grammar", tone: "var(--primary)" },
    { name: "Sample reports", route: "/sample-reports", tone: "var(--sky)" },
  ];
  const courses = [
    { name: "Beginner", band: "Band 2.0–4.5", route: "/beginner-course", tone: "var(--primary)" },
    { name: "Mastery", band: "Band 4.5–6.5", route: "/mastery-course", tone: "var(--sky)" },
    { name: "Advanced", band: "Band 6.5–9.0", route: "/advanced-mastery", tone: "var(--gold-ink)" },
  ];
  return (
    <section className="mb-12 md:mb-16">
      <div className="mb-5">
        <div className="eyebrow mb-2">Knowledge base</div>
        <div className="display-m">Learn the principles, then drill them</div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="label mb-4">Learning tools</div>
          <div className="space-y-2">
            {tools.map((tool) => (
              <button
                key={tool.name}
                type="button"
                onClick={() => navigate(tool.route)}
                className="w-full px-4 py-3 rounded-xl text-left flex items-center justify-between transition-colors"
                style={{
                  border: "1px solid hsl(var(--rule))",
                  background: `linear-gradient(90deg, hsl(${tool.tone} / .06) 0%, transparent 60%)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(90deg, hsl(${tool.tone} / .12) 0%, hsl(${tool.tone} / .03) 80%)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(90deg, hsl(${tool.tone} / .06) 0%, transparent 60%)`;
                }}
              >
                <span className="display-m text-[18px]">{tool.name}</span>
                <Arrow small />
              </button>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <div className="label mb-4">Courses</div>
          <div className="space-y-2">
            {courses.map((course) => (
              <button
                key={course.name}
                type="button"
                onClick={() => navigate(course.route)}
                className="w-full px-4 py-3 rounded-xl text-left flex items-center justify-between transition-colors"
                style={{
                  border: "1px solid hsl(var(--rule))",
                  background: `linear-gradient(90deg, hsl(${course.tone} / .06) 0%, transparent 60%)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(90deg, hsl(${course.tone} / .12) 0%, hsl(${course.tone} / .03) 80%)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(90deg, hsl(${course.tone} / .06) 0%, transparent 60%)`;
                }}
              >
                <div>
                  <div className="display-m text-[18px]">{course.name}</div>
                  <div className="text-xs text-muted mt-0.5">{course.band}</div>
                </div>
                <Arrow small />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
