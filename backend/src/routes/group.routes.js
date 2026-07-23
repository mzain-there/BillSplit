import express from "express"
import {
  createGroup,
  getMyGroups,
  getGroupById,
  inviteMember,
  deleteGroup
} from "../controllers/group.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"
import upload from "../middlewares/multer.middleware.js"

const router = express.Router()

// All group routes are protected
router.use(verifyJWT)

router.post("/", upload.single("avatar"), createGroup)
router.get("/", getMyGroups)
router.get("/:id", getGroupById)
router.post("/:id/invite", inviteMember)
router.delete("/:id", deleteGroup)

export default router