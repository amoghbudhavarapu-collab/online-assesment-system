const { connectDB, disconnectDB } = require('../config/db');
const { User } = require('../modules/users/user.model');
const { Question } = require('../modules/questions/question.model');
const { Examination } = require('../modules/examinations/examination.model');
const { Attempt } = require('../modules/attempts/attempt.model');

async function seed() {
  console.log('🌱 Starting database seed...');
  await connectDB();

  try {
    // 1. Create Default Users
    console.log('Clearing old users, questions, examinations...');
    await User.deleteMany({});
    await Question.deleteMany({});
    await Examination.deleteMany({});
    await Attempt.deleteMany({});

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

    const bankQuestions = await Question.create([
      {
        questionText: 'Which array method returns a new array containing items that pass a test?',
        questionType: 'MCQ',
        options: ['map', 'filter', 'forEach', 'findIndex'],
        correctAnswer: 'filter',
        marks: 2,
        difficulty: 'easy',
        category: 'JavaScript',
        explanation: 'Array.filter returns a new array containing items that pass the callback test.',
        createdBy: teacher._id
      },
      {
        questionText: 'What does JSON.stringify() do?',
        questionType: 'MCQ',
        options: [
          'Converts a JavaScript value to a JSON string',
          'Parses a JSON string into an object',
          'Validates a JavaScript function',
          'Clones an object with its prototype'
        ],
        correctAnswer: 'Converts a JavaScript value to a JSON string',
        marks: 2,
        difficulty: 'easy',
        category: 'JavaScript',
        explanation: 'JSON.stringify serializes a JavaScript value as a JSON string.',
        createdBy: teacher._id
      },
      {
        questionText: 'Which MongoDB method finds documents that match a filter?',
        questionType: 'MCQ',
        options: ['find()', 'insertOne()', 'updateOne()', 'deleteOne()'],
        correctAnswer: 'find()',
        marks: 2,
        difficulty: 'easy',
        category: 'Databases',
        explanation: 'The find method returns documents that match its query filter.',
        createdBy: teacher._id
      },
      {
        questionText: 'A primary key uniquely identifies each row in a relational table.',
        questionType: 'TRUE_FALSE',
        options: ['true', 'false'],
        correctAnswer: 'true',
        marks: 2,
        difficulty: 'easy',
        category: 'Databases',
        explanation: 'Primary key values uniquely identify rows in a table.',
        createdBy: teacher._id
      },
      {
        questionText: 'Which HTTP method is typically used to retrieve a resource without changing server state?',
        questionType: 'MCQ',
        options: ['GET', 'POST', 'PATCH', 'DELETE'],
        correctAnswer: 'GET',
        marks: 2,
        difficulty: 'easy',
        category: 'Networking',
        explanation: 'GET requests retrieve a representation of a resource and are intended to be safe.',
        createdBy: teacher._id
      },
      {
        questionText: 'What does DNS primarily translate?',
        questionType: 'MCQ',
        options: [
          'Domain names into IP addresses',
          'HTTP requests into HTML',
          'Passwords into encryption keys',
          'MAC addresses into port numbers'
        ],
        correctAnswer: 'Domain names into IP addresses',
        marks: 2,
        difficulty: 'easy',
        category: 'Networking',
        explanation: 'DNS resolves human-readable domain names to IP addresses.',
        createdBy: teacher._id
      },
      {
        questionText: 'Which React Hook is used to run side effects after a component renders?',
        questionType: 'MCQ',
        options: ['useState', 'useEffect', 'useMemo', 'useRef'],
        correctAnswer: 'useEffect',
        marks: 2,
        difficulty: 'easy',
        category: 'React',
        explanation: 'useEffect runs side effects such as data fetching after render.',
        createdBy: teacher._id
      },
      {
        questionText: 'In React, which prop should uniquely identify each item in a rendered list?',
        questionType: 'MCQ',
        options: ['key', 'id', 'ref', 'name'],
        correctAnswer: 'key',
        marks: 2,
        difficulty: 'easy',
        category: 'React',
        explanation: 'React uses the key prop to match list items between renders.',
        createdBy: teacher._id
      },
      {
        questionText: 'Which Node.js core module provides the HTTP server and client APIs?',
        questionType: 'MCQ',
        options: ['http', 'fs', 'path', 'os'],
        correctAnswer: 'http',
        marks: 2,
        difficulty: 'easy',
        category: 'Node.js',
        explanation: 'The http module exposes createServer and request APIs.',
        createdBy: teacher._id
      },
      {
        questionText: 'Which argument lets Express middleware pass control to the next handler?',
        questionType: 'MCQ',
        options: ['next', 'res', 'req', 'done'],
        correctAnswer: 'next',
        marks: 2,
        difficulty: 'easy',
        category: 'Node.js',
        explanation: 'Calling next() forwards the request to the following middleware.',
        createdBy: teacher._id
      },
      {
        questionText: 'What is the average time complexity of binary search on a sorted array?',
        questionType: 'MCQ',
        options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'],
        correctAnswer: 'O(log n)',
        marks: 2,
        difficulty: 'medium',
        category: 'DSA',
        explanation: 'Binary search halves the search space on each comparison.',
        createdBy: teacher._id
      },
      {
        questionText: 'Which data structure follows the First-In-First-Out order?',
        questionType: 'MCQ',
        options: ['Stack', 'Queue', 'Tree', 'Graph'],
        correctAnswer: 'Queue',
        marks: 2,
        difficulty: 'easy',
        category: 'DSA',
        explanation: 'A queue removes elements in the same order they were added.',
        createdBy: teacher._id
      },
      {
        questionText: 'Which SQL clause filters rows before grouping and aggregation?',
        questionType: 'MCQ',
        options: ['WHERE', 'HAVING', 'ORDER BY', 'GROUP BY'],
        correctAnswer: 'WHERE',
        marks: 2,
        difficulty: 'medium',
        category: 'SQL',
        explanation: 'WHERE filters individual rows; HAVING filters aggregated groups.',
        createdBy: teacher._id
      },
      {
        questionText: 'The SQL INSERT INTO statement adds new rows to a table.',
        questionType: 'TRUE_FALSE',
        options: ['true', 'false'],
        correctAnswer: 'true',
        marks: 2,
        difficulty: 'easy',
        category: 'SQL',
        explanation: 'INSERT INTO appends new rows to an existing table.',
        createdBy: teacher._id
      },
      {
        questionText: 'Which practice best protects user passwords stored in a database?',
        questionType: 'MCQ',
        options: [
          'Hashing with a unique salt',
          'Storing them as plain text',
          'Encoding them with Base64',
          'Reversible symmetric encryption'
        ],
        correctAnswer: 'Hashing with a unique salt',
        marks: 2,
        difficulty: 'medium',
        category: 'Security',
        explanation: 'Salted password hashing makes stolen hashes hard to reverse.',
        createdBy: teacher._id
      },
      {
        questionText: 'HTTPS encrypts data in transit using TLS.',
        questionType: 'TRUE_FALSE',
        options: ['true', 'false'],
        correctAnswer: 'true',
        marks: 2,
        difficulty: 'easy',
        category: 'Security',
        explanation: 'TLS provides encryption, integrity and server authentication for HTTPS.',
        createdBy: teacher._id
      }
    ]);

    console.log('✅ 16 sample questions created');

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

    const completedExamSpecs = [
      {
        title: 'JavaScript Fundamentals',
        description: 'A short assessment on JavaScript arrays and JSON.',
        subject: 'JavaScript',
        questionIndexes: [0, 1],
        daysAgo: 3,
        correctCount: 2
      },
      {
        title: 'Database Essentials',
        description: 'Review document queries and relational database keys.',
        subject: 'Databases',
        questionIndexes: [2, 3],
        daysAgo: 5,
        correctCount: 1
      },
      {
        title: 'Web Networking Basics',
        description: 'Test your understanding of HTTP and DNS fundamentals.',
        subject: 'Networking',
        questionIndexes: [4, 5],
        daysAgo: 7,
        correctCount: 0
      },
      {
        title: 'React Fundamentals Assessment',
        description: 'Hooks and list rendering in modern React applications.',
        subject: 'React',
        questionIndexes: [6, 7],
        daysAgo: 2,
        correctCount: 2
      },
      {
        title: 'SQL Query Mastery',
        description: 'Row filtering and data modification with SQL statements.',
        subject: 'SQL',
        questionIndexes: [12, 13],
        daysAgo: 4,
        correctCount: 1
      },
      {
        title: 'Cyber Security Awareness',
        description: 'Password storage and secure transport fundamentals.',
        subject: 'Security',
        questionIndexes: [14, 15],
        daysAgo: 6,
        correctCount: 0
      }
    ];

    for (const spec of completedExamSpecs) {
      const submittedAt = new Date(Date.now() - spec.daysAgo * 24 * 60 * 60 * 1000);
      const startedAt = new Date(submittedAt.getTime() - 20 * 60 * 1000);
      const scheduledStart = new Date(startedAt.getTime() - 60 * 60 * 1000);
      const scheduledEnd = new Date(scheduledStart.getTime() + 2 * 60 * 60 * 1000);

      const questions = spec.questionIndexes.map((questionIndex, index) => {
        const question = bankQuestions[questionIndex];
        return {
          questionId: question._id,
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options,
          correctAnswer: question.correctAnswer,
          acceptedAnswers: question.acceptedAnswers,
          marks: question.marks,
          negativeMarks: question.negativeMarks,
          explanation: question.explanation,
          order: index + 1
        };
      });

      const completedExam = await Examination.create({
        title: spec.title,
        description: spec.description,
        subject: spec.subject,
        instructions: 'Answer both questions. The examination is timed.',
        duration: 30,
        passingMarks: 2,
        negativeMarkingEnabled: false,
        shuffleQuestions: false,
        startTime: scheduledStart,
        endTime: scheduledEnd,
        assignedStudents: [],
        resultPublicationMode: 'manual',
        resultsPublished: true,
        status: 'results_published',
        createdBy: teacher._id,
        questions
      });

      let correctAnswers = 0;
      let marksObtained = 0;
      const answers = questions.map((question, index) => {
        const isCorrect = index < spec.correctCount;
        const selectedAnswer = isCorrect
          ? question.correctAnswer
          : question.options.find((option) => option !== question.correctAnswer) || 'No answer';

        if (isCorrect) {
          correctAnswers += 1;
          marksObtained += question.marks;
        }

        return {
          questionId: question.questionId,
          selectedAnswer,
          isAnswered: true,
          isMarkedForReview: false,
          savedAt: submittedAt,
          isCorrect,
          marksAwarded: isCorrect ? question.marks : 0
        };
      });

      const totalMarks = questions.reduce((sum, question) => sum + question.marks, 0);

      await Attempt.create({
        examinationId: completedExam._id,
        studentId: student._id,
        answers,
        startedAt,
        deadlineAt: new Date(startedAt.getTime() + completedExam.duration * 60 * 1000),
        submittedAt,
        status: 'submitted',
        submissionType: 'manual',
        totalQuestions: questions.length,
        attemptedQuestions: questions.length,
        correctAnswers,
        incorrectAnswers: questions.length - correctAnswers,
        unansweredQuestions: 0,
        marksObtained,
        totalMarks,
        percentage: totalMarks > 0 ? Number(((marksObtained / totalMarks) * 100).toFixed(2)) : 0,
        resultStatus: marksObtained >= completedExam.passingMarks ? 'pass' : 'fail',
        evaluatedAt: submittedAt
      });

      console.log(
        `✅ Completed examination created: "${completedExam.title}" (${marksObtained}/${totalMarks}, ${
          marksObtained >= completedExam.passingMarks ? 'pass' : 'fail'
        })`
      );
    }

    const upcomingExamSpecs = [
      {
        title: 'Node.js Backend Engineering',
        description: 'Core modules and Express middleware behaviour.',
        subject: 'Node.js',
        questionIndexes: [8, 9],
        daysUntilStart: 2
      },
      {
        title: 'Data Structures & Algorithms',
        description: 'Search complexity and core data structures.',
        subject: 'DSA',
        questionIndexes: [10, 11],
        daysUntilStart: 5
      }
    ];

    for (const spec of upcomingExamSpecs) {
      const scheduledStart = new Date(Date.now() + spec.daysUntilStart * 24 * 60 * 60 * 1000);
      const scheduledEnd = new Date(scheduledStart.getTime() + 2 * 60 * 60 * 1000);
      const questions = spec.questionIndexes.map((questionIndex, index) => {
        const question = bankQuestions[questionIndex];
        return {
          questionId: question._id,
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options,
          correctAnswer: question.correctAnswer,
          acceptedAnswers: question.acceptedAnswers,
          marks: question.marks,
          negativeMarks: question.negativeMarks,
          explanation: question.explanation,
          order: index + 1
        };
      });

      const upcomingExam = await Examination.create({
        title: spec.title,
        description: spec.description,
        subject: spec.subject,
        instructions: 'Answer both questions. The examination is timed.',
        duration: 30,
        passingMarks: 2,
        negativeMarkingEnabled: false,
        shuffleQuestions: false,
        startTime: scheduledStart,
        endTime: scheduledEnd,
        assignedStudents: [],
        resultPublicationMode: 'manual',
        resultsPublished: false,
        status: 'scheduled',
        createdBy: teacher._id,
        questions
      });

      console.log(`✅ Upcoming examination created: "${upcomingExam.title}"`);
    }

    console.log('🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await disconnectDB();
  }
}

seed();
