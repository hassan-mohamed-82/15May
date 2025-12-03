import { Router } from "express";
import { getProfile, updateProfile,deleteprofile } from "../../controllers/users/profile";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { updateUserProfileSchema } from "../../validators/users/profile";
const route = Router();

route.get("/", catchAsync(getProfile));
route.put("/", validate(updateUserProfileSchema), catchAsync(updateProfile));
route.delete("/", catchAsync(deleteprofile));
export default route;
