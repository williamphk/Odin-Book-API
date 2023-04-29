const FriendRequest = require("../models/friendRequest");

exports.friendRequest_create = async (req, res, next) => {
  const friendRequest = new FriendRequest({
    sender: req.user._id,
    receiver: req.params.receiverId,
    status: "pending",
    createAt: new Date(),
  });
  try {
    await friendRequest.save();
    res.status(200).json({ message: "Friend request created" });
  } catch (err) {
    return next(err);
  }
};

exports.friendRequest_accept = async (req, res, next) => {};

exports.friendRequest_delete = async (req, res, next) => {
  const friendRequest = await FriendRequest.findOne({
    $and: [{ sender: req.user._id }, { receiver: req.params.receiverId }],
  });
  if (friendRequest == null) {
    return res.status(404).json({ message: "Friend request not found" });
  }
  try {
    await FriendRequest.deleteOne({
      $and: [{ sender: req.user._id }, { receiver: req.params.receiverId }],
    });
    return res.status(200).json({ message: "Friend request deleted" });
  } catch (err) {
    return next(err);
  }
};
