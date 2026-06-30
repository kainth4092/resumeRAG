
export function estimatePageCount(resume) {
  if (!resume) return 1;
  const expCount = resume.experience?.length || 0;
  const eduCount = resume.education?.length || 0;
  const projCount = resume.projects?.length || 0;
  const skillsCount = resume.skills?.length || 0;

  let bulletCount = 0;
  resume.experience?.forEach(exp => {
    if (Array.isArray(exp.bullets)) {
      bulletCount += exp.bullets.length;
    } else if (Array.isArray(exp.description)) {
      bulletCount += exp.description.length;
    }
  });

  resume.projects?.forEach(proj => {
    if (Array.isArray(proj.description)) {
      bulletCount += proj.description.length;
    } else if (typeof proj.desc === 'string') {
      bulletCount += proj.desc.split('\n').filter(Boolean).length;
    }
  });

  const totalScore = expCount * 8 + eduCount * 6 + projCount * 6 + skillsCount * 1.5 + bulletCount * 2;

  if (totalScore > 110) return 3;
  if (totalScore > 50) return 2;
  return 1;
}
