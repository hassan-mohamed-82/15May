import { Request, Response } from "express";
import { db } from "../../models/db";
import { users } from "../../models/schema";
import { eq } from "drizzle-orm";
import { SuccessResponse } from "../../utils/response";
import { saveBase64Image } from "../../utils/handleImages";
import { deletePhotoFromServer } from "../../utils/deleteImage";
import { NotFound } from "../../Errors";

export const getProfile = async (req: Request, res: Response) => {
  const userID = req.user!.id;
  const [user] = await db.select().from(users).where(eq(users.id, userID));
  SuccessResponse(res, { user: user }, 200);
};

export const updateProfile = async (req: Request, res: Response) => {
  const userID = req.user!.id;
  const [user] = await db.select().from(users).where(eq(users.id, userID));
  if (!user) throw new NotFound("User not found");
  const data = req.body;
  if (data.imagePath) {
    if (user.imagePath) await deletePhotoFromServer(user.imagePath!);
    data.imagePath = await saveBase64Image(
      data.imagePath,
      userID,
      req,
      "users"
    );
  }
  await db.update(users).set(data).where(eq(users.id, userID));
  SuccessResponse(res, { message: "Profile updated successfully" }, 200);
};

export const deleteprofile= async (req: Request, res: Response) => {
  const userID = req.user!.id;
  const [user] = await db.select().from(users).where(eq(users.id, userID));
  if (!user) throw new NotFound("User not found");
  if (user.imagePath) await deletePhotoFromServer(user.imagePath!);
  await db.delete(users).where(eq(users.id, userID));
  SuccessResponse(res, { message: "Profile deleted successfully" }, 200);
};