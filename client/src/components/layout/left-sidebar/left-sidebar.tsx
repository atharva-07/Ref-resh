import { Button } from "@/components/ui/button";
import Navigation from "./navigation";

const LeftSidebar = () => {
  return (
    <div className="bg-sky-600 w-[350px]">
      <h1>Ref-resh Logo Placeholder</h1>
      <Navigation />
      <Button>New Post Button</Button>
      <h1>User Profile Card</h1>
    </div>
  );
};

export default LeftSidebar;
