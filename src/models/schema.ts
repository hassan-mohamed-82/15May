import {
  mysqlTable,
  varchar,
  text,
  date,
  boolean,
  int,
  mysqlEnum,
  timestamp,
  unique,
} from "drizzle-orm/mysql-core";

// ENUMS
export const userStatusEnum = ["pending", "approved", "rejected"] as const;
export const userRoles = ["member", "guest"] as const;
export const popUpsStatus = ["active", "disabled"] as const;

// ADMINS
export const admins = mysqlTable("admins", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  hashedPassword: varchar("hashed_password", { length: 255 }).notNull(),
  imagePath: varchar("imagePath", { length: 255 }),
});

// USERS
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 255 }),
  role: mysqlEnum(userRoles).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  hashedPassword: varchar("hashed_password", { length: 255 }).notNull(),
  purpose: text("purpose"),
  cardId: varchar("cardId", { length: 36 }),
  imagePath: text("image_path"),
  dateOfBirth: date("date_of_birth"),
  status: mysqlEnum(userStatusEnum).default("pending").notNull(),
  fcmtoken: varchar("fcmtoken", { length: 255 }),
  isVerified: boolean("is_verified").default(false),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const emailVerifications = mysqlTable("email_verifications", {
  userId: varchar("user_id", { length: 36 }).primaryKey(),
  code: varchar("code", { length: 6 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// VOTES
export const votes = mysqlTable("votes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  maxSelections: int("max_selections").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const votesItems = mysqlTable("votes_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  voteId: varchar("vote_id", { length: 36 }).references(() => votes.id),
  item: varchar("item", { length: 255 }).notNull(),
});

export const userVotes = mysqlTable("user_votes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  voteId: varchar("vote_id", { length: 36 })
    .notNull()
    .references(() => votes.id),
});

export const userVotesItems = mysqlTable("user_votes_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userVoteId: varchar("user_vote_id", { length: 36 })
    .notNull()
    .references(() => userVotes.id),
  item: varchar("item", { length: 255 }).notNull(),
});

// POSTS
export const postsCategory = mysqlTable("posts_category", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const posts = mysqlTable("posts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  categoryId: varchar("category_id", { length: 36 })
    .notNull()
    .references(() => postsCategory.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postsImages = mysqlTable("posts_images", {
  id: varchar("id", { length: 36 }).primaryKey(),
  imagePath: text("image_path").notNull(),
  postId: varchar("post_id", { length: 36 })
    .notNull()
    .references(() => posts.id),
});

// REACTS
export const reacts = mysqlTable(
  "reacts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id),
    postId: varchar("post_id", { length: 36 })
      .notNull()
      .references(() => posts.id),
  },
  (table) => [unique("unique_user_post_react").on(table.userId, table.postId)]
);

// COMPLAINTS
export const complaintsCategory = mysqlTable("complaints_category", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const complaints = mysqlTable("complaints", {
  id: varchar("id", { length: 36 }).primaryKey(),
  content: varchar("explain", { length: 255 }).notNull(),
  seen: boolean("seen").default(false),
  categoryId: varchar("category_id", { length: 36 })
    .notNull()
    .references(() => complaintsCategory.id),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  date: date("date").notNull(),
  status: boolean("status").default(false).notNull(),
});

// COMPETITIONS
export const competitions = mysqlTable("competitions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  mainImagepath: text("main_image_path").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const competitionsImages = mysqlTable("competitions_images", {
  id: varchar("id", { length: 36 }).primaryKey(),
  imagePath: text("image_path").notNull(),
  competitionId: varchar("competition_id", { length: 36 })
    .notNull()
    .references(() => competitions.id),
});

export const userCompetition = mysqlTable(
  "user_competition",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id),
    competitionId: varchar("competition_id", { length: 36 })
      .notNull()
      .references(() => competitions.id),
    dateOfBirth: date("date_of_birth").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    gender: mysqlEnum(["male", "female"]).notNull(),
  },
  (table) => [
    unique("unique_user_competition").on(table.userId, table.competitionId),
  ]
);

// APP PAGES & POPUPS
export const appPages = mysqlTable("app_pages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const popUpsImages = mysqlTable("popups_images", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  imagePath: varchar("image_path", { length: 255 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: mysqlEnum(popUpsStatus).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const popUpsPages = mysqlTable("popups_pages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  imageId: varchar("image_id", { length: 36 })
    .notNull()
    .references(() => popUpsImages.id),
  pageId: varchar("page_id", { length: 36 })
    .notNull()
    .references(() => appPages.id),
});

export const sliders = mysqlTable("sliders", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  status: boolean("status").default(true),
  order: int("arrange").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sliderImages = mysqlTable("slider_images", {
  id: varchar("id", { length: 36 }).primaryKey(),
  slider_id: varchar("slider_id", { length: 36 })
    .notNull()
    .references(() => sliders.id),
  image_path: text("image_path").notNull(),
});

export const notifications= mysqlTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userNotifications = mysqlTable("user_notifications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  notificationId: varchar("notification_id", { length: 36 })
    .notNull()
    .references(() => notifications.id),
  status: mysqlEnum(["unseen", "seen"]).default("unseen").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const members = mysqlTable("members", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  photo: text("photo").notNull(),
  number: int("number").notNull(),
  description: text("description").notNull(),
  layer: int("layer").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
 
export const banners = mysqlTable("banners", {
  id: varchar("id", { length: 36 }).primaryKey(),
  imagePath: text("image_path").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
