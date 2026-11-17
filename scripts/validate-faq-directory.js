const { faqDirectory } = require('../assets/faq-directory.js');

const expectedCount = 500;

if (!Array.isArray(faqDirectory) || faqDirectory.length !== expectedCount) {
  throw new Error(`Expected ${expectedCount} FAQ records; found ${faqDirectory.length}.`);
}

const questionSet = new Set();
const emptyAnswers = [];
for (const item of faqDirectory) {
  if (!item.question || !item.question.trim()) {
    throw new Error('FAQ item missing a question.');
  }
  if (!item.answer || !item.answer.trim() || item.answer.trim().length < 80) {
    emptyAnswers.push(item.question);
  }
  if (questionSet.has(item.question)) {
    throw new Error(`Duplicate FAQ question detected: ${item.question}`);
  }
  questionSet.add(item.question);
}

if (emptyAnswers.length) {
  throw new Error(`FAQ answers below minimum quality threshold: ${emptyAnswers.slice(0, 5).join(', ')}`);
}

console.log(`FAQ records validated: ${faqDirectory.length}`);
console.log(`Unique questions: ${questionSet.size}`);
console.log('FAQ directory integrity check passed.');
