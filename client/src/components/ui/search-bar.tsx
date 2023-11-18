import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="flex justify-evenly text-primary rounded-3xl border border-border my-4 p-3 opacity-80 focus-within:bg-accent focus-within:text-primary">
      <Search />
      <input
        type="text"
        name="search"
        id="search"
        placeholder="Search"
        className="bg-transparent outline-none border-none ml-2"
        autoComplete={"off"}
      />
    </div>
  );
};

export default SearchBar;
