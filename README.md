# 🎉 2024 PGCertInfoTech Final Project - Cheery Cats' Anime 🎉

### Team Members:
- Muhammad Juang Muchtar Otton
- Muhammad Athallah Rizki Putra
- Tarak Patel
- Jibin Joy

---

## 🐱 Welcome to Cheery Cats' Anime!

Welcome, anime fans! **Cheery Cats' Anime** is a vibrant blogging site created for anime lovers. Dive into articles, explore anime character insights, write your own thoughts, and interact with others through comments. We hope you enjoy your time on our website as much as we enjoyed creating it!

---

### 📋 Project Overview

- **Explore**: Browse a variety of anime articles.
- **Interact**: Comment on your favorite articles.
- **Create**: Log in to post your own articles or edit them later.
- **Personalize**: Customize your profile with an avatar, bio, and other details.
- **Admin Features**: Access exclusive admin controls to manage users.

---

## ⚙️ Setup Instructions

To get the project running, it’s recommended to use [Visual Studio Code](https://code.visualstudio.com/):

1. **Frontend & Backend**: Open both the `frontend` and `backend` folders in **Integrated Terminals**. Run the following commands:
    ```bash
    npm install
    npm run dev
    ```

2. **Admin Interface**: Open **Main.java** inside the `java-client` folder (you may use [IntelliJ](https://www.jetbrains.com/idea/) for simplicity) and run it directly.

---

## 🔑 Login Credentials

To explore the website, use these sample accounts:

- **Admin Account**: Username: `rizkiputra660`, Password: `pl3asegue55`
- **User Account**: Username: `tanjirokamado`, Password: `cutenezuk0!`

---

## 📄 API Documentation

### 📝 Articles API

1. **Create Article**  
   `POST /articles/`

2. **Get User's Articles**  
   `GET /articles/user/:id`

3. **Get Article by ID**  
   `GET /articles/:id`

4. **List All Articles**  
   `GET /`

5. **Delete Article**  
   `DELETE /articles/:id`

6. **Update Article**  
   `PATCH /articles/:id`

7. **Like an Article**  
   `POST /articles/:id/like`

8. **List Article Comments**  
   `GET /articles/:id/comments`

### 🔐 Authentication API

1. **Login**  
   `POST /login`

2. **Logout**  
   `DELETE /logout`

### 💬 Comments API

1. **Add Comment**  
   `POST /comments/`

2. **Delete Comment**  
   `DELETE /comments/:id`

### 👤 Users API

1. **List All Users**  
   `GET /users/`

2. **Get Current User**  
   `GET /users/me`

3. **Register New User**  
   `POST /users/register`

4. **Update User**  
   `PATCH /users/:id`

5. **Delete User**  
   `DELETE /users/:id`

---

## 📑 Description of All Pages

1. **Homepage**  
   The landing page displays the website title and sign-up button if the user is not logged in. If logged in, it shows a personalized welcome message and recent articles for easy access.

2. **Search Page**  
   A dedicated page to search for articles based on the title or content. Think of it as an anime-themed Google!

3. **My Articles Page**  
   Shows all articles authored by the currently logged-in user, providing easy access for editing or reviewing past work.

4. **Edit Profile Page**  
   Customize your profile with an avatar, bio, name, and password changes.

5. **Create & Edit Article Page**  
   Here, users can craft new articles or update existing ones with fresh insights and creativity.

---

## 🎛️ Using the Java Swing Admin Interface

1. Run **Main.Java** in the `java-client` folder.
2. Log in using the **Admin Account** (Username: `rizkiputra660`, Password: `pl3asegue55`).
3. After logging in, view all users’ information in the table. Clicking a user shows additional details, including their avatar, on the right panel.

---

## 💡 Additional Notes & Marker Requests

Thank you for reviewing our project! We hope you enjoy the website’s aesthetic and give us extra credit for design! 😁
