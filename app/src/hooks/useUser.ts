import { useContext } from "react";

import { UserContext, UserData } from "../contexts/user";

export function useUser(): UserData {
    return useContext(UserContext);
}