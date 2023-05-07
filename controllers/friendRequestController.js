const { body, validationResult } = require("express-validator");

const FriendRequest = require("../models/friendRequest");
const { User } = require("../models/user");
const { friendRequestValidationRules } = require("./validationRules");

/* GET user's friend request details. */
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

/* GET user's received friend request listing. */
exports.friendRequest_received_listing = async (req, res, next) => {
  try {
    const friendRequests = await FriendRequest.find({ receiver: req.user._id });
    return res.status(200).json({ friendRequests });
  } catch (err) {
    return next(err);
  }
};

/* GET user's sent friend request listing. */
exports.friendRequest_sent_listing = async (req, res, next) => {
  try {
    const friendRequests = await FriendRequest.find({ sender: req.user._id });
    return res.status(200).json({ friendRequests });
  } catch (err) {
    return next(err);
  }
};

/* POST user friend request. */
exports.friendRequest_create = [
  ...friendRequestValidationRules("receiverId"),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }

    if (req.user._id.toString() === req.body.receiverId) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself" });
    }

    try {
      const receiver = await User.findById(req.body.receiverId);

      if (receiver == null) {
        return res.status(404).json({ message: "Receiver not found" });
      }

      const existingRequest = await FriendRequest.findOne({
        sender: req.user._id,
        receiver: req.body.receiverId,
      });

      if (existingRequest) {
        return res
          .status(400)
          .json({ message: "Friend request already exists" });
      }

      const friendRequest = new FriendRequest({
        sender: req.user._id,
        receiver: req.body.receiverId,
        status: "pending",
        createAt: new Date(),
      });

      await friendRequest.save();
      return res.status(200).json({ message: "Friend request created" });
    } catch (err) {
      return next(err);
    }
  },
];

/* PUT user accpeting friend request */
exports.friendRequest_accept = async (req, res, next) => {
  try {
    const friendRequest = await FriendRequest.findOne({
      _id: req.params.friendRequestId,
    });
    if (friendRequest == null) {
      return res.status(404).json({ message: "Friend request not found" });
    }
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

/* PUT user rejecting friend request */
exports.friendRequest_reject = async (req, res, next) => {
  try {
    const friendRequestUpdateResult = await FriendRequest.updateOne(
      { _id: req.params.friendRequestId, receiver: req.user._id },
      { $set: { status: "rejected" } }
    );
    if (friendRequestUpdateResult.modifiedCount == 0) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    return res.status(200).json({ message: "Friend request rejected" });
  } catch (err) {
    return next(err);
  }
};

/* DELETE user friend request. */
exports.friendRequest_delete = async (req, res, next) => {
  try {
    const friendRequestDeleteResult = await FriendRequest.deleteOne({
      _id: req.params.friendRequestId,
    });
    if (friendRequestDeleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "Friend Request not found" });
    }
    return res.status(200).json({ message: "Friend request cancelled" });
  } catch (err) {
    return next(err);
  }
};
