import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { getProfileData, updateProfile} from "../../controllers/admin/profile";
import { validate } from "../../middlewares/validation";
import { updateProfileSchema } from "../../validators/admin/profile";
const router = Router();
router.get("/", catchAsync(getProfileData));
router.put("/", validate(updateProfileSchema), catchAsync(updateProfile));
export default router;
