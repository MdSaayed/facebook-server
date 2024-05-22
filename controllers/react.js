const React = require('../models/React');
const mongoose = require("mongoose");

exports.reactPost = async (req, res) => {
    try {
        const { postId, react } = req.body;
        const userId = req.user.id;

        // Validate the 'react' value
        const validReacts = ["like", "love", "haha", "sad", "angry", "wow"];
        if (!validReacts.includes(react)) {
            return res.status(400).json({ message: "Invalid react type" });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const check = await React.findOne({
            postRef: postId,
            reactBy: userObjectId,
        });

        if (!check) {
            const newReact = new React({
                react: react,
                postRef: new mongoose.Types.ObjectId(postId),
                reactBy: userObjectId,
            });
            await newReact.save();
            return res.status(200).json({ message: "Reaction saved successfully.", newReact });
        } else {
            if (check.react === react) {
                await React.findByIdAndRemove(check._id);
                return res.status(200).json({ message: "Reaction removed successfully." });
            } else {
                await React.findByIdAndUpdate(check._id, { react: react });
                return res.status(200).json({ message: "Reaction updated successfully." });
            }
        }
    } catch (error) {
        return res.status(500).json({ message: "Error saving reaction.", error });
    }
};


exports.getReacts = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const reactsArray = await React.find({ postRef: postId });
        /* const check1 = reacts.find((x) => x.reactBy.toString() == userId)?.react; */
        const newReacts = reactsArray.reduce((group, react) => {
            let key = react["react"];
            group[key] = group[key] || [];
            group[key].push(react);
            return group;
        }, {});

        const reacts = [
            {
                react: "like",
                count: newReacts.like ? newReacts.like.length : 0,
            },
            {
                react: "love",
                count: newReacts.love ? newReacts.love.length : 0,
            },
            {
                react: "haha",
                count: newReacts.haha ? newReacts.haha.length : 0,
            },
            {
                react: "wow",
                count: newReacts.wow ? newReacts.wow.length : 0,
            },
            {
                react: "angry",
                count: newReacts.angry ? newReacts.angry.length : 0,
            },
            {
                react: "sad",
                count: newReacts.sad ? newReacts.sad.length : 0,
            },
        ];
        reacts.sort((a, b) => {
            return b.count - a.count;
        })

        const check = await React.findOne({
            postRef: postId,
            reactBy: new mongoose.Types.ObjectId(userId),
        });

        res.json({
            reacts,
            check: check?.react,
            total: reactsArray.length,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

