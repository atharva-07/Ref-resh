import { Image } from "lucide-react";

const PostWriter = ({ placeholder }: { placeholder: string }) => {
  return (
    <>
      <div
        contentEditable={true}
        data-text={placeholder}
        className="flex-grow py-2 overflow-auto focus-within:outline-none text-[15px] text-primary"
      ></div>
      <div className="rounded-full p-2 hover:cursor-pointer hover-secondary">
        <Image className="w-5 h-5" />
      </div>
    </>
  );
};

export default PostWriter;
