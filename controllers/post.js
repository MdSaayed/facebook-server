
exports.createPost = async (req,res)=>{
try {
    const post = await new Post(req.body).save();
    res.josn(post);
} catch (error) {
    return res.status(500).json({message: error.message})
}
}