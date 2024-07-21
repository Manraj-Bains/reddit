import express from "express";
import { getSubs, getPosts } from "../fake-db";

const router = express.Router();

// Router to list all subgroups
router.get("/list", async (req, res) => {
    const subgroups = getSubs();  
    res.render("subs", { subgroups });  
});

// Router to show posts by specific subgroup
router.get("/show/:subname", async (req, res) => {
    const subname = req.params.subname;
    const posts = getPosts(Infinity, subname);  
    res.render("sub", { posts, subname });  
});


export default router;
