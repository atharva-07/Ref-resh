import SearchBar from "@/components/ui/search-bar";

const RightSidebar = () => {
  return (
    <div className="flex flex-col gap-20 w-[260px] shrink-0">
      <SearchBar />
      <ul>
        Stories
        <li>Story 1</li>
        <li>Story 2</li>
        <li>Story 3</li>
      </ul>
      <h3>Upcoming Birthdays</h3>
    </div>
  );
};

export default RightSidebar;
