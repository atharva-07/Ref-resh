import { useLazyQuery } from "@apollo/client";
import { debounce } from "lodash";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SEARCH_POSTS, SEARCH_USERS } from "@/gql-calls/queries";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { BasicPostData, BasicUserData } from "./post/post";

const SearchBar = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [people, setPeople] = useState<BasicUserData[]>([]);
  const [posts, setPosts] = useState<BasicPostData[]>([]);
  const navigate = useNavigate();

  const [searchUsers] = useLazyQuery(SEARCH_USERS);
  const [searchPosts] = useLazyQuery(SEARCH_POSTS);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setPeople([]);
        setPosts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        if (searchQuery.trim().length > 2) {
          const [usersResult, postsResult] = await Promise.all([
            searchUsers({
              variables: {
                searchQuery,
              },
            }),
            searchPosts({
              variables: {
                searchQuery,
              },
            }),
          ]);

          setPeople(usersResult.data?.searchUsers || []);
          setPosts(postsResult.data?.searchPosts || []);
        }
      } catch (error) {
        setPeople([]);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }, 800),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearchNavigation = () => {
    setOpen(false);
    // router.push(`/search?q=${encodeURIComponent(query)}`)
  };

  return (
    <>
      <Button
        variant="ghost"
        className="relative h-9 w-full bg-background justify-start rounded-md text-sm font-normal shadow-none"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">Ctrl + K</span>
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type to search..."
          value={query}
          onValueChange={setQuery}
        />

        <CommandList>
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Searching...
              </span>
            </div>
          )}

          {!loading &&
            query.length > 2 &&
            people.length === 0 &&
            posts.length === 0 && (
              <CommandEmpty>No results found for "{query}"</CommandEmpty>
            )}

          {!loading && query && (
            <>
              {people && people.length > 0 && (
                <CommandGroup heading="People" forceMount>
                  {people.map((user) => (
                    <CommandItem
                      key={user._id}
                      className="flex items-center px-2"
                    >
                      <Avatar>
                        <AvatarImage
                          src={user?.pfpPath}
                          alt={`${user?.firstName} ${user.lastName}`}
                        />
                        <AvatarFallback>
                          {user.firstName[0] + user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className="ml-2 w-full hover:cursor-pointer"
                        onClick={() => {
                          setOpen(false);
                          navigate(`/${user.userName}`);
                        }}
                      >
                        <p className="text-sm font-medium leading-none">
                          {user.firstName + " " + user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{user.userName}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {posts && posts.length > 0 && (
                <CommandGroup heading="Posts" forceMount>
                  {posts.map((post) => (
                    <CommandItem
                      key={post._id}
                      className="flex items-center px-2"
                    >
                      <Avatar>
                        <AvatarImage
                          src={post.author?.pfpPath}
                          alt={`${post.author?.firstName} ${post.author.lastName}`}
                        />
                        <AvatarFallback>
                          {post.author.firstName[0] + post.author.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className="ml-2 w-full overflow-hidden hover:cursor-pointer"
                        onClick={() => {
                          setOpen(false);
                          navigate(`/post/${post._id}`);
                        }}
                      >
                        <p className="text-sm font-medium leading-none">
                          {post.author.firstName + " " + post.author.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {post.content}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {query && (
                <CommandGroup heading="Search" forceMount>
                  <CommandItem
                    className="p-0"
                    onSelect={handleSearchNavigation}
                  >
                    <Card className="w-full cursor-pointer hover:bg-accent/50 transition-colors border-0 `sh`adow-none">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-sm">
                              Search for "{query}"
                            </CardTitle>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">
                          View all search results
                        </p>
                      </CardContent>
                    </Card>
                  </CommandItem>
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default SearchBar;
