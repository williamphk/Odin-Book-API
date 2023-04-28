const FriendRequest = require("../models/friendRequest");

exports.friendRequest_create = async (req, res, next) => {
  const friendRequest = new FriendRequest({
    sender: req.user._id,
    receiver: req.params.receiverId,
    createAt: new Date(),
  });
  try {
    await friendRequest.save();
  } catch (err) {
    return next(err);
  }
};

exports.friendRequest_delete = async (req, res, next) => {
  const friendRequest = await FriendRequest.findById(
    res.params.friendRequestId
  );
  if (friendRequest == null) {
    return res.status(401).json({ message: "Friend request not found" });
  }
  try {
    await FriendRequest.delete({ _id: req.params.friendRequestId });
    return res.status(200).json({ message: "Friend request deleted" });
  } catch (err) {
    return next(err);
  }
};
