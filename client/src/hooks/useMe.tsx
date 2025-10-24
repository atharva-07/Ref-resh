import { useQuery } from "@apollo/client";

import { ME } from "@/gql-calls/queries";

const useMe = () => {
  const { data, loading, error, refetch } = useQuery(ME, {
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  });

  return {
    user: data?.me?.user,
    isUsernameSetupComplete: data?.me?.setupComplete,
    loading,
    error,
    refetch,
  };
};

export default useMe;
