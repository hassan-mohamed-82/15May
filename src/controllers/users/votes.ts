import { Request, Response } from "express";
import { db, pool } from "../../models/db";
import {
  userVotes,
  userVotesItems,
  votes,
  votesItems,
} from "../../models/schema";
import { eq, lte, gte, and } from "drizzle-orm";
import { SuccessResponse } from "../../utils/response";
import { ConflictError, NotFound } from "../../Errors";
import { BadRequest } from "../../Errors/BadRequest";
import { v4 as uuidv4 } from "uuid";

export const getAllVotes = async (req: Request, res: Response) => {
  const votesList = await db
    .select()
    .from(votes)
    .where(
      and(gte(votes.endDate, new Date()), lte(votes.startDate, new Date()))
    );
  SuccessResponse(res, { votes: votesList }, 200);
};

export const getVote = async (req: Request, res: Response) => {
  const voteId = req.params.id;
  const userId = req.user!.id;
  const [vote] = await db
    .select()
    .from(votes)
    .where(and(eq(votes.id, voteId), gte(votes.endDate, new Date())));
  if (!vote) throw new NotFound("vote not found");
  const [prevVote] = await db
    .select()
    .from(userVotes)
    .where(and(eq(userVotes.userId, userId), eq(userVotes.voteId, voteId)));
  if (prevVote) throw new ConflictError("you voted before");
  const votesItemsList = await db
    .select()
    .from(votesItems)
    .where(eq(votesItems.voteId, voteId));
  if (!votesItemsList) throw new BadRequest("Something Wrong...");
  SuccessResponse(
    res,
    { votename: vote.name, selectedList: votesItemsList },
    200
  );
};

export const submitVote = async (req: Request, res: Response) => {
  const voteId = req.params.id;
  const userId = req.user!.id;
  const { items } = req.body;
  const [vote] = await db.select().from(votes).where(eq(votes.id, voteId));
  if (!vote) throw new NotFound("Vote not found");
  if (new Date() > new Date(vote.endDate))
    throw new ConflictError("Voting period has ended");
  const [existingVote] = await db
    .select()
    .from(userVotes)
    .where(and(eq(userVotes.userId, userId), eq(userVotes.voteId, voteId)));
  if (existingVote) throw new ConflictError("You already voted for this vote");
  const voteItemsInDb = await db
    .select()
    .from(votesItems)
    .where(eq(votesItems.voteId, voteId));
  const validItemIds = voteItemsInDb.map((item) => item.item);
  const invalid = items.some((item: any) => !validItemIds.includes(item));
  if (invalid) throw new BadRequest("One or more selected items are invalid");
  const userVoteId = uuidv4();
  await db.insert(userVotes).values({
    id: userVoteId,
    userId,
    voteId,
  });

  const voteItemsInsert = items.map((item: any) => ({
    id: uuidv4(),
    userVoteId,
    item: item,
  }));
  await db.insert(userVotesItems).values(voteItemsInsert);

  SuccessResponse(res, { message: "Vote submitted successfully" }, 200);
};


export const voteResult = async (req: Request, res: Response) => {
  const voteId = req.params.id;
  const userId = req.user!.id;

  // نتائج التصويت
  const [results]: any = await pool.query("CALL GetVoteResults2(?)", [voteId]);
  const finalResult = results[0];

  if (!finalResult || finalResult.length === 0) {
    throw new NotFound("No vote results found");
  }

  // 1) هات user_vote.id للمستخدم
  const [userVote]: any = await pool.query(
    "SELECT id FROM user_votes WHERE vote_id = ? AND user_id = ? LIMIT 1",
    [voteId, userId]
  );

  let votedItemId = null;

  if (userVote.length) {
    const userVoteId = userVote[0].id;

    // 2) هات نص الاختيار اللي المستخدم اختاره
    const [userVoteItem]: any = await pool.query(
      "SELECT item FROM user_votes_items WHERE user_vote_id = ? LIMIT 1",
      [userVoteId]
    );

    if (userVoteItem.length) {
      const selectedText = userVoteItem[0].item;

      // 3) هات الـ item_id الحقيقي من votes_items
      const [voteItemRow]: any = await pool.query(
        "SELECT id FROM votes_items WHERE vote_id = ? AND item = ? LIMIT 1",
        [voteId, selectedText]
      );

      if (voteItemRow.length) {
        votedItemId = voteItemRow[0].id;
      }
    }
  }

  // 4) أضف isUserVoted لكل item
  const resultsWithFlag = finalResult.map((item: any) => ({
    ...item,
    isUserVoted: item.item_id === votedItemId,
  }));

  SuccessResponse(res, { results: resultsWithFlag }, 200);
};
