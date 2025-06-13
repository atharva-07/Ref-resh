import moment from "moment";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ISO_STRING_FORMAT } from "@/utility/utility-functions";

import { TimeStamps } from "../post/post";

export interface MessageProps extends TimeStamps {
  content: string;
  sender: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
  own: boolean;
}

const Message = ({ content, sender, own, createdAt }: MessageProps) => {
  const userInitials = sender.firstName[0] + sender.lastName[0];

  return (
    <div className="flex">
      {!own && (
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src={sender.avatar} alt={sender.firstName}></AvatarImage>
          <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={`w-3/4 p-2 rounded-xl mx-2 my-1 border ${
          own ? "ml-auto bg-secondary" : "mr-auto bg-primary"
        }`}
      >
        <p>{content}</p>
        <p className="text-right">{moment(createdAt).format("LT")}</p>
      </div>
    </div>
  );
};

export default Message;
