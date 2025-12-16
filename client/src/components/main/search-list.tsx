import { TypedDocumentNode, useLazyQuery, useQuery } from "@apollo/client";
import { debounce } from "lodash";
import { Loader2 } from "lucide-react";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PaginatedData } from "@/gql-calls/queries";
import { USERS_PAGE_SIZE } from "@/utility/constants";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { BasicUserData } from "./post/post";

export interface Query<T> {
  query: TypedDocumentNode<T>;
  variables: Record<string, string>;
}

interface QueryResponse {
  [key: string]: BasicUserData[];
}

interface PaginatedQueryResponse {
  [key: string]: PaginatedData<BasicUserData>;
}

interface SearchListProps {
  children: ReactNode;
  searchQuery: Query<{ [key: string]: BasicUserData[] }>;
  fetchQuery: Query<{ [key: string]: PaginatedData<BasicUserData> }>;
  renderHeader?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  renderCommandItem?: (user: BasicUserData) => React.ReactNode;
  overwriteCommandItem?: boolean;
}

const SearchList = ({
  children,
  searchQuery,
  fetchQuery,
  renderHeader,
  renderFooter,
  renderCommandItem,
  overwriteCommandItem = false,
}: SearchListProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<BasicUserData[]>([]);

  const [users, setUsers] = useState<BasicUserData[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [ref, inView] = useInView();

  const navigate = useNavigate();

  const { data, fetchMore } = useQuery<PaginatedQueryResponse>(
    fetchQuery.query,
    {
      variables: {
        ...fetchQuery.variables,
        pageSize: USERS_PAGE_SIZE,
        after: null,
      },
    }
  );
  const [search] = useLazyQuery<QueryResponse>(searchQuery.query);

  useEffect(() => {
    if (data && data[Object.keys(data)[0]].edges) {
      const fieldName = Object.keys(data)[0];
      setUsers((prevUsers) => {
        const existingUserIds = new Set(prevUsers.map((u) => u._id));
        const newUsers = data[fieldName].edges
          .map((edge) => edge.node)
          .filter((node) => !existingUserIds.has(node._id));

        return [...prevUsers, ...newUsers];
      });
      setHasNextPage(data[fieldName].pageInfo.hasNextPage);
      setEndCursor(data[fieldName].pageInfo.endCursor);
    }
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage && !loadingMore) {
      setLoadingMore(true);

      fetchMore({
        variables: {
          ...fetchQuery.variables,
          pageSize: USERS_PAGE_SIZE,
          after: endCursor,
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prevResult;
          }

          const fieldName = Object.keys(fetchMoreResult)[0];
          const newEdges = fetchMoreResult[fieldName].edges || [];
          const newPageInfo = fetchMoreResult[fieldName].pageInfo;
          const updatedEdges = [
            ...(prevResult[fieldName]?.edges || []),
            ...newEdges,
          ];

          return {
            [fieldName]: {
              ...prevResult[fieldName],
              edges: updatedEdges,
              pageInfo: newPageInfo,
            },
          };
        },
      }).finally(() => setLoadingMore(false));
    }
  }, [
    inView,
    hasNextPage,
    endCursor,
    fetchMore,
    loadingMore,
    fetchQuery.variables,
  ]);

  const debouncedSearch = useCallback(
    debounce(async (searchString: string) => {
      if (!searchString.trim()) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        if (searchString.trim().length > 2) {
          const variables = {
            ...searchQuery.variables,
            searchQuery: searchString,
          };
          const { data } = await search({
            variables,
          });

          if (data) setSearchResults(data[Object.keys(data)[0]] || []);
        }
      } catch (error) {
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 800),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="gap-0 p-0 outline-none">
        {renderHeader && renderHeader()}
        <Command className="overflow-hidden rounded-t-none border-t bg-transparent">
          <CommandInput
            placeholder="Search user..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup className="p-2">
              {users && users.length <= 0 && (
                <div className="text-sm text-center text-muted-foreground">
                  Such silence! There's no one here.
                </div>
              )}
              {users &&
                users.length >= 0 &&
                users.map((user) => {
                  const element = overwriteCommandItem ? (
                    renderCommandItem && renderCommandItem(user)
                  ) : (
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
                        className="ml-2 w-full"
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
                  );
                  return element;
                })}
              {hasNextPage && <div ref={ref} className="h-1"></div>}

              {loadingMore && (
                <div className="flex justify-center my-4">
                  <Loader2 className="animate-spin" size={24} />
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
        {renderFooter && renderFooter()}
      </DialogContent>
    </Dialog>
  );
};

export default SearchList;
