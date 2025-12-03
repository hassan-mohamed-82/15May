"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteprofile = exports.updateProfile = exports.getProfile = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const response_1 = require("../../utils/response");
const handleImages_1 = require("../../utils/handleImages");
const deleteImage_1 = require("../../utils/deleteImage");
const Errors_1 = require("../../Errors");
const getProfile = async (req, res) => {
    const userID = req.user.id;
    const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userID));
    (0, response_1.SuccessResponse)(res, { user: user }, 200);
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    const userID = req.user.id;
    const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userID));
    if (!user)
        throw new Errors_1.NotFound("User not found");
    const data = req.body;
    if (data.imagePath) {
        if (user.imagePath)
            await (0, deleteImage_1.deletePhotoFromServer)(user.imagePath);
        data.imagePath = await (0, handleImages_1.saveBase64Image)(data.imagePath, userID, req, "users");
    }
    await db_1.db.update(schema_1.users).set(data).where((0, drizzle_orm_1.eq)(schema_1.users.id, userID));
    (0, response_1.SuccessResponse)(res, { message: "Profile updated successfully" }, 200);
};
exports.updateProfile = updateProfile;
const deleteprofile = async (req, res) => {
    const userID = req.user.id;
    const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userID));
    if (!user)
        throw new Errors_1.NotFound("User not found");
    if (user.imagePath)
        await (0, deleteImage_1.deletePhotoFromServer)(user.imagePath);
    await db_1.db.delete(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userID));
    (0, response_1.SuccessResponse)(res, { message: "Profile deleted successfully" }, 200);
};
exports.deleteprofile = deleteprofile;
