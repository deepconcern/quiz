import { useEffect } from "react";

export function useError<E>(error?: E | null): void {
    useEffect(() => {
        if (error) console.error(error);
    }, [error]);
}