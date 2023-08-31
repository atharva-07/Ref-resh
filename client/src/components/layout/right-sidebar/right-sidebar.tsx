import { ModeToggle } from "./theme-toggle";

const RightSidebar = () => {
  return (
    <div className="bg-violet-600 w-[350px]">
      <h1>Search Button</h1>
      <ul>
        Stories
        <li>Story 1</li>
        <li>Story 2</li>
        <li>Story 3</li>
      </ul>
      <h3>Upcoming Birthdays</h3>
      <div>
        <ModeToggle />
        <h3>Settings</h3>
        <h3>Logout</h3>
      </div>
    </div>
  );
};

export default RightSidebar;
