# Forums App 📋

A custom forums application like Google Forms but better! Create custom forums, share links with people, and collect responses anonymously.

## Features ✨

- **User Authentication** - Sign up and login to create forums
- **Forum Creation** - Create custom forums with multiple question types
- **Question Types**:
  - Short Text
  - Long Text
  - Multiple Choice
  - Email
- **Anonymous Responses** - Anyone can fill out forms without logging in
- **Analytics Dashboard** - View all responses with beautiful stats
- **Share Links** - Get shareable links for each forum
- **Response Management** - View, analyze, and manage all submissions

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Database**: JSON files (easily upgradable to PostgreSQL/MongoDB)
- **Auth**: JWT + bcryptjs

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/devloentertainment/forums-app.git
cd forums-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the server**
```bash
npm start
```

4. **Open in browser**
```
http://localhost:3000
```

## Usage

### Create a Forum
1. Sign up with your email
2. Click "Create Forum"
3. Add title, description, and questions
4. Click "Create Forum"
5. Share the link with people

### Fill Out a Forum
1. Visit the shared forum link
2. Fill in your responses
3. Submit anonymously

### View Responses
1. Login to your account
2. Click "My Forums"
3. Click "View Responses" on any forum
4. See all submissions in the dashboard

## Project Structure

```
forums-app/
├── server.js              # Express backend
├── public/
│   ├── index.html        # Main HTML file
│   ├── styles.css        # All styling
│   └── app.js            # Frontend app logic
├── data/                 # JSON data files (auto-created)
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Forums
- `POST /api/forums` - Create forum (authenticated)
- `GET /api/forums` - List all forums
- `GET /api/forums/:id` - Get forum details (authenticated)
- `GET /api/my-forums` - Get user's forums (authenticated)
- `DELETE /api/forums/:id` - Delete forum (authenticated)

### Responses
- `POST /api/responses` - Submit forum response
- `GET /api/forums/:forumId/responses` - Get forum responses (authenticated)
- `GET /api/forums/:forumId/stats` - Get forum stats (authenticated)

## Next Steps / Upgrades

1. **Database** - Replace JSON files with PostgreSQL or MongoDB
2. **Email Notifications** - Email when new responses come in
3. **Export** - Export responses as CSV/Excel
4. **Advanced Analytics** - Charts, trends, filtering
5. **Question Logic** - Conditional questions based on answers
6. **Templates** - Pre-built forum templates
7. **Collaboration** - Share forum editing with team members

## Security Notes

- Change `SECRET_KEY` in `.env` for production
- Use HTTPS in production
- Add rate limiting to prevent spam
- Validate all user inputs
- Add CORS restrictions

## Troubleshooting

**Port already in use?**
```bash
PORT=3001 npm start
```

**Data not persisting?**
Check that `data/` folder has write permissions

**Auth not working?**
Clear browser cache and localStorage

## License

MIT - Feel free to use and modify!

---

Made with ❤️ for better forms
