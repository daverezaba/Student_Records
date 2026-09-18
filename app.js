
const fs = require('fs');

// 1. Load student data
function loadStudents(filePath = './students.json') {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading students.json:', err.message);
    return [];
  }
}

// 2. Calculate grade
function getGrade(avg) {
  if (avg >= 90) return 'A';
  if (avg >= 85) return 'B+';
  if (avg >= 80) return 'B';
  if (avg >= 75) return 'C+';
  if (avg >= 60) return 'C';
  return 'F';
}

function processRecords(students) {
  return students.map(s => {
    const scores = Object.values(s.scores);
    const total = scores.reduce((a, b) => a + b, 0);
    const average = total / scores.length;
    const grade = getGrade(average);
    const status = average >= 75 ? 'Passed' : 'Failed';
    return {
      ...s,
      total,
      average: Number(average.toFixed(2)),
      grade,
      status
    };
  });
}

function generateReport(processed) {
  const totalStudents = processed.length;
  const averages = processed.map(p => p.average);
  const overallAvg = averages.reduce((a, b) => a + b, 0) / totalStudents;
  
  const passed = processed.filter(p => p.status === 'Passed').length;
  const failed = totalStudents - passed;

  const topStudent = [...processed].sort((a,b) => b.average - a.average)[0];
  const lowStudent = [...processed].sort((a,b) => a.average - b.average)[0];

  const byCourse = {};
  processed.forEach(p => {
    if (!byCourse[p.course]) byCourse[p.course] = [];
    byCourse[p.course].push(p.average);
  });
  const courseSummary = Object.keys(byCourse).map(course => {
    const arr = byCourse[course];
    return {
      course,
      count: arr.length,
      average: Number((arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(2))
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    totalStudents,
    overallAverage: Number(overallAvg.toFixed(2)),
    passed,
    failed,
    passRate: Number(((passed/totalStudents)*100).toFixed(2)) + '%',
    topPerformer: { name: topStudent.name, average: topStudent.average, course: topStudent.course },
    lowestPerformer: { name: lowStudent.name, average: lowStudent.average, course: lowStudent.course },
    byCourse: courseSummary,
    records: processed
  };
}

// Main
function main() {
  const students = loadStudents('./students.json');
  if (!students.length) return console.log('No students found.');

  const processed = processRecords(students);
  const report = generateReport(processed);

  fs.writeFileSync('./report.json', JSON.stringify(report, null, 2), 'utf-8');
  console.log('✅ Report generated: report.json');
  console.table(processed.map(({id,name,course,average,grade,status}) => ({id,name,course,average,grade,status})));
}

main();
