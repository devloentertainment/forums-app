const state = {
  user: null,
  currentForum: null,
  forums: []
};

const API_URL = 'http://localhost:3000/api';

const app = document.getElementById('app');

function render() {
  if (!state.user) {
    renderAuthScreen();
  } else {
    renderMainApp();
  }
}

function renderAuthScreen() {
  const isLogin = true;
  app.innerHTML = `
    <div class="auth-container">
      <h2>${isLogin ? 'Login' : 'Sign Up'}</h2>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="email" placeholder="your@email.com">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="password" placeholder="••••••••">
      </div>
      <button onclick="handleLogin()">Login</button>
      <button onclick="handleRegister()" style="background: #ccc; color: #333; margin-top: 10px;">Create Account</button>
      <div class="auth-toggle">
        <p>Don't have an account? <button onclick="toggleAuthMode()">Sign Up</button></p>
      </div>
    </div>
  `;
}

function renderMainApp() {
  app.innerHTML = `
    <nav>
      <div class="container">
        <h1>📋 Forums</h1>
        <div class="nav-links">
          <a href="#" onclick="showScreen('home')">Home</a>
          <a href="#" onclick="showScreen('my-forums')">My Forums</a>
          <span style="color: #999;">| ${state.user.email}</span>
          <button onclick="handleLogout()">Logout</button>
        </div>
      </div>
    </nav>

    <div class="container">
      <div id="home-screen" class="screen active">
        ${renderHomeScreen()}
      </div>
      <div id="my-forums-screen" class="screen">
        ${renderMyForumsScreen()}
      </div>
      <div id="create-forum-screen" class="screen">
        ${renderCreateForumScreen()}
      </div>
      <div id="view-forum-screen" class="screen">
        ${renderViewForumScreen()}
      </div>
    </div>
  `;

  attachEventListeners();
}

function renderHomeScreen() {
  return `
    <div class="home-screen">
      <h2>Welcome to Forums! 📝</h2>
      <p>Create custom forms and collect responses from anyone</p>
      <div class="home-buttons">
        <button onclick="showScreen('create-forum')">+ Create Forum</button>
        <button onclick="showScreen('my-forums')" style="background: #764ba2;">View My Forums</button>
      </div>
    </div>
  `;
}

function renderMyForumsScreen() {
  return `
    <div>
      <h2 style="color: white; margin-bottom: 30px;">My Forums</h2>
      <div id="forums-list" class="dashboard">
        <div class="spinner"></div>
      </div>
    </div>
  `;
}

function renderCreateForumScreen() {
  return `
    <form class="create-forum-form" onsubmit="handleCreateForum(event)">
      <h2>Create New Forum</h2>
      <div class="form-group">
        <label>Forum Title</label>
        <input type="text" id="forum-title" placeholder="e.g., Customer Feedback" required>
      </div>
      <div class="form-group">
        <label>Description (optional)</label>
        <textarea id="forum-description" placeholder="Tell people what this forum is about" style="min-height: 80px; width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"></textarea>
      </div>

      <div class="questions-container">
        <h3 style="color: #667eea; margin-bottom: 20px;">Questions</h3>
        <div id="questions-list"></div>
        <button type="button" class="add-question-btn" onclick="addQuestion()">+ Add Question</button>
      </div>

      <button type="submit" class="submit-forum-btn">Create Forum</button>
    </form>
  `;
}

function renderViewForumScreen() {
  if (!state.currentForum) return '';
  
  return `
    <div style="max-width: 900px; margin: 30px auto;">
      <div class="analytics-header">
        <h2>${state.currentForum.title}</h2>
        <p>${state.currentForum.description || 'No description'}</p>
        
        <div style="margin-top: 20px; margin-bottom: 20px;">
          <strong>Share Link:</strong>
          <div class="copy-link-container">
            <input type="text" readonly value="http://localhost:3000/fill/${state.currentForum.id}">
            <button type="button" onclick="copyToClipboard('http://localhost:3000/fill/${state.currentForum.id}')">Copy</button>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <h3 id="response-count">0</h3>
            <p>Total Responses</p>
          </div>
          <div class="stat-card">
            <h3 id="question-count">${state.currentForum.questions.length}</h3>
            <p>Questions</p>
          </div>
        </div>

        <button onclick="deleteForum('${state.currentForum.id}')" style="background: #e74c3c; margin-top: 20px;">Delete Forum</button>
        <button onclick="showScreen('my-forums')" style="background: #ccc; color: #333; margin-top: 20px; margin-left: 10px;">Back</button>
      </div>

      <div style="margin-top: 30px;">
        <h3 style="color: white; margin-bottom: 20px;">Responses</h3>
        <div id="responses-container" class="responses-list">
          <div class="spinner"></div>
        </div>
      </div>
    </div>
  `;
}

async function handleLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    localStorage.setItem('token', data.token);
    state.user = data.user;
    render();
  } catch (err) {
    alert('Login failed: ' + err.message);
  }
}

async function handleRegister() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    localStorage.setItem('token', data.token);
    state.user = data.user;
    render();
  } catch (err) {
    alert('Registration failed: ' + err.message);
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  state.user = null;
  render();
}

function addQuestion() {
  const list = document.getElementById('questions-list');
  const questionId = Date.now();
  const questionEl = document.createElement('div');
  questionEl.className = 'question-item';
  questionEl.innerHTML = `
    <input type="text" placeholder="Question text" class="question-text" required>
    <select class="question-type" required>
      <option value="">Select Type</option>
      <option value="short">Short Text</option>
      <option value="long">Long Text</option>
      <option value="multiple">Multiple Choice</option>
      <option value="email">Email</option>
    </select>
    <input type="text" class="question-options" placeholder="Options (comma-separated, for multiple choice only)" style="display: none;">
    <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remove</button>
  `;

  const select = questionEl.querySelector('.question-type');
  const optionsInput = questionEl.querySelector('.question-options');
  
  select.addEventListener('change', () => {
    optionsInput.style.display = select.value === 'multiple' ? 'block' : 'none';
  });

  list.appendChild(questionEl);
}

async function handleCreateForum(e) {
  e.preventDefault();
  
  const title = document.getElementById('forum-title').value;
  const description = document.getElementById('forum-description').value;
  const questionElements = document.querySelectorAll('.question-item');
  
  const questions = Array.from(questionElements).map(el => {
    const type = el.querySelector('.question-type').value;
    const text = el.querySelector('.question-text').value;
    const options = el.querySelector('.question-options').value;
    
    return {
      text,
      type,
      options: type === 'multiple' ? options.split(',').map(o => o.trim()) : []
    };
  });

  if (questions.length === 0) {
    alert('Add at least one question');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/forums`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ title, description, questions })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    alert('Forum created! Share the link with people to collect responses.');
    showScreen('my-forums');
    loadMyForums();
  } catch (err) {
    alert('Error creating forum: ' + err.message);
  }
}

async function loadMyForums() {
  try {
    const res = await fetch(`${API_URL}/my-forums`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const forums = await res.json();
    state.forums = forums;

    const list = document.getElementById('forums-list');
    if (forums.length === 0) {
      list.innerHTML = '<p style="text-align: center; color: white; grid-column: 1/-1;">No forums yet. Create one to get started!</p>';
      return;
    }

    list.innerHTML = forums.map(forum => `
      <div class="forum-card">
        <h3>${forum.title}</h3>
        <p>${forum.description || 'No description'}</p>
        <div class="forum-stats">
          <span>Questions: ${forum.questions.length}</span>
          <span>Created: ${new Date(forum.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="forum-actions">
          <button onclick="viewForum('${forum.id}')">View Responses</button>
          <button onclick="deleteForum('${forum.id}')" style="background: #e74c3c;">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading forums:', err);
  }
}

async function viewForum(forumId) {
  try {
    const res = await fetch(`${API_URL}/forums/${forumId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const forum = await res.json();
    if (!res.ok) throw new Error(forum.error);

    state.currentForum = forum;
    showScreen('view-forum');
    loadForumResponses(forumId);
  } catch (err) {
    alert('Error loading forum: ' + err.message);
  }
}

async function loadForumResponses(forumId) {
  try {
    const res = await fetch(`${API_URL}/forums/${forumId}/responses`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const responses = await res.json();
    document.getElementById('response-count').textContent = responses.length;

    const container = document.getElementById('responses-container');
    if (responses.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No responses yet</p>';
      return;
    }

    container.innerHTML = responses.map(response => `
      <div class="response-item">
        <div class="response-header">
          <span>Submitted: ${new Date(response.submittedAt).toLocaleString()}</span>
        </div>
        <div class="response-answers">
          ${response.answers.map((answer, idx) => `
            <div class="answer">
              <div class="answer-question">${state.currentForum.questions[idx]?.text || 'Question'}</div>
              <div class="answer-content">${answer}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading responses:', err);
  }
}

async function deleteForum(forumId) {
  if (!confirm('Are you sure you want to delete this forum?')) return;

  try {
    const res = await fetch(`${API_URL}/forums/${forumId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (!res.ok) throw new Error('Failed to delete');

    alert('Forum deleted');
    loadMyForums();
    showScreen('my-forums');
  } catch (err) {
    alert('Error deleting forum: ' + err.message);
  }
}

function showScreen(screenName) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`${screenName}-screen`).classList.add('active');

  if (screenName === 'my-forums') {
    loadMyForums();
  }
}

function attachEventListeners() {
  if (!document.querySelector('.question-item')) {
    addQuestion();
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Link copied to clipboard!');
  });
}

function toggleAuthMode() {
  const authContainer = document.querySelector('.auth-container');
  const h2 = authContainer.querySelector('h2');
  const toggleBtn = authContainer.querySelector('.auth-toggle button');
  
  if (h2.textContent === 'Login') {
    h2.textContent = 'Sign Up';
    toggleBtn.textContent = 'Login';
    authContainer.querySelector('button').textContent = 'Sign Up';
  } else {
    h2.textContent = 'Login';
    toggleBtn.textContent = 'Sign Up';
    authContainer.querySelector('button').textContent = 'Login';
  }
}

function init() {
  const token = localStorage.getItem('token');
  if (token) {
    state.user = { email: 'user@example.com' };
  }
  render();
}

init();
