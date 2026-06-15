// =====================
// STATE MANAGEMENT
// =====================

const state = {
  user: null,
  currentForm: null,
  forms: [],
  currentMode: 'dashboard', // dashboard, edit, preview, responses
  selectedQuestion: null,
  editHistory: [],
  editHistoryIndex: -1
};

const API_URL = 'http://localhost:3000/api';

// =====================
// INITIALIZATION
// =====================

function init() {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('userEmail');
  
  if (token && email) {
    state.user = { email };
    render();
  } else {
    render();
  }
}

// =====================
// RENDER ENGINE
// =====================

function render() {
  const app = document.getElementById('app');
  
  if (!state.user) {
    app.innerHTML = renderAuthScreen();
    attachAuthListeners();
  } else {
    app.innerHTML = renderMainApp();
    attachMainListeners();
  }
}

// =====================
// AUTH SCREENS
// =====================

function renderAuthScreen() {
  return `
    <div class="auth-wrapper">
      <div class="auth-container">
        <div class="auth-header">
          <h1>FormsHub</h1>
          <p>Create beautiful forms in minutes</p>
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="auth-email" placeholder="you@example.com">
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="auth-password" placeholder="••••••••">
        </div>
        
        <button class="btn btn-primary" id="btn-auth" onclick="handleAuth()">Login</button>
        <button class="btn btn-secondary" id="btn-toggle-auth" onclick="toggleAuthMode()">Create Account</button>
        
        <div class="auth-toggle">
          <p><span id="auth-toggle-text">Don't have an account?</span> <button id="auth-mode-btn">Sign Up</button></p>
        </div>
      </div>
    </div>
  `;
}

function toggleAuthMode() {
  const container = document.querySelector('.auth-container');
  const isLogin = container.querySelector('.auth-header h1').parentElement.querySelector('p').textContent === 'Create beautiful forms in minutes';
  
  if (isLogin) {
    container.querySelector('.auth-header h1').textContent = 'FormsHub';
    document.getElementById('btn-auth').textContent = 'Sign Up';
    document.getElementById('auth-toggle-text').textContent = 'Already have an account?';
    document.getElementById('auth-mode-btn').textContent = 'Login';
  } else {
    container.querySelector('.auth-header h1').textContent = 'FormsHub';
    document.getElementById('btn-auth').textContent = 'Login';
    document.getElementById('auth-toggle-text').textContent = "Don't have an account?";
    document.getElementById('auth-mode-btn').textContent = 'Sign Up';
  }
}

async function handleAuth() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const btn = document.getElementById('btn-auth');
  const isLogin = btn.textContent === 'Login';
  
  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }
  
  try {
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const res = await fetch(API_URL + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('userEmail', data.user.email);
    state.user = data.user;
    state.currentMode = 'dashboard';
    render();
  } catch (err) {
    alert((isLogin ? 'Login' : 'Registration') + ' failed: ' + err.message);
  }
}

// =====================
// MAIN APP LAYOUT
// =====================

function renderMainApp() {
  return `
    <div class="app-wrapper">
      ${renderSidebar()}
      <div class="main-content">
        ${renderTopbar()}
        <div class="content-area">
          <div class="workspace">
            ${renderContentArea()}
          </div>
          ${renderRightPanel()}
        </div>
      </div>
    </div>
  `;
}

function renderSidebar() {
  return `
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="logo">📋 FormsHub</div>
      </div>
      
      <nav class="sidebar-nav">
        <div class="nav-item ${state.currentMode === 'dashboard' ? 'active' : ''}" onclick="switchMode('dashboard')">
          <span>📊</span>
          <span>My Forms</span>
        </div>
        <div class="nav-item" onclick="createNewForm()">
          <span>➕</span>
          <span>New Form</span>
        </div>
      </nav>
      
      <div class="sidebar-footer">
        <div class="user-avatar">${state.user.email[0].toUpperCase()}</div>
        <div class="user-info">
          <div style="font-size: 13px; font-weight: 600; color: var(--neutral-900);">${state.user.email.split('@')[0]}</div>
          <div class="email">${state.user.email}</div>
        </div>
        <button class="btn-logout" onclick="handleLogout()">🚪</button>
      </div>
    </div>
  `;
}

function renderTopbar() {
  if (state.currentMode === 'dashboard') {
    return `
      <div class="topbar">
        <h2 style="font-size: 18px; font-weight: 600; color: var(--neutral-900);">My Forms</h2>
        <div class="topbar-spacer"></div>
        <div class="topbar-actions">
          <button class="btn-small primary" onclick="createNewForm()">+ Create Form</button>
        </div>
      </div>
    `;
  }
  
  if (state.currentMode === 'edit') {
    return `
      <div class="topbar">
        <div class="mode-tabs">
          <button class="mode-tab active" onclick="switchMode('edit')">✏️ Edit</button>
          <button class="mode-tab" onclick="switchMode('preview')">👁️ Preview</button>
          <button class="mode-tab" onclick="switchMode('responses')">📊 Responses</button>
        </div>
        <div class="topbar-spacer"></div>
        <div class="topbar-actions">
          <button class="btn-small secondary" onclick="switchMode('dashboard')">← Back</button>
          <button class="btn-small primary" onclick="shareForm()">🔗 Share</button>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="topbar">
      <div class="mode-tabs">
        <button class="mode-tab ${state.currentMode === 'edit' ? 'active' : ''}" onclick="switchMode('edit')">✏️ Edit</button>
        <button class="mode-tab ${state.currentMode === 'preview' ? 'active' : ''}" onclick="switchMode('preview')">👁️ Preview</button>
        <button class="mode-tab ${state.currentMode === 'responses' ? 'active' : ''}" onclick="switchMode('responses')">📊 Responses</button>
      </div>
      <div class="topbar-spacer"></div>
      <div class="topbar-actions">
        <button class="btn-small secondary" onclick="switchMode('dashboard')">← Back</button>
      </div>
    </div>
  `;
}

function renderContentArea() {
  switch (state.currentMode) {
    case 'dashboard':
      return renderDashboard();
    case 'edit':
      return renderEditMode();
    case 'preview':
      return renderPreviewMode();
    case 'responses':
      return renderResponsesMode();
    default:
      return '<div class="empty-state"><div class="empty-icon">?</div><div class="empty-title">Unknown Mode</div></div>';
  }
}

function renderRightPanel() {
  if (state.currentMode === 'edit' && state.selectedQuestion) {
    return `
      <div class="right-panel visible">
        ${renderPropertyPanel()}
      </div>
    `;
  }
  return '<div class="right-panel"></div>';
}

// =====================
// DASHBOARD MODE
// =====================

function renderDashboard() {
  if (state.forms.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-title">No forms yet</div>
        <div class="empty-text">Create your first form to get started</div>
        <button class="btn btn-primary" style="max-width: 200px; margin: 0 auto;" onclick="createNewForm()">Create Form</button>
      </div>
    `;
  }
  
  return `
    <div class="dashboard">
      ${state.forms.map(form => renderFormCard(form)).join('')}
    </div>
  `;
}

function renderFormCard(form) {
  const responseCount = 0; // Would come from API
  return `
    <div class="form-card">
      <div class="form-card-header">
        <div class="form-card-title">${escapeHtml(form.title)}</div>
        <div class="form-card-desc">${escapeHtml(form.description || 'No description')}</div>
      </div>
      
      <div class="form-card-stats">
        <div class="stat">
          <div class="stat-value">${form.questions.length}</div>
          <div class="stat-label">Questions</div>
        </div>
        <div class="stat">
          <div class="stat-value">${responseCount}</div>
          <div class="stat-label">Responses</div>
        </div>
        <div class="stat">
          <div class="stat-value">${new Date(form.createdAt).toLocaleDateString()}</div>
          <div class="stat-label">Created</div>
        </div>
      </div>
      
      <div class="form-card-actions">
        <button onclick="editForm('${form.id}')">Edit</button>
        <button onclick="shareForm('${form.id}')">Share</button>
        <button class="danger" onclick="deleteForm('${form.id}')">Delete</button>
      </div>
    </div>
  `;
}

// =====================
// EDIT MODE
// =====================

function renderEditMode() {
  if (!state.currentForm) {
    return '<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Form not found</div></div>';
  }
  
  return `
    <div class="builder-header">
      <div class="form-info">
        <input type="text" id="form-title" value="${escapeHtml(state.currentForm.title)}" placeholder="Form title">
        <textarea id="form-description" placeholder="Add a description (optional)..." rows="2">${escapeHtml(state.currentForm.description || '')}</textarea>
      </div>
    </div>
    
    <div class="builder-canvas" id="questions-canvas">
      ${renderQuestions()}
    </div>
    
    <div class="add-question-zone">
      <button class="add-question-btn" onclick="showAddQuestionMenu()">+ Add Question</button>
    </div>
    
    <div id="add-question-menu" class="hidden" style="margin-top: 20px; padding: 20px; background: white; border-radius: 12px;">
      ${renderQuestionTypeMenu()}
    </div>
  `;
}

function renderQuestions() {
  if (!state.currentForm.questions || state.currentForm.questions.length === 0) {
    return '';
  }
  
  return state.currentForm.questions.map((q, idx) => renderQuestionBlock(q, idx)).join('');
}

function renderQuestionBlock(question, index) {
  const isSelected = state.selectedQuestion?.id === question.id;
  
  return `
    <div class="question-block ${isSelected ? 'selected' : ''}" onclick="selectQuestion('${question.id}')" data-question-id="${question.id}" draggable="true">
      <div class="question-handle" style="cursor: grab;" onmousedown="startDrag(event)"></div>
      
      <div class="question-content">
        <div class="question-label">${getQuestionTypeLabel(question.type)}</div>
        <div class="question-title" contenteditable="true" onclick="event.stopPropagation()" onblur="updateQuestionTitle(event, '${question.id}')" onkeydown="handleKeydown(event)">${escapeHtml(question.text)}</div>
        
        <div class="question-preview" style="margin-top: 12px;">
          ${renderQuestionPreview(question)}
        </div>
        
        <div class="question-actions">
          <button class="action-btn" title="Duplicate" onclick="duplicateQuestion('${question.id}')">📋</button>
          <button class="action-btn danger" title="Delete" onclick="deleteQuestion('${question.id}')">🗑️</button>
        </div>
      </div>
    </div>
  `;
}

function renderQuestionPreview(question) {
  switch (question.type) {
    case 'short':
      return '<input type="text" class="preview-input" placeholder="Short answer text" disabled>';
    case 'long':
      return '<textarea class="preview-input" placeholder="Long answer text" disabled rows="3"></textarea>';
    case 'multiple':
      return (question.options || []).map(opt => `
        <label class="preview-option">
          <input type="radio" name="q-${question.id}" disabled>
          <span>${escapeHtml(opt)}</span>
        </label>
      `).join('');
    case 'checkbox':
      return (question.options || []).map(opt => `
        <label class="preview-option">
          <input type="checkbox" disabled>
          <span>${escapeHtml(opt)}</span>
        </label>
      `).join('');
    case 'rating':
      return `
        <div class="preview-options" style="flex-direction: row; gap: 4px;">
          ${[1, 2, 3, 4, 5].map(i => `<button style="flex: 1; padding: 8px; border: 1px solid var(--neutral-200); background: white; border-radius: 4px; cursor: pointer;">⭐</button>`).join('')}
        </div>
      `;
    case 'slider':
      return '<input type="range" min="0" max="100" style="width: 100%;" disabled>';
    case 'date':
      return '<input type="date" class="preview-input" disabled>';
    case 'email':
      return '<input type="email" class="preview-input" placeholder="email@example.com" disabled>';
    default:
      return '<div class="text-sm text-neutral-600">Question preview</div>';
  }
}

function renderQuestionTypeMenu() {
  const types = [
    { id: 'short', label: 'Short Text', icon: '📝' },
    { id: 'long', label: 'Long Text', icon: '📄' },
    { id: 'multiple', label: 'Multiple Choice', icon: '🔘' },
    { id: 'checkbox', label: 'Checkboxes', icon: '☑️' },
    { id: 'dropdown', label: 'Dropdown', icon: '▼' },
    { id: 'rating', label: 'Rating', icon: '⭐' },
    { id: 'slider', label: 'Slider', icon: '📊' },
    { id: 'date', label: 'Date', icon: '📅' },
    { id: 'email', label: 'Email', icon: '✉️' },
    { id: 'ranking', label: 'Ranking', icon: '🏆' }
  ];
  
  return `
    <div class="question-type-menu">
      ${types.map(t => `
        <div class="type-card" onclick="addQuestion('${t.id}'); this.closest('#add-question-menu').classList.add('hidden');" style="cursor: pointer;">
          <div class="type-icon">${t.icon}</div>
          <div class="type-name">${t.label}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderPropertyPanel() {
  if (!state.selectedQuestion) return '';
  
  const q = state.selectedQuestion;
  
  return `
    <div class="panel-section">
      <div class="panel-title">Question Settings</div>
      
      <div class="input-group">
        <label>Question Text</label>
        <textarea id="prop-text" onchange="updateQuestion('text', this.value)" rows="2">${escapeHtml(q.text)}</textarea>
      </div>
      
      <div class="input-group">
        <label>Description</label>
        <textarea id="prop-description" onchange="updateQuestion('description', this.value)" rows="2" placeholder="Add a description...">${escapeHtml(q.description || '')}</textarea>
      </div>
    </div>
    
    <div class="panel-section">
      <div class="panel-title">Options</div>
      
      <div class="checkbox-group">
        <input type="checkbox" id="prop-required" ${q.required ? 'checked' : ''} onchange="updateQuestion('required', this.checked)">
        <label for="prop-required">Required</label>
      </div>
    </div>
    
    ${renderQuestionTypeSettings(q)}
  `;
}

function renderQuestionTypeSettings(question) {
  if (['multiple', 'checkbox', 'dropdown', 'ranking'].includes(question.type)) {
    return `
      <div class="panel-section">
        <div class="panel-title">Answer Options</div>
        <div id="options-editor">
          ${(question.options || []).map((opt, idx) => `
            <div class="input-group" style="display: flex; gap: 8px; margin-bottom: 8px;">
              <input type="text" value="${escapeHtml(opt)}" placeholder="Option ${idx + 1}" style="flex: 1;" onchange="updateQuestionOption(${idx}, this.value)">
              <button class="action-btn danger" style="width: 32px;" onclick="removeQuestionOption(${idx})">🗑️</button>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-secondary" style="width: 100%;" onclick="addQuestionOption()">+ Add Option</button>
      </div>
    `;
  }
  return '';
}

// =====================
// PREVIEW MODE
// =====================

function renderPreviewMode() {
  if (!state.currentForm) return '';
  
  return `
    <div class="preview-wrapper">
      <div class="preview-container">
        <div class="preview-header">
          <div class="preview-title">${escapeHtml(state.currentForm.title)}</div>
          <div class="preview-description">${escapeHtml(state.currentForm.description || '')}</div>
        </div>
        
        <form id="preview-form" onsubmit="submitPreviewForm(event)">
          ${state.currentForm.questions.map((q, idx) => renderPreviewQuestion(q, idx)).join('')}
          <button type="submit" class="submit-btn">Submit</button>
        </form>
      </div>
    </div>
  `;
}

function renderPreviewQuestion(question, index) {
  const required = question.required ? ' <span class="required-indicator">*</span>' : '';
  
  let inputHtml = '';
  
  switch (question.type) {
    case 'short':
      inputHtml = `<input type="text" name="q-${question.id}" class="preview-input" placeholder="Answer..." ${question.required ? 'required' : ''}>`;
      break;
    case 'long':
      inputHtml = `<textarea name="q-${question.id}" class="preview-input" placeholder="Answer..." rows="4" ${question.required ? 'required' : ''}></textarea>`;
      break;
    case 'multiple':
      inputHtml = `<div class="preview-options">${(question.options || []).map(opt => `
        <label class="preview-option">
          <input type="radio" name="q-${question.id}" value="${escapeHtml(opt)}" ${question.required ? 'required' : ''}>
          <span>${escapeHtml(opt)}</span>
        </label>
      `).join('')}</div>`;
      break;
    case 'checkbox':
      inputHtml = `<div class="preview-options">${(question.options || []).map(opt => `
        <label class="preview-option">
          <input type="checkbox" name="q-${question.id}" value="${escapeHtml(opt)}">
          <span>${escapeHtml(opt)}</span>
        </label>
      `).join('')}</div>`;
      break;
    case 'rating':
      inputHtml = `<div class="preview-options" style="flex-direction: row;">${[1, 2, 3, 4, 5].map(i => `
        <label class="preview-option" style="flex: 1; margin: 0;">
          <input type="radio" name="q-${question.id}" value="${i}" ${question.required ? 'required' : ''}>
          <span>⭐</span>
        </label>
      `).join('')}</div>`;
      break;
    case 'date':
      inputHtml = `<input type="date" name="q-${question.id}" class="preview-input" ${question.required ? 'required' : ''}>`;
      break;
    case 'email':
      inputHtml = `<input type="email" name="q-${question.id}" class="preview-input" placeholder="email@example.com" ${question.required ? 'required' : ''}>`;
      break;
    default:
      inputHtml = `<input type="text" name="q-${question.id}" class="preview-input" ${question.required ? 'required' : ''}>`;
  }
  
  return `
    <div class="preview-question">
      <div class="preview-label">
        ${escapeHtml(question.text)}
        ${required}
      </div>
      ${question.description ? `<div style="font-size: 13px; color: var(--neutral-600); margin-bottom: 8px;">${escapeHtml(question.description)}</div>` : ''}
      ${inputHtml}
    </div>
  `;
}

// =====================
// RESPONSES MODE
// =====================

function renderResponsesMode() {
  if (!state.currentForm) return '';
  
  return `
    <div class="responses-header">
      <h2>${escapeHtml(state.currentForm.title)}</h2>
      <p>Responses & Analytics</p>
    </div>
    
    <div class="stats-container">
      <div class="stat-box">
        <div class="stat-box-value">0</div>
        <div class="stat-box-label">Total Responses</div>
      </div>
      <div class="stat-box">
        <div class="stat-box-value">0%</div>
        <div class="stat-box-label">Completion Rate</div>
      </div>
    </div>
    
    <div class="responses-list">
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-title">No responses yet</div>
        <div class="empty-text">Share your form to start collecting responses</div>
      </div>
    </div>
  `;
}

// =====================
// HELPER FUNCTIONS
// =====================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getQuestionTypeLabel(type) {
  const labels = {
    'short': 'Short Text',
    'long': 'Long Text',
    'multiple': 'Multiple Choice',
    'checkbox': 'Checkboxes',
    'dropdown': 'Dropdown',
    'rating': 'Rating',
    'slider': 'Slider',
    'date': 'Date',
    'email': 'Email',
    'ranking': 'Ranking'
  };
  return labels[type] || type;
}

function handleKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.target.blur();
  }
}

function updateQuestionTitle(event, questionId) {
  const newText = event.target.textContent;
  const question = state.currentForm.questions.find(q => q.id === questionId);
  if (question) {
    question.text = newText;
    if (state.selectedQuestion?.id === questionId) {
      state.selectedQuestion.text = newText;
    }
    saveFormToDraft();
  }
}

function updateQuestion(field, value) {
  if (state.selectedQuestion) {
    state.selectedQuestion[field] = value;
    saveFormToDraft();
    render(); // Refresh to update property panel
  }
}

function updateQuestionOption(index, value) {
  if (state.selectedQuestion) {
    state.selectedQuestion.options = state.selectedQuestion.options || [];
    state.selectedQuestion.options[index] = value;
    saveFormToDraft();
  }
}

function addQuestionOption() {
  if (state.selectedQuestion) {
    state.selectedQuestion.options = state.selectedQuestion.options || [];
    state.selectedQuestion.options.push('New option');
    saveFormToDraft();
    render();
  }
}

function removeQuestionOption(index) {
  if (state.selectedQuestion) {
    state.selectedQuestion.options.splice(index, 1);
    saveFormToDraft();
    render();
  }
}

function saveFormToDraft() {
  // Auto-save to backend
  if (state.currentForm && state.currentForm.id) {
    const formData = {
      title: document.getElementById('form-title')?.value || state.currentForm.title,
      description: document.getElementById('form-description')?.value || state.currentForm.description,
      questions: state.currentForm.questions,
      settings: state.currentForm.settings
    };
    
    // Debounced save
    clearTimeout(saveFormToDraft.timeout);
    saveFormToDraft.timeout = setTimeout(() => {
      fetch(`${API_URL}/forums/${state.currentForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      }).catch(err => console.error('Auto-save failed:', err));
    }, 1000);
  }
}

// =====================
// FORM OPERATIONS
// =====================

async function createNewForm() {
  const title = prompt('Form title:') || 'Untitled Form';
  
  try {
    const res = await fetch(API_URL + '/forums', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        title,
        description: '',
        questions: [{ id: uuidv4(), text: 'Question 1', type: 'short', required: false, options: [] }],
        settings: { showProgressBar: true, accentColor: '#667eea' }
      })
    });
    
    const form = await res.json();
    state.currentForm = form;
    state.currentMode = 'edit';
    state.selectedQuestion = form.questions[0];
    await loadForms();
    render();
  } catch (err) {
    alert('Error creating form: ' + err.message);
  }
}

async function editForm(formId) {
  try {
    const res = await fetch(`${API_URL}/forums/${formId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    state.currentForm = await res.json();
    state.currentMode = 'edit';
    state.selectedQuestion = state.currentForm.questions?.[0] || null;
    render();
  } catch (err) {
    alert('Error loading form: ' + err.message);
  }
}

async function deleteForm(formId) {
  if (!confirm('Delete this form? This cannot be undone.')) return;
  
  try {
    await fetch(`${API_URL}/forums/${formId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    await loadForms();
    render();
  } catch (err) {
    alert('Error deleting form: ' + err.message);
  }
}

async function loadForms() {
  try {
    const res = await fetch(API_URL + '/my-forums', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    state.forms = await res.json();
  } catch (err) {
    console.error('Error loading forms:', err);
  }
}

function shareForm(formId) {
  const id = formId || state.currentForm?.id;
  const link = `${window.location.origin}/fill/${id}`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link);
    alert('Form link copied to clipboard!');
  } else {
    alert(`Share this link: ${link}`);
  }
}

// =====================
// MODE SWITCHING
// =====================

function switchMode(mode) {
  state.currentMode = mode;
  state.selectedQuestion = null;
  render();
}

function selectQuestion(questionId) {
  const question = state.currentForm.questions.find(q => q.id === questionId);
  if (question) {
    state.selectedQuestion = question;
    render();
  }
}

function showAddQuestionMenu() {
  const menu = document.getElementById('add-question-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

async function addQuestion(type) {
  const newQuestion = {
    id: uuidv4(),
    text: `New ${getQuestionTypeLabel(type)}`,
    type,
    required: false,
    description: '',
    options: ['multiple', 'checkbox', 'dropdown', 'ranking'].includes(type) ? ['Option 1', 'Option 2'] : []
  };
  
  state.currentForm.questions.push(newQuestion);
  state.selectedQuestion = newQuestion;
  saveFormToDraft();
  render();
}

function duplicateQuestion(questionId) {
  const question = state.currentForm.questions.find(q => q.id === questionId);
  if (question) {
    const duplicate = { ...question, id: uuidv4() };
    const index = state.currentForm.questions.indexOf(question);
    state.currentForm.questions.splice(index + 1, 0, duplicate);
    state.selectedQuestion = duplicate;
    saveFormToDraft();
    render();
  }
}

function deleteQuestion(questionId) {
  const index = state.currentForm.questions.findIndex(q => q.id === questionId);
  if (index > -1) {
    state.currentForm.questions.splice(index, 1);
    state.selectedQuestion = null;
    saveFormToDraft();
    render();
  }
}

function startDrag(e) {
  e.stopPropagation();
}

function submitPreviewForm(e) {
  e.preventDefault();
  alert('Form submitted! (In a real app, this would save the response)');
}

function handleLogout() {
  if (confirm('Logout?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    state.user = null;
    state.currentForm = null;
    state.currentMode = 'dashboard';
    render();
  }
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// =====================
// EVENT LISTENERS
// =====================

function attachAuthListeners() {
  document.getElementById('auth-password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAuth();
  });
}

function attachMainListeners() {
  // Auto-save form title and description
  const titleInput = document.getElementById('form-title');
  const descInput = document.getElementById('form-description');
  
  if (titleInput) {
    titleInput.addEventListener('blur', () => saveFormToDraft());
  }
  if (descInput) {
    descInput.addEventListener('blur', () => saveFormToDraft());
  }
}

// =====================
// INITIALIZATION
// =====================

// Load forms on startup
async function startup() {
  await loadForms();
  init();
}

startup();
