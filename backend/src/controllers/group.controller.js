import Group from "../models/group.model.js"
import User from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import uploadToCloudinary from "../utils/uploadToCloudinary.js"

//Create Group 

const createGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body

    if (!name) {
      throw new ApiError(400, "Group name is required")
    }

    
    let avatarUrl = ""
    if (req.file && req.file.buffer) {
      avatarUrl = await uploadToCloudinary(req.file.buffer, "groups")
    }

    // Create group with creator as first member
    const group = await Group.create({
      name,
      description: description || "",
      avatar: avatarUrl,
      createdBy: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "admin",
        },
      ],
    })

    // Add group to user's groups array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { groups: group._id },
    })

    const createdGroup = await Group.findById(group._id).populate(
      "members.user",
      "name email avatar"
    )

    return res.status(201).json(
      new ApiResponse(201, createdGroup, "Group created successfully")
    )
  } catch (error) {
    next(error)
  }
}

//Get All My Groups

const getMyGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({
      "members.user": req.user._id,
    })
      .populate("members.user", "name email avatar")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })

    return res.status(200).json(
      new ApiResponse(200, groups, "Groups fetched successfully")
    )
  } catch (error) {
    next(error)
  }
}

//Get Single Group

const getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members.user", "name email avatar")
      .populate("createdBy", "name email")
      .populate({
        path: "expenses",
        populate: {
          path: "paidBy splits.user",
          select: "name email avatar",
        },
      })

    if (!group) {
      throw new ApiError(404, "Group not found")
    }

    // Check if user is a member
    const isMember = group.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    )

    if (!isMember) {
      throw new ApiError(403, "You are not a member of this group")
    }

    return res.status(200).json(
      new ApiResponse(200, group, "Group fetched successfully")
    )
  } catch (error) {
    next(error)
  }
}

//Invite Member

const inviteMember = async (req, res, next) => {
  try {
    const { email } = req.body
    const groupId = req.params.id

    if (!email) {
      throw new ApiError(400, "Email is required")
    }

    // Find group
    const group = await Group.findById(groupId)
    if (!group) {
      throw new ApiError(404, "Group not found")
    }

    // Check if requester is admin
    const requester = group.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    )
    if (!requester || requester.role !== "admin") {
      throw new ApiError(403, "Only admin can invite members")
    }

    // Find user by email
    const userToInvite = await User.findOne({ email })
    if (!userToInvite) {
      throw new ApiError(404, "No user found with this email")
    }

    // Check if already a member
    const alreadyMember = group.members.some(
      (m) => m.user.toString() === userToInvite._id.toString()
    )
    if (alreadyMember) {
      throw new ApiError(409, "User is already a member of this group")
    }

    // Add member to group
    group.members.push({
      user: userToInvite._id,
      role: "member",
    })
    await group.save()

    // Add group to invited user's groups array
    await User.findByIdAndUpdate(userToInvite._id, {
      $push: { groups: group._id },
    })

    const updatedGroup = await Group.findById(groupId).populate(
      "members.user",
      "name email avatar"
    )

    return res.status(200).json(
      new ApiResponse(200, updatedGroup, `${userToInvite.username} added to group successfully`)
    )
  } catch (error) {
    next(error)
  }
}

//Delete Group

const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)

    if (!group) {
      throw new ApiError(404, "Group not found")
    }

    // Only admin can delete group
    const requester = group.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    )
    if (!requester || requester.role !== "admin") {
      throw new ApiError(403, "Only admin can delete this group")
    }

    // Remove group from all members' groups array
    await User.updateMany(
      { groups: group._id },
      { $pull: { groups: group._id } }
    )

    await Group.findByIdAndDelete(req.params.id)

    return res.status(200).json(
      new ApiResponse(200, {}, "Group deleted successfully")
    )
  } catch (error) {
    next(error)
  }
}

export {
  createGroup,
  getMyGroups,
  getGroupById,
  inviteMember,
  deleteGroup
}