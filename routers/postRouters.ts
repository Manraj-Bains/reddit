import express from "express";
import { Request, Response } from "express";
import { ensureAuthenticated } from "../middleware/checkAuth";
import { getPosts, getPost, addPost, editPost, deletePost, addComment } from "../fake-db";
import { TUser } from "../types";
import * as db from "../fake-db";

const router = express.Router();

// Fetch and display posts
router.get("/", async (req, res) => {
  const posts = getPosts(20);
  const user = req.user as TUser;
  res.render("posts", { posts, user });
});

// Display the form to create a post
router.get("/create", ensureAuthenticated, (req, res) => {
  res.render("createPosts");
});

// Handle the creation of a post
router.post("/create", ensureAuthenticated, async (req, res) => {
  const { title, link, description, subgroup } = req.body;
  if (!title || (!link && !description)) {
    return res.status(400).render("createPosts", { error: "Missing required fields" });
  }
  const newPost = addPost(title, link, (req.user as TUser).id.toString(), description, subgroup);
  res.redirect(`/posts/show/${newPost.id}`);
});

// Display a specific post
router.get("/show/:postid", async (req, res) => {
  const post = getPost(parseInt(req.params.postid));
  if (!post) {
    return res.status(404).send("Post not found.");
  }
  res.render("individualPost", { post, user: req.user });
});

// Display the form to edit a post
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  const postId = parseInt(req.params.id);
  const post = await getPost(postId);  
  if (!post) {
      res.status(404).send("Post not found");
  } else {
      res.render('editPost', { post });  
  }
});

// Handle the editing of a post
router.post('/edit/:id', ensureAuthenticated, async (req, res) => {
  const postId = parseInt(req.params.id);
  const { title, link, description, subgroup } = req.body;
  const updated = await editPost(postId, { title, link, description, subgroup });
  if (updated) {
      res.redirect(`/posts/show/${postId}`);  
  } else {
      res.status(400).send("Error updating the post");
  }
});

// Confirm deletion of a post
router.get("/deleteconfirm/:postid", ensureAuthenticated, async (req, res) => {
  const post = getPost(parseInt(req.params.postid));
  const user = req.user as TUser;
  if (!post || post.creator.toString() !== user.id.toString()) {
    return res.status(403).send("Unauthorized access.");
  }
  res.render("deleteConfirm", { post });
});

// Handle the deletion of a post
router.post("/delete/:postid", ensureAuthenticated, async (req, res) => {
  deletePost(parseInt(req.params.postid));
  res.redirect("/posts");
});

// Add a comment to a post
router.post("/comment-create/:postid", ensureAuthenticated, async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).send("Comment cannot be empty.");
  }
  addComment(parseInt(req.params.postid), (req.user as TUser).id, description);
  res.redirect(`/posts/show/${req.params.postid}`);
});

// POST route to handle voting
router.post("/vote/:postid", ensureAuthenticated, async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postid);
  const userId = (req.user as TUser).id;
  const vote = parseInt(req.body.vote);

  const post = db.getPost(postId);
  if (!post) {
    res.status(404).send("Post not found");
    return;
  }

  // Update or remove the vote
  if (vote === 0) {
    post.userVotes.delete(userId);
  } else {
    post.userVotes.set(userId, vote);
  }

  // Recalculate total votes
  post.votes = Array.from(post.userVotes.values()).reduce((acc, v) => acc + v, 0);

  db.updatePost(postId, post);
  res.json({ votes: post.votes });
});



export default router;
