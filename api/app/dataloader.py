from typing import (
    Callable,
    Dict,
    Generic,
    Iterable,
    Sequence,
    TypeVar,
    Union,
)


T = TypeVar("T")
K = TypeVar("K")


class DataLoader(Generic[K, T]):
    __cache_map: Dict[K, T] = {}

    cache: bool = False
    load_fn: Callable[[list[K]], Sequence[Union[T, BaseException]]]

    def __init__(
        self,
        load_fn: Callable[[list[K]], Sequence[Union[T, BaseException]]],
        cache: bool = True,
    ) -> None:
        self.cache = cache
        self.load_fn = load_fn

    def clear(self, key: K) -> None:
        if self.cache and key in self.__cache_map:
            del self.__cache_map[key]

    def clear_all(self) -> None:
        if self.cache:
            self.__cache_map.clear()

    def clear_many(self, keys: Iterable[K]) -> None:
        for key in keys:
            self.clear(key)

    def load(self, key: K) -> T:
        if self.cache and key in self.__cache_map:
            return self.__cache_map[key]

        value = self.load_fn([key])[0]

        if isinstance(value, BaseException):
            raise value

        if self.cache:
            self.__cache_map[key] = value

        return value

    def load_many(self, keys: Iterable[K]) -> list[T]:
        return list(map(self.load, keys))

    def prime(self, key: K, value: T) -> None:
        if self.cache:
            self.__cache_map[key] = value

    def prime_many(self, data: Dict[K, T]) -> None:
        for key, value in data.items():
            self.prime(key, value)
