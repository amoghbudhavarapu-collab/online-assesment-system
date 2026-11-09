const { connectDB, disconnectDB } = require('../config/db');
const { User } = require('../modules/users/user.model');
const { Question } = require('../modules/questions/question.model');
const { Examination } = require('../modules/examinations/examination.model');

async function seed() {
  console.log('🌱 Starting database seed...');
  await connectDB();

  try {
    // 1. Create Default Users
    console.log('Clearing old users, questions, examinations...');
    await User.deleteMany({});
    await Question.deleteMany({});
    await Examination.deleteMany({});

    console.log('Creating default users...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@assessment.com',
      password: 'Password@123',
      role: 'admin',
      isActive: true
    });

    const teacher = await User.create({
      name: 'Prof. Alan Turing',
      email: 'teacher@assessment.com',
      password: 'Password@123',
      role: 'teacher',
      isActive: true
    });

    const student = await User.create({
      name: 'Ada Lovelace',
      email: 'student@assessment.com',
      password: 'Password@123',
      role: 'student',
      isActive: true
    });

    console.log('✅ Users created:');
    console.log('   Admin:   admin@assessment.com   / Password@123');
    console.log('   Teacher: teacher@assessment.com / Password@123');
    console.log('   Student: student@assessment.com / Password@123');

    // 2. Create Sample Questions
    console.log('Creating sample questions across all 4 types...');
    const q1 = await Question.create({
      questionText: 'What is the primary data model used by MongoDB?',
      questionType: 'MCQ',
      options: ['Relational Tables', 'Document-based JSON/BSON', 'Key-Value Pairs', 'Graph Network'],
      correctAnswer: 'Document-based JSON/BSON',
      marks: 2,
      negativeMarks: 0.5,
      difficulty: 'easy',
      category: 'Databases',
      explanation: 'MongoDB stores records as BSON documents.',
      createdBy: teacher._id
    });

    const q2 = await Question.create({
      questionText: 'Which of the following are valid JavaScript data types? (Select all that apply)',
      questionType: 'MULTIPLE_SELECT',
      options: ['boolean', 'number', 'float', 'string'],
      correctAnswer: ['boolean', 'number', 'string'],
      marks: 3,
      negativeMarks: 1,
      difficulty: 'medium',
      category: 'Web Development',
      explanation: 'In JavaScript, numbers (integers and floats) are represented by the "number" type.',
      createdBy: teacher._id
    });

    const q3 = await Question.create({
      questionText: 'HTTP status code 404 indicates an Internal Server Error.',
      questionType: 'TRUE_FALSE',
      options: ['true', 'false'],
      correctAnswer: 'false',
      marks: 1,
      negativeMarks: 0.25,
      difficulty: 'easy',
      category: 'Networking',
      explanation: 'HTTP 404 indicates Not Found; 500 represents Internal Server Error.',
      createdBy: teacher._id
    });

    const q4 = await Question.create({
      questionText: 'In React, the Hook used to manage mutable local component state is _______.',
      questionType: 'FILL_BLANKS',
      correctAnswer: 'useState',
      acceptedAnswers: ['useState()', 'use_state', 'useState hook'],
      marks: 2,
      negativeMarks: 0,
      difficulty: 'medium',
      category: 'Web Development',
      explanation: 'The useState hook is the primary hook for component state in React.',
      createdBy: teacher._id
    });

    console.log('✅ 4 Sample questions created');

    // 3. Create Sample Examination
    console.log('Creating sample examination...');
    const startTime = new Date(Date.now() - 10 * 60 * 1000); // Started 10 mins ago
    const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Ends tomorrow

    const exam = await Examination.create({
      title: 'Full-Stack Web Development Assessment 2026',
      description: 'Comprehensive assessment covering MongoDB, JavaScript fundamentals, networking, and React.',
      subject: 'Computer Science',
      instructions: 'Answer all 4 questions. Negative marking is enabled for incorrect answers.',
      duration: 45,
      passingMarks: 4,
      negativeMarkingEnabled: true,
      shuffleQuestions: false,
      startTime,
      endTime,
      assignedStudents: [],
      resultPublicationMode: 'manual',
      resultsPublished: false,
      status: 'live',
      createdBy: teacher._id,
      questions: [
        {
          questionId: q1._id,
          questionText: q1.questionText,
          questionType: q1.questionType,
          options: q1.options,
          correctAnswer: q1.correctAnswer,
          acceptedAnswers: q1.acceptedAnswers,
          marks: q1.marks,
          negativeMarks: q1.negativeMarks,
          explanation: q1.explanation,
          order: 1
        },
        {
          questionId: q2._id,
          questionText: q2.questionText,
          questionType: q2.questionType,
          options: q2.options,
          correctAnswer: q2.correctAnswer,
          acceptedAnswers: q2.acceptedAnswers,
          marks: q2.marks,
          negativeMarks: q2.negativeMarks,
          explanation: q2.explanation,
          order: 2
        },
        {
          questionId: q3._id,
          questionText: q3.questionText,
          questionType: q3.questionType,
          options: q3.options,
          correctAnswer: q3.correctAnswer,
          acceptedAnswers: q3.acceptedAnswers,
          marks: q3.marks,
          negativeMarks: q3.negativeMarks,
          explanation: q3.explanation,
          order: 3
        },
        {
          questionId: q4._id,
          questionText: q4.questionText,
          questionType: q4.questionType,
          options: q4.options,
          correctAnswer: q4.correctAnswer,
          acceptedAnswers: q4.acceptedAnswers,
          marks: q4.marks,
          negativeMarks: q4.negativeMarks,
          explanation: q4.explanation,
          order: 4
        }
      ]
    });

    console.log(`✅ Sample examination created: "${exam.title}" (Total marks: ${exam.totalMarks})`);
    console.log('🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await disconnectDB();
  }
}

seed();

