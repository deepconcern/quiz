import { createContext, FC, PropsWithChildren, useMemo } from "react";
import { User } from "../gql/graphql";
import { useQuery } from "@apollo/client";
import { GET_USER_QUERY } from "../queries";
import { useError } from "../hooks/useError";

export type UserData = {
    refetch: () => void,
    user?: User | null,
};

export const UserContext = createContext<UserData>({
    refetch: () => {},
    user: null,
});

export const UserProvider: FC<PropsWithChildren> = ({ children }) => {
    const { data, error, refetch } = useQuery(GET_USER_QUERY);

    useError(error);

    const value = useMemo<UserData>(() => ({
        refetch,
        user: data?.user || null,
    }), [data, refetch]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};