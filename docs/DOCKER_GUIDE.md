# Docker for Humans 🐳

## What is Docker? (30 Second Version)

Docker is like a **shipping container for software**. Just like shipping containers let you pack anything and ship it anywhere in the world, Docker lets you pack your app and run it anywhere.

```
Without Docker:          With Docker:
┌──────────────┐        ┌──────────────┐
│  "Works on   │        │  Works the   │
│  MY machine" │   →    │  SAME        │
│  😤          │        │  everywhere  │
└──────────────┘        └──────────────┘
```

---

## Docker Desktop Sidebar Explained

Based on your screenshot, here's what each item does:

### Core Items (What You'll Use)

| Icon | Name | What It Is |
|------|------|------------|
| 📦 | **Containers** | Running apps. Like "Programs Currently Running" |
| 🖼️ | **Images** | Blueprints for apps. Like "Downloaded Apps" ready to run |
| 💾 | **Volumes** | Persistent storage. Like "Saved Data" that survives restarts |
| 🔧 | **Builds** | Creating new images. Like "Compiling Code" |

### Advanced Items (You Probably Won't Need)

| Icon | Name | What It Is |
|------|------|------------|
| ☸️ | **Kubernetes** | For running many containers at scale (enterprise stuff) |
| 🤖 | **Models** | AI/ML model hosting (new Docker feature) |
| 🔌 | **MCP Toolkit** | Tools for AI assistants to use Docker |
| 🌐 | **Docker Hub** | Like "App Store" for Docker images |
| 🔍 | **Docker Scout** | Security scanning for images |
| 🧩 | **Extensions** | Add-ons for Docker Desktop |
| ✨ | **Ask Gordon** | AI assistant for Docker (their version of ChatGPT) |

---

## The 4 Key Concepts

### 1. 🖼️ Image

A **snapshot** of an app and everything it needs. Like a `.dmg` installer file.

```bash
# Download an image
docker pull node:20

# See your images
docker images
```

### 2. 📦 Container

A **running instance** of an image. Like having the app open and running.

```bash
# Run a container
docker run node:20

# See running containers
docker ps
```

### 3. 💾 Volume

**Persistent storage** that survives when containers stop. Like a USB drive.

```bash
# Create a volume
docker volume create my-data

# Use it in a container
docker run -v my-data:/app/data node:20
```

### 4. 📄 Dockerfile

**Recipe** for building an image. Like a Makefile or build script.

```dockerfile
FROM node:20
COPY . /app
RUN npm install
CMD ["npm", "start"]
```

---

## The Flow

```
Dockerfile     →    Image       →    Container
(recipe)            (blueprint)      (running app)
                         ↓
                    Volume
                    (saved data)
```

---

## Commands You'll Actually Use

```bash
# Clean EVERYTHING (what we just did)
docker system prune -a --volumes -f

# Start containers from docker-compose.yml
docker compose up -d

# Stop everything
docker compose down

# See what's running
docker ps

# See logs
docker logs <container-name>

# Get a shell inside a container
docker exec -it <container-name> sh
```

---

## For This Project

```bash
./sandbox.sh start     # Start the testing sandbox
./sandbox.sh explore   # Run browser tests
./sandbox.sh stop      # Stop everything
```

---

## TL;DR

| Term | Plain English |
|------|---------------|
| **Image** | App installer/blueprint |
| **Container** | Running app |
| **Volume** | Saved files |
| **Dockerfile** | Build instructions |
| **Docker Compose** | Run multiple containers together |
| **Docker Desktop** | The GUI app you have open |
