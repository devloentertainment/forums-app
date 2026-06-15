const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your-secret-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Data storage
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const FORUMS_FILE = path.join(DATA_DIR, 'forums.json');
const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json');

// Initialize data files
const initializeDataFiles = () => {
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  if (!fs.existsSync(FORUMS_FILE)) fs.writeFileSync(FORUMS_FILE, JSON.stringify([]));
  if (!fs.existsSync(RESPONSES_FILE)) fs.writeFileSync(RESPONSES_FILE, JSON.stringify([]));
};

initializeDataFiles();

// Helper functions
const readData = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeData = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  });
};

// AUTH ROUTES
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  let users = readData(USERS_FILE);
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = {
    id: uuidv4(),
    email,
    password: hashedPassword,
    createdAt: new Date()
  };

  users.push(user);
  writeData(USERS_FILE, users);

  const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY);
  res.json({ token, user: { id: user.id, email: user.email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const users = readData(USERS_FILE);
  const user = users.find(u => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY);
  res.json({ token, user: { id: user.id, email: user.email } });
});

// FORUM ROUTES
app.post('/api/forums', verifyToken, (req, res) => {
  const { title, description, questions, settings } = req.body;

  if (!title || !questions || questions.length === 0) {
    return res.status(400).json({ error: 'Title and questions required' });
  }

  const forum = {
    id: uuidv4(),
    creatorId: req.userId,
    creatorEmail: req.email,
    title,
    description: description || '',
    questions: questions.map(q => ({
      id: q.id || uuidv4(),
      ...q
    })),
    settings: settings || {
      showProgressBar: true,
      oneQuestionPerPage: false,
      randomizeOrder: false,
      accentColor: '#667eea'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  let forums = readData(FORUMS_FILE);
  forums.push(forum);
  writeData(FORUMS_FILE, forums);

  res.json(forum);
});

app.get('/api/forums/:id', verifyToken, (req, res) => {
  const forums = readData(FORUMS_FILE);
  const forum = forums.find(f => f.id === req.params.id && f.creatorId === req.userId);

  if (!forum) {
    return res.status(404).json({ error: 'Forum not found' });
  }

  res.json(forum);
});

app.put('/api/forums/:id', verifyToken, (req, res) => {
  let forums = readData(FORUMS_FILE);
  const forumIndex = forums.findIndex(f => f.id === req.params.id && f.creatorId === req.userId);

  if (forumIndex === -1) {
    return res.status(404).json({ error: 'Forum not found' });
  }

  const updated = {
    ...forums[forumIndex],
    ...req.body,
    updatedAt: new Date()
  };

  forums[forumIndex] = updated;
  writeData(FORUMS_FILE, forums);

  res.json(updated);
});

app.get('/api/my-forums', verifyToken, (req, res) => {
  const forums = readData(FORUMS_FILE);
  const userForums = forums.filter(f => f.creatorId === req.userId);
  res.json(userForums);
});

app.get('/api/forums', (req, res) => {
  const forums = readData(FORUMS_FILE);
  res.json(forums.map(f => ({
    id: f.id,
    title: f.title,
    description: f.description,
    createdAt: f.createdAt,
    questionCount: f.questions.length
  })));
});

app.delete('/api/forums/:id', verifyToken, (req, res) => {
  let forums = readData(FORUMS_FILE);
  const forumIndex = forums.findIndex(f => f.id === req.params.id && f.creatorId === req.userId);

  if (forumIndex === -1) {
    return res.status(404).json({ error: 'Forum not found' });
  }

  forums.splice(forumIndex, 1);
  writeData(FORUMS_FILE, forums);

  res.json({ message: 'Forum deleted' });
});

// RESPONSES ROUTES
app.post('/api/responses', (req, res) => {
  const { forumId, answers } = req.body;

  if (!forumId || !answers) {
    return res.status(400).json({ error: 'Forum ID and answers required' });
  }

  const forums = readData(FORUMS_FILE);
  const forum = forums.find(f => f.id === forumId);

  if (!forum) {
    return res.status(404).json({ error: 'Forum not found' });
  }

  const response = {
    id: uuidv4(),
    forumId,
    answers,
    submittedAt: new Date(),
    ipHash: req.ip
  };

  let responses = readData(RESPONSES_FILE);
  responses.push(response);
  writeData(RESPONSES_FILE, responses);

  res.json(response);
});

app.get('/api/forums/:forumId/responses', verifyToken, (req, res) => {
  const forums = readData(FORUMS_FILE);
  const forum = forums.find(f => f.id === req.params.forumId && f.creatorId === req.userId);

  if (!forum) {
    return res.status(404).json({ error: 'Forum not found' });
  }

  const responses = readData(RESPONSES_FILE);
  const forumResponses = responses.filter(r => r.forumId === req.params.forumId);

  res.json(forumResponses);
});

app.get('/api/forums/:forumId/stats', verifyToken, (req, res) => {
  const forums = readData(FORUMS_FILE);
  const forum = forums.find(f => f.id === req.params.forumId && f.creatorId === req.userId);

  if (!forum) {
    return res.status(404).json({ error: 'Forum not found' });
  }

  const responses = readData(RESPONSES_FILE);
  const forumResponses = responses.filter(r => r.forumId === req.params.forumId);

  res.json({
    totalResponses: forumResponses.length,
    completionRate: forumResponses.length > 0 ? 100 : 0,
    lastResponse: forumResponses[forumResponses.length - 1]?.submittedAt || null
  });
});

// Serve index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Forums app running on http://localhost:${PORT}`);
});
