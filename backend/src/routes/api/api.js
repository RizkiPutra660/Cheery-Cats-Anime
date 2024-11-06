import express from "express";

const router = express.Router();

import commentRoutes from "./api-comments.js";
router.use("/comments", commentRoutes);

import articleRoutes from "./api-articles.js";
router.use("/articles", articleRoutes);

import authRoutes from "./api-auth.js";
router.use("/", authRoutes);

import userRoutes from "./api-users.js";
router.use("/users", userRoutes);

export default router;
