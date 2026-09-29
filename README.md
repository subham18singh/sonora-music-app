# 🎵 Peacify (Sonora)

A full-stack music streaming web app. Listeners can stream songs and albums, artists can upload their own tracks and build albums, and everyone can **discover new songs live from the Jamendo API** and play them instantly, with nothing saved to the database.

---

## ✨ Features

- **Authentication**: register and log in with JWT stored in HTTP cookies; passwords hashed with bcrypt
- **Two roles**: *Listener* and *Artist*, with role-based access control
- **Music player**: play/pause, next/previous, seek bar, volume, mute, buffering state, and error toasts
- **Browse music and albums**: search songs and albums by title or artist
- **Artist studio** (artists only):
  - Upload audio files (with upload progress), stored on ImageKit
  - Create albums from uploaded tracks
- **Discover** (new): fetch songs live from the Jamendo API
  - Popular songs load automatically
  - Search by song or artist
  - Genre filters (pop, rock, lofi, electronic, jazz, hip-hop, classical, ambient, chill)
  - "Load more" button, plus endless autoplay when the queue ends
- **Responsive UI**: desktop sidebar and mobile bottom navigation

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JavaScript (ES modules), HTML, CSS |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Auth | JSON Web Tokens, cookie-parser, bcrypt |
| Validation | express-validator |
| File upload | Multer (memory storage), ImageKit |
| Music API | Jamendo API |

---

## 📁 Project Structure

```
peacify/
├── README.md
├── backend/
│   ├── .env                          # environment variables (never commit this)
│   ├── package.json
│   ├── server.js                     # entry point (port 3000)
│   └── src/
│       ├── app.js                    # Express app, CORS, static frontend, routes
│       ├── db/
│       │   └── db.js                 # MongoDB connection
│       ├── models/
│       │   ├── user.model.js
│       │   ├── music.model.js
│       │   └── album.model.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   └── music.controller.js   # upload, albums, list, discover
│       ├── routes/
│       │   ├── auth.routes.js
│       │   └── music.routes.js
│       ├── middlewares/
│       │   ├── auth.middleware.js    # authUser / authArtist
│       │   └── validate.middleware.js
│       ├── validators/
│       │   └── auth.validator.js
│       └── services/
│           ├── storage.services.js   # ImageKit upload
│           └── discover.service.js   # Jamendo API client
└── frontend/
    ├── index.html
    ├── style.css
    └── app.js                        # router, pages, player
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js 18 or newer** (the Discover feature uses the built-in `fetch`)
- A **MongoDB** database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- An **ImageKit** account, for artist uploads: [imagekit.io](https://imagekit.io)
- A free **Jamendo** client ID, for Discover: [devportal.jamendo.com](https://devportal.jamendo.com)

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret_string
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
JAMENDO_CLIENT_ID=your_jamendo_client_id
```

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign login tokens |
| `IMAGEKIT_PRIVATE_KEY` | Needed for artist song uploads |
| `JAMENDO_CLIENT_ID` | Needed for the Discover page |

> ⚠️ Never commit `.env` to Git. Add it to `.gitignore`.

### 3. Run the app

```bash
npm run singh
```

This runs `npx nodemon server.js`. The server starts on **http://localhost:3000** and also serves the frontend, so just open that URL in your browser.

---

## 🚀 Usage

1. Open `http://localhost:3000` and **create an account**. Choose *Listener* or *Artist*.
2. **Listeners** can:
   - Browse **Music** and **Albums**
   - Open **Discover** to stream songs from Jamendo
3. **Artists** also get a **Studio** page to upload tracks and create albums.
4. Click any song to play it in the bottom player.

---

## 🔌 API Reference

Base URL: `http://localhost:3000/api`

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create an account (`userName`, `email`, `password`, `role`) |
| POST | `/auth/login` | Log in with username or email and password |
| POST | `/auth/logout` | Log out (clears the cookie) |

### Music (login required)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/music` | User / Artist | List uploaded songs (first 10) |
| GET | `/music/discover?q=&tag=&page=` | User / Artist | Fetch songs live from Jamendo |
| GET | `/music/albums` | User / Artist | List all albums |
| GET | `/music/albums/:albumId` | User / Artist | Get one album with its songs |
| POST | `/music/upload` | Artist | Upload a song (`multipart/form-data`: `title`, `music`) |
| POST | `/music/album` | Artist | Create an album (`title`, `music`: array of song IDs) |

#### Discover query parameters

| Param | Description | Example |
|---|---|---|
| `q` | Search text (song or artist) | `q=love` |
| `tag` | Genre or tag | `tag=lofi` |
| `page` | Page number (20 songs per page) | `page=2` |

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| `JAMENDO_CLIENT_ID is missing` | Add the key to `backend/.env` and restart the server |
| Discover is empty or shows an error | Check that your Jamendo client ID is correct |
| `fetch is not defined` | Upgrade Node.js to version 18 or newer |
| Upload fails | Check `IMAGEKIT_PRIVATE_KEY` |
| Can't connect to the database | Check `MONGODB_URI` and your Atlas network access / IP whitelist |
| UI didn't update after changes | Hard refresh with `Ctrl + Shift + R` |

---

## 📌 Notes

- Songs from Discover are **streamed live** and are **not stored** in your database.
- Jamendo tracks are Creative Commons licensed. Check [Jamendo's terms](https://www.jamendo.com) if you plan to monetize.
- The `/music` endpoint returns only the first 10 uploaded songs (no pagination yet).

---

## 🗺️ Roadmap Ideas

- Pagination for uploaded songs
- Playlists and liked songs
- Save favourite Discover tracks to the user's library
- Cover-art upload for artists
- Shuffle and repeat modes

---

## 📄 License

ISC