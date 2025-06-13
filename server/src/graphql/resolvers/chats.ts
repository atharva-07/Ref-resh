import { Document } from "mongodb";
import { Types } from "mongoose";

import Chat, { ChatType } from "../../models/Chat";
import Message, { MessageType } from "../../models/Message";
import { AppContext } from "../../server";
import { checkAuthorization, newGqlError } from "../utility-functions";
import { HttpResponse } from "../utility-types";

export const chatQueries = {
  fetchChats: async (_: any, __: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const chats = await Chat.find({
        members: ctx.loggedInUserId,
      })
        .populate({
          path: "members lastMessage.sender",
          select: "_id userName pfpPath lastName firstName bio bannerPath",
        })
        .sort({ "lastMessage.createdAt": -1 })
        .limit(10);

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Chats fetched successfully.",
        data: chats,
      };
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  fetchChatMessages: async (_: any, { chatId }: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      const messages = await Message.find({
        chatId: chatId,
      })
        .populate({
          path: "sender",
          select: "_id pfpPath firstName lastName",
        })
        .sort({
          createdAt: -1,
        })
        .limit(10);

      const response: HttpResponse = {
        success: true,
        code: 200,
        message: "Fetched messages successfully.",
        data: messages,
      };
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchUnreadChatsCount: async (_: any, __: any, ctx: AppContext) => {
    checkAuthorization(ctx.loggedInUserId);
    try {
      //
    } catch (error) {
      throw error;
    }
  },
};

export const chatMutations = {
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
        });
        if (exists) {
          const response: HttpResponse = {
            success: true,
            code: 200,
            message: "Chat already exists.",
            data: exists.id,
          };

          console.log(response);

          return response.data;
        } else {
          const chat = new Chat<ChatType>({
            members: chatMembers,
          });

          const result: Document = await chat.save();
          const response: HttpResponse = {
            success: true,
            code: 201,
            message: "New chat created.",
            data: result.id,
          };

          console.log(response);

          return response.data;
        }
      } else {
        const chat = new Chat<ChatType>({
          members: chatMembers,
          chatName: chatName,
        });

        const result: Document = await chat.save();

        const response: HttpResponse = {
          success: true,
          code: 201,
          message: "New group chat created.",
          data: result.id,
        };

        console.log(response);

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
        lastMessage: {
          content: messageData.content,
          sender: ctx.loggedInUserId,
          createdAt: new Date(),
        },
      });

      message.chat = chat;
      if (!chat.chatName) {
        const chatMember: any = chat.members.filter(
          (member: any) =>
            member._id.toString() !== ctx.loggedInUserId.toString()
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
};
