const Post = require("../models/Post");
const User = require("../models/User");


exports.createPost = async (req, res) => {
  try {
    const post = await new Post(req.body).save();
    await post.populate("user", "first_name last_name cover picture username");
    res.json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const followingTemp = await User.findById(req.user.id).select("following");
    const following = followingTemp.following;
    const promises = following.map((user) => {
      return Post.find({ user: user })
        .populate("user", "first_name last_name picture username cover")
        .populate("comments.commentBy", "first_name last_name picture username")
        .sort({ createdAt: -1 })
        .limit(10);
    });
    const followingPosts = await (await Promise.all(promises)).flat();
    const userPosts = await Post.find({ user: req.user.id })
      .populate("user", "first_name last_name picture username cover")
      .populate("comments.commentBy", "first_name last_name picture username")
      .sort({ createdAt: -1 })
      .limit(10);
    followingPosts.push(...[...userPosts]);
    followingPosts.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
    res.json(followingPosts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.comment = async (req, res) => {
  try {
    const { comment, image, postId } = req.body;

    if (!comment || !postId) {
      return res.status(400).json({ message: "Comment and postId are required." });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            comment,
            image,
            commentBy: req.user.id,
            commentAt: new Date(),
          },
        },
      },
      { new: true }
    ).populate("comments.commentBy", "picture first_name last_name username");

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found." });
    }

    res.json(updatedPost.comments);
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.savePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const check = user.savePosts.find((post) => post.post.toString() === postId);

    if (check) {
      await User.findByIdAndUpdate(req.user.id, {
        $pull: {
          savePosts: { _id: check._id },
        },
      });
      return res.status(200).json({ message: "Post unsaved." });
    } else {
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          savePosts: {
            post: postId,
            saveAt: new Date(),
          },
        },
      });
      return res.status(200).json({ message: "Post saved." });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};


exports.deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findByIdAndDelete(id); // Ensure this is findByIdAndDelete

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    res.json({ status: "ok", message: "Post deleted successfully." });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};




