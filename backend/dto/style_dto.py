from pydantic import BaseModel


from pydantic import BaseModel

class StyleCreate(BaseModel):
    style: str          # Writing style (e.g., classic, modern, humorous)
    tone: str           # Tone (e.g., melancholic, cheerful, serious)
    sentence_length: str  # Sentence length (short, medium, long)
    vocabulary: str     # Vocabulary style (formal, informal, simple)

    class Config:
        schema_extra = {
            "example": {
                "style": "classic",
                "tone": "melancholic",
                "sentence_length": "short",
                "vocabulary": "formal"
            }
        }
