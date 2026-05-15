*This project has been create as part of the 42 curriculum by bgazur, lsurco-t, hiennguy, jvarila.*
# ft_transcendence
A recipe sharing platform, full-stack web dev project
## Description
### The Goal
Our goal for the transcendence project was to learn how to design a proper full stack web application
that uses a RESTful API and consists of multiple docker containers, practice project management,
team work, and improve our Git workflows. At the same time we set out to learn React and Go, as well
as getting familiar with SQL using PostgreSQL as our database.
## Instructions
### Prerequisites
- Docker          (developed using 26.1.4)
- Docker Compose  (developed using v2.27.1)
- [Cloudinary for image hosting](https://cloudinary.com/)
- JWT secret
- Git
### Steps
1. Download the repository using the Git CLI or GUI
```sh
git clone https://github.com/Kiiskii/ft_transcendence.git && cd ./ft_transcendence
```
2. Set up a `.env` file, and place it in the src folder (`src/.env.example` provided as a starting point)
```sh
cp ./src/.env.example ./src/.env
```
3. run `make` in the root folder of the repository
4. Open [https://localhost:8443] on a web browser (replace port if customized)
## Resources
- [Golang links](docs/go_links.md)
- [nginx links](docs/nginx_links.md)
- [JWT and cookies](docs/jwt_and_cookies.md)
### AI Use
AI was used for code review on GitHub, debugging, planning of features, pointing to resources...
## Team Information
### bgazur
- Assigned roles: developer
### lsurco-t
- Assigned roles: developer
### hiennguy
- Assigned roles: developer
### jvarila
- Assigned roles: developer
## Project Management
Regular team meetings, communication through Discord, documentation in Google Docs, GitHub issues,
GitHub Project for Kanban board
## Technical Stack
- Frontend: React & Vite
- Backend: Golang, gin, pgx
- Database: PostgreSQL
- Reverse proxy: nginx
- Containerization: Docker Compose
## Database Schema
To be written
## Features List
- Friending
- Posting
- Browsing
- Profile management
## Modules
### Web
- Major: Use a framework for both the frontend and backend
- Major: A public API to interact with the database with a secured API key, rate
limiting, documentation, and at least 5 endpoints
- Minor: A complete notification system for all creation, update, and deletion actions
## Individual Contributions
To be written
