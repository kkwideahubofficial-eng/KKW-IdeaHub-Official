# IdeaHub

Welcome to the **IdeaHub and SnapCart Ecosystem** repository! This monorepo houses multiple interconnected applications that power the IdeaHub platform and SnapCart logistics system.

## 📦 Project Structure

The repository is organized into the following core components:

- **IdeaHub Frontend (`/innovate-hub-core`)**: The main user interface built with React, Vite, and Tailwind CSS.
- **IdeaHub Backend (`/ideahub-backend`)**: The core API server built with Node.js, Express, and MongoDB.
- **SnapCart Socket Server (`/innovate-hub-core/snapcart/socket`)**: Real-time communication server for SnapCart operations.
- **SnapCart Driver App (`/innovate-hub-core/snapcart/frontend`)**: Dedicated frontend application for SnapCart drivers.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui, Zustand, React Query
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io, JWT Authentication
- **Real-time**: Socket.io for live updates
- **Tools**: Concurrently (for monorepo management)

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas URI)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd "IdeaHub New - Copy - Copy"
   ```

2. **Install all dependencies** across the monorepo:
   ```bash
   npm run install:all
   ```

3. **Set up Environment Variables**:
   You will need to create `.env` files in the respective directories (e.g., `ideahub-backend/.env` and `innovate-hub-core/.env`). *Make sure to check `.env.example` files if available.*

### Running the Application

You can start the entire ecosystem using the provided batch script for Windows:

```cmd
start_all.bat
```

Alternatively, you can run the primary IdeaHub frontend and backend using standard npm commands:

```bash
npm run dev
```

### 📡 Services & Ports

When running the full ecosystem locally, the services will be available at the following ports:

| Service | Local URL | Port |
|---------|-----------|------|
| **IdeaHub Frontend** | http://localhost:5173 | `5173` |
| **IdeaHub Backend** | http://localhost:5000 | `5000` |


## 📜 Available Scripts (Root Level)

- `npm run install:all`: Installs dependencies for all projects in the monorepo.
- `npm run dev`: Starts the IdeaHub frontend and backend concurrently.
- `npm run render-build`: Prepares the full build for deployment, copying the frontend dist into the backend public directory.

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/my-feature`)
2. Commit your changes (`git commit -m 'Add my feature'`)
3. Push to the branch (`git push origin feature/my-feature`)
4. Open a Pull Request
