import { pgTable, text, timestamp, uuid, boolean, integer, json } from "drizzle-orm/pg-core";
import { relations, type InferSelectModel } from "drizzle-orm";

export const uploads = pgTable("uploads", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull(),
  bucket: text("bucket").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Upload = InferSelectModel<typeof uploads>;

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  university: text("university"),
  faculty: text("faculty"),
  isGraduated: boolean("is_graduated").default(false),
  course: integer("course"),
  hobbies: json("user_hobbies").$type<string[]>(),  bio: text("bio"),
  avatarId: uuid("avatar_id").references(() => uploads.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isOnboarded: boolean("is_onboarded").default(false),
  track: text("track"),
  purpose: text("purpose"),
  failedAttempts: integer("failed_attempts").default(0).notNull(),
  lockoutUntil: timestamp("lockout_until"),
});

export type User = InferSelectModel<typeof users>;

export const swipes = pgTable("swipes", {
  id: uuid("id").defaultRandom().primaryKey(),
  fromUserId: uuid("from_user_id").references(() => users.id).notNull(),
  toUserId: uuid("to_user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: uuid("creator_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  tags: text("tags"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventApplications = pgTable("event_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").references(() => events.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  status: text("status").default("pending").notNull(), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chats = pgTable("chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").notNull(),
  eventId: uuid("event_id").references(() => events.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chat_id").references(() => chats.id).notNull(),
  senderId: uuid("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatParticipants = pgTable("chat_participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chat_id").references(() => chats.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(), 
  fromUserId: uuid("from_user_id").references(() => users.id).notNull(), 
  eventId: uuid("event_id").references(() => events.id),
  type: text("type").notNull(),
  isRead: boolean("is_read").default(false).notNull(), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventBoardItems = pgTable("event_board_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").references(() => events.id).notNull(),
  creatorId: uuid("creator_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many, one }) => ({
  swipes: many(swipes, { relationName: "fromUser" }),
  receivedSwipes: many(swipes, { relationName: "toUser" }),
  events: many(events),
  applications: many(eventApplications),
  chatParticipants: many(chatParticipants),
  notifications: many(notifications, { relationName: "targetUser" }),
  
  avatar: one(uploads, {
    fields: [users.avatarId],
    references: [uploads.id],
  }),
}));

export const uploadRelations = relations(uploads, ({ one }) => ({
  user: one(users, {
    fields: [uploads.id],
    references: [users.avatarId],
  }),
}));

export const swipeRelations = relations(swipes, ({ one }) => ({
  fromUser: one(users, {
    fields: [swipes.fromUserId],
    references: [users.id],
    relationName: "fromUser",
  }),
  toUser: one(users, {
    fields: [swipes.toUserId],
    references: [users.id],
    relationName: "toUser",
  }),
}));

export const eventRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.creatorId],
    references: [users.id],
  }),
  applications: many(eventApplications),
}));

export const eventApplicationRelations = relations(eventApplications, ({ one }) => ({
  event: one(events, {
    fields: [eventApplications.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventApplications.userId],
    references: [users.id],
  }),
}));

export const chatRelations = relations(chats, ({ many, one }) => ({
  participants: many(chatParticipants),
  messages: many(messages),
  event: one(events, {
    fields: [chats.eventId],
    references: [events.id],
  }),
}));

export const chatParticipantRelations = relations(chatParticipants, ({ one }) => ({
  chat: one(chats, {
    fields: [chatParticipants.chatId],
    references: [chats.id],
  }),
  user: one(users, {
    fields: [chatParticipants.userId],
    references: [users.id],
  }),
}));

export const messageRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id], relationName: "targetUser" }),
  fromUser: one(users, { fields: [notifications.fromUserId], references: [users.id], relationName: "sourceUser" }),
  event: one(events, { fields: [notifications.eventId], references: [events.id] }),
}));

export const eventBoardItemRelations = relations(eventBoardItems, ({ one }) => ({
  event: one(events, { fields: [eventBoardItems.eventId], references: [events.id] }),
  creator: one(users, { fields: [eventBoardItems.creatorId], references: [users.id] }),
}));