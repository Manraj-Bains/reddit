import { TComments, TPost, TPosts, TUsers, TVotes, TUser } from "./types";
import type { TEnrichedPost } from "./types";

const users: TUsers = {
  1: { id: 1, uname: "alice", password: "alpha" },
  2: { id: 2, uname: "theo", password: "123" },
  3: { id: 3, uname: "prime", password: "123" },
  4: { id: 4, uname: "leerob", password: "123" },
};

const posts: TPosts = {
  101: {
    id: 101,
    title: "Mochido opens its new location in Coquitlam this week",
    link: "https://dailyhive.com/vancouver/mochido-coquitlam-open",
    description: "New mochi donut shop, Mochido, is set to open later this week.",
    creator: 1,
    subgroup: "food",
    timestamp: 1643648446955,
    votes: 0,
    userVotes: new Map<number, number>(),
  },
  102: {
    id: 102,
    title: "2023 State of Databases for Serverless & Edge",
    link: "https://leerob.io/blog/backend",
    description: "An overview of databases that pair well with modern application and compute providers.",
    creator: 4,
    subgroup: "coding",
    timestamp: 1642611742010,
    votes: 0,
    userVotes: new Map<number, number>(),
  },
};

const comments: TComments = {
  9001: {
    id: 9001,
    post_id: 102,
    creator: 1,
    description: "Actually I learned a lot",
    timestamp: 1642691742010,
  },
};

const votes: TVotes = [
  { user_id: 2, post_id: 101, value: +1 },
  { user_id: 3, post_id: 101, value: +1 },
  { user_id: 4, post_id: 101, value: +1 },
  { user_id: 3, post_id: 102, value: -1 },
];

function debug() {
  console.log("==== DB DEBUGGING ====");
  console.log("users", users);
  console.log("posts", posts);
  console.log("comments", comments);
  console.log("votes", votes);
  console.log("==== DB DEBUGGING ====");
}

function getUser(id: number) {
  return users[id];
}

function getUserByUsername(uname: string) {
  return getUser(Object.values(users).filter((user) => user.uname === uname)[0].id);
}

function getVotesForPost(post_id: number) {
  return votes.filter((vote) => vote.post_id === post_id);
}

function decoratePost(post: TPost): TEnrichedPost {
  const enrichedPost = {
    ...post,
    creatorDetails: users[post.creator],
    comments: Object.values(comments)
      .filter(comment => comment.post_id === post.id)
      .map(comment => ({
        ...comment,
        creatorDetails: users[comment.creator]
      })),
    votes: Array.from(post.userVotes.values()).reduce((acc, curr) => acc + curr, 0)
  };
  return enrichedPost;
}


/**
 * @param {number} n - how many posts to get, defaults to 5
 * @param {string} sub - which sub to fetch, defaults to all subs
 */

function getPosts(n = 5, sub: string | undefined = undefined): TEnrichedPost[] {
  let allPosts = Object.values(posts);
  if (sub) {
      allPosts = allPosts.filter((post) => post.subgroup === sub);
  }
  allPosts.sort((a, b) => b.timestamp - a.timestamp);

  // Ensure votes are recalculated for all posts
  return allPosts.slice(0, n).map(post => {
      recalculateVotes(post.id);
      return decoratePost(post);
  });
}

function updatePost(postId: number, changes: Partial<TPost>) {
  const post = posts[postId];
  if (!post) return false;

  post.title = changes.title ?? post.title;
  post.link = changes.link ?? post.link;
  post.description = changes.description ?? post.description;
  post.subgroup = changes.subgroup ?? post.subgroup;

  return true;
}

function recalculateVotes(postId: number) {
  const post = posts[postId];
  if (!post) return;

  post.votes = Array.from(post.userVotes.values()).reduce((acc, curr) => acc + curr, 0);
}

function getPost(id: number): TEnrichedPost | undefined {
  const post = posts[id];
  if (!post) return undefined;

  // Ensure votes are recalculated
  recalculateVotes(post.id);
  return decoratePost(post);
}

function addPost(title: string, link: string, creator: string, description: string, subgroup: string) {
  const id = Math.max(...Object.keys(posts).map(Number)) + 1;
  const newPost: TPost = {
    id,
    title,
    link,
    description,
    creator: Number(creator),
    subgroup,
    timestamp: Date.now(),
    votes: 0, 
    userVotes: new Map(), 
  };
  posts[id] = newPost;
  return newPost;
}

function editPost(post_id: number, changes: { title?: string; link?: string; description?: string; subgroup?: string }) {
  const post = posts[post_id];
  if (!post) return false;

  post.title = changes.title ?? post.title;
  post.link = changes.link ?? post.link;
  post.description = changes.description ?? post.description;
  post.subgroup = changes.subgroup ?? post.subgroup;

  return true;
}

function deletePost(post_id: number) {
  if (posts[post_id]) {
    delete posts[post_id];
  }
}

function getSubs() {
  return Array.from(new Set(Object.values(posts).map((post) => post.subgroup)));
}





function addComment(post_id: number, creator: number, description: string) {
  const id = Math.max(...Object.keys(comments).map(Number)) + 1;
  const comment = {
    id,
    post_id: Number(post_id),
    creator: Number(creator),
    description,
    timestamp: Date.now(),
  };
  comments[id] = comment;
  return comment;
}

export {
  updatePost,
  debug,
  getUser,
  getUserByUsername,
  getPosts,
  getPost,
  addPost,
  editPost,
  deletePost,
  getSubs,
  addComment,
  decoratePost,
};
