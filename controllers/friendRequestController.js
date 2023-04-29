const FriendRequest = require("../models/friendRequest");

exports.friendRequest_details = async (req, res, next) => {
  try {
    const friendRequest = await FriendRequest.findById(
      req.params.friendRequestId
    );
    if (friendRequest == null) {
      return res.status(404).json({ message: "Friend Request not found" });
    }
    return res.status(200).json({ friendRequest });
  } catch (err) {
    return next(err);
  }
};

exports.friendRequest_listing = async (req, res, next) => {
  try {
    const friendRequests = FriendRequest.find({ receiver: req.user._id });
    return res.status(200).json({ friendRequests });
  } catch (err) {
    return next(err);
  }
};

exports.friendRequest_create = async (req, res, next) => {
  const friendRequest = new FriendRequest({
    sender: req.query.senderId,
    receiver: req.query.receiverId,
    status: "pending",
    createAt: new Date(),
  });
  try {
    await friendRequest.save();
    return res.status(200).json({ message: "Friend request created" });
  } catch (err) {
    return next(err);
  }
};

exports.friendRequest_update = async (req, res, next) => {
  try {
    const friendRequest = await FriendRequest.findOne({
      _id: req.params.friendRequestId,
    });
    const senderId = friendRequest.sender;
    const receiverId = friendRequest.receiver;

    await FriendRequest.updateOne(
      { _id: req.params.friendRequestId, receiver: req.user._id },
      { $set: { status: "accepted" } }
    );

    // Update friends field for both sender and receiver
    await User.updateOne({ _id: senderId }, { $push: { friends: receiverId } });
    await User.updateOne({ _id: receiverId }, { $push: { friends: senderId } });
    return res.status(200).json({ message: "Friend request accepted" });
  } catch (err) {
    return next(err);
  }
};

exports.friendRequest_delete = async (req, res, next) => {
  const friendRequest = await FriendRequest.findById(
    req.params.friendRequestId
  );
  if (friendRequest == null) {
    return res.status(404).json({ message: "Friend request not found" });
  }
  try {
    await FriendRequest.deleteOne({ _id: req.params.friendRequestId });
    return res.status(200).json({ message: "Friend request cancelled" });
  } catch (err) {
    return next(err);
  }
};
