import { Document, ObjectId } from "mongodb";
import { Query, Types } from "mongoose";

import Chat, { ChatType } from "../../models/Chat";
import Message, { MessageType } from "../../models/Message";
import { AppContext } from "../../server";
import { checkAuthorization, newGqlError } from "../utility-functions";
import { HttpResponse } from "../utility-types";

interface MessageEdge {
  node: MessageType;
  cursor: string;
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface ChatMessages {
  chatName: string | null;
  edges: MessageEdge[];
  pageInfo: PageInfo;
}

export const chatQueries = {
  fetchChats: async (_: any, __: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const aggregate = Chat.aggregate().match({
        members: new ObjectId(ctx.loggedInUserId),
      });

      const chats = await aggregate.exec();
      if (!chats) throw newGqlError("No chats found.", 404);

      aggregate
        .lookup({
          from: "messages",
          localField: "lastMessage",
          foreignField: "_id",
          as: "lastMessage",
        })
        .unwind({ path: "$lastMessage", preserveNullAndEmptyArrays: true })
        .lookup({
          from: "users",
          localField: "lastMessage.sender",
          foreignField: "_id",
          as: "lastMessage.sender",
        })
        .unwind({
          path: "$lastMessage.sender",
          preserveNullAndEmptyArrays: true,
        })
        .sort({
          "lastMessage.createdAt": -1,
        })
        .lookup({
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members",
        })
        .addFields({
          lastSeenMessageId: {
            $getField: {
              input: {
                $cond: {
                  if: { $ifNull: ["$lastSeen", false] },
                  then: "$lastSeen",
                  else: {},
                },
              },
              field: ctx.loggedInUserId,
            },
          },
        })
        .lookup({
          from: "messages",
          localField: "_id",
          foreignField: "chatId",
          as: "allMessages",
        })
        .addFields({
          unreadCount: {
            $size: {
              $filter: {
                input: "$allMessages",
                as: "msg",
                cond: {
                  $and: [
                    {
                      $gt: ["$$msg.createdAt", "$lastSeenMessageId.timestamp"],
                    },
                    {
                      $ne: ["$$msg.sender", new ObjectId(ctx.loggedInUserId)],
                    },
                  ],
                },
              },
            },
          },
        })
        .project({
          _id: 1,
          unreadCount: 1,
          lastSeen: {
            $cond: {
              if: { $ifNull: ["$lastSeen", false] },
              then: {
                $map: {
                  input: { $objectToArray: "$lastSeen" },
                  as: "entry",
                  in: {
                    userId: "$$entry.k",
                    messageId: "$$entry.v.messageId",
                    timestamp: "$$entry.v.timestamp",
                  },
                },
              },
              else: "$$REMOVE",
            },
          },
          members: {
            $map: {
              input: "$members",
              as: "member",
              in: {
                _id: "$$member._id",
                userName: "$$member.userName",
                pfpPath: "$$member.pfpPath",
                lastName: "$$member.lastName",
                firstName: "$$member.firstName",
                bio: "$$member.bio",
                bannerPath: "$$member.bannerPath",
              },
            },
          },
          chatName: {
            $cond: {
              if: { $ifNull: ["$chatName", false] },
              then: "$chatName",
              else: {
                $let: {
                  vars: {
                    otherMember: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$members",
                            as: "m",
                            cond: {
                              $not: { $eq: ["$$m._id", ctx.loggedInUserId] },
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    $concat: [
                      "$$otherMember.firstName",
                      " ",
                      "$$otherMember.lastName",
                    ],
                  },
                },
              },
            },
          },
          lastMessage: {
            $cond: {
              if: { $ifNull: ["$lastMessage._id", false] },
              then: {
                _id: "$lastMessage._id",
                content: "$lastMessage.content",
                createdAt: "$lastMessage.createdAt",
                updatedAt: "$lastMessage.updatedAt",
                sender: {
                  _id: "$lastMessage.sender._id",
                  userName: "$lastMessage.sender.userName",
                  pfpPath: "$lastMessage.sender.pfpPath",
                  lastName: "$lastMessage.sender.lastName",
                  firstName: "$lastMessage.sender.firstName",
                },
              },
              else: "$$REMOVE",
            },
          },
        });

      const chatsWithLastMessage = await aggregate.exec();

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Chats fetched successfully.",
        data: chatsWithLastMessage,
      };
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  fetchChatMessages: async (
    _: any,
    { chatId, pageSize, after }: any,
    ctx: AppContext
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const chat = await Chat.findById(chatId).populate(
        "members",
        "_id userName pfpPath lastName firstName bio bannerPath"
      );

      if (!chat) throw newGqlError("Chat not found.", 404);

      let chatName = chat.chatName || null;
      if (!chatName) {
        const chatMember: any = chat.members.filter(
          (member: any) =>
            member._id.toString() !== ctx.loggedInUserId.toString()
        )[0];
        chatName = `${chatMember.firstName} ${chatMember.lastName} (${chatMember.userName})`;
      }

      const aggregate = Message.aggregate().match({
        chatId: new ObjectId(chatId),
      });

      if (after) {
        aggregate.match({ _id: { $lt: new ObjectId(after) } });
      }

      aggregate
        .sort({
          createdAt: -1,
        })
        .limit(pageSize)
        .lookup({
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
        })
        .unwind("$sender")
        .project({
          _id: 1,
          content: 1,
          sender: {
            _id: "$sender._id",
            pfpPath: "$sender.pfpPath",
            firstName: "$sender.firstName",
            lastName: "$sender.lastName",
            userName: "$sender.userName",
          },
          createdAt: 1,
          updatedAt: 1,
        });

      const messages = await aggregate.exec();

      const countQuery: any = {
        chatId: chatId,
      };
      if (after) {
        countQuery._id = { $lt: new ObjectId(after) };
      }

      const totalDocumentsAfterCursor = await Message.countDocuments(
        countQuery
      ).exec();
      const hasNextPage = totalDocumentsAfterCursor > messages.length;

      const endCursor =
        messages.length > 0
          ? messages[messages.length - 1]._id.toHexString()
          : null;

      const edges: MessageEdge[] = messages.map((message) => ({
        node: message,
        cursor: message._id.toHexString(),
      }));

      const pageInfo: PageInfo = {
        hasNextPage,
        endCursor,
      };

      const chatMessages: ChatMessages = {
        chatName,
        edges,
        pageInfo,
      };

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Fetched messages successfully.",
        data: chatMessages,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const chatMutations = {
  //   type Chat implements TimeStamps {
  //   _id: ID!
  //   chatName: String!
  //   members: [BasicUserData!]!
  //   lastMessage: LastMessageData
  //   createdAt: String!
  //   updatedAt: String!
  // }
  createNewChat: async (
    _: any,
    {
      chatMembers,
      chatName,
    }: { chatMembers: Types.Array<Types.ObjectId>; chatName: string },
    ctx: AppContext
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      //   1v1: This is distinct. So, check if a chat with this 2 members already exist. If yes, do not create a new one.
      // Group: This is not distinct. We can have 2 chats with same exact members. So, Create a new one.
      // 		Group chats should have a name. Enforce a mongodb rule that a chat should have a name if it has more than 2
      // 		members.

      if (chatMembers.length == 2) {
        const exists = await Chat.findOne({
          members: {
            $all: chatMembers,
            $size: 2,
          },
        })
          .populate({
            path: "members",
            select: "_id userName pfpPath lastName firstName",
          })
          .lean();
        if (exists) {
          const chatMember: any = exists.members.filter(
            (member: any) =>
              member._id.toString() !== ctx.loggedInUserId.toString()
          )[0];
          const chatName = chatMember.firstName + " " + chatMember.lastName;

          const response: HttpResponse = {
            success: true,
            code: 200,
            message: "Chat already exists.",
            data: { ...exists, chatName },
          };

          return response.data;
        } else {
          const chat = new Chat<ChatType>({
            members: chatMembers,
          });

          const newChat: Document = await chat.save();
          await newChat.populate({
            path: "members",
            select: "_id userName pfpPath lastName firstName",
          });

          const chatMember: any = chat.members.filter(
            (member: any) =>
              member._id.toString() !== ctx.loggedInUserId.toString()
          )[0];
          const chatName = chatMember.firstName + " " + chatMember.lastName;

          const response: HttpResponse = {
            success: true,
            code: 201,
            message: "New chat created.",
            data: { ...newChat._doc, chatName },
          };

          return response.data;
        }
      } else {
        const chat = new Chat<ChatType>({
          members: chatMembers,
          chatName: chatName,
        });

        const newGroupChat: Document = await chat.save();
        await newGroupChat.populate({
          path: "members",
          select: "_id userName pfpPath lastName firstName",
        });

        const response: HttpResponse = {
          success: true,
          code: 201,
          message: "New group chat created.",
          data: newGroupChat,
        };

        return response.data;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  sendChatMessage: async (_: any, { messageData }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const chat = await Chat.findById(messageData.chatId).populate({
        path: "members",
        select: "_id userName pfpPath lastName firstName",
      });
      if (!chat) throw newGqlError("Chat not found.", 404);

      const newMessage = new Message<MessageType>({
        chatId: messageData.chatId,
        content: messageData.content,
        sender: ctx.loggedInUserId,
      });

      const message: Document = await newMessage.save();
      message.populate({
        path: "sender",
        select: "_id pfpPath firstName lastName userName",
      });
      if (!message) throw newGqlError("Message could not be sent.", 500);

      await Chat.findByIdAndUpdate(messageData.chatId, {
        lastMessage: message._id,
        // lastMessage: {
        //   id: message._id,
        //   content: messageData.content,
        //   sender: ctx.loggedInUserId,
        //   createdAt: new Date(),
        // },
      });

      message.chat = chat;
      if (!chat.chatName) {
        const chatMember: any = chat.members.filter(
          (member: any) =>
            member._id.toString() === ctx.loggedInUserId.toString()
        )[0];
        message.chat.chatName =
          chatMember.firstName + " " + chatMember.lastName;
      }

      const response: HttpResponse = {
        success: true,
        code: 201,
        message: "New message sent.",
        data: message,
      };

      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  // deleteChatMessage: async () => {},
  updateLastSeen: async (
    _: any,
    { chatId, messageId }: any,
    ctx: AppContext
  ) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) throw newGqlError("Chat not found.", 404);

      if (!chat.lastSeen) {
        chat.lastSeen = new Map();
      }

      chat.lastSeen.set(ctx.loggedInUserId.toString(), {
        messageId: new Types.ObjectId(messageId),
        timestamp: new Date(),
      });

      await chat.save();

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Last seen updated successfully.",
        data: {
          userId: ctx.loggedInUserId,
          messageId: chat.lastSeen?.get(ctx.loggedInUserId.toString())
            ?.messageId,
          timestamp: chat.lastSeen?.get(ctx.loggedInUserId.toString())
            ?.timestamp,
        },
      };

      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
