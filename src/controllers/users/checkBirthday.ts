import { Request, Response } from "express";
import { users } from "../../models/schema";
import { db } from "../../models/db";
import { NotFound, UnauthorizedError } from "../../Errors";
import { eq,  } from "drizzle-orm";


export const isBirthdayToday = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
    throw new UnauthorizedError("User not authenticated");
  }
    const id = req.user.id;
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, id));

  if (!user.length) {
    throw new NotFound("User not found");
  }

  if (!user[0].dateOfBirth) {
    throw new NotFound("User birthdate not found");
  }

  const birthdate = new Date(user[0].dateOfBirth);
  const today = new Date();

  const isBirthday = birthdate.getDate() === today.getDate() && birthdate.getMonth() === today.getMonth();

  res.json({
    success: true,
    isBirthday,
    message: isBirthday ? "Happy Birthday!" : "Not birthday today",
  });
};