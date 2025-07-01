from typing import Generic, Optional, TypeVar
from pydantic import BaseModel
from pydantic.generics import GenericModel

T = TypeVar("T")

class StandardResponse(GenericModel, Generic[T]):
    code: int
    message: str
    data: Optional[T] = None
    error: Optional[str] = None
