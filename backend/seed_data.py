import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models import Base, User, Video  # Giả sử bạn đã tách models thành file `models.py`

# ✅ Kết nối đến PostgreSQL
DATABASE_URL = "postgresql://videodb_owner:npg_FUpy5IXzLuY1@ep-yellow-lab-a85bwm89-pooler.eastus2.azure.neon.tech/videodb?sslmode=require&channel_binding=require"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()

# ✅ Tạo dữ liệu mẫu
def seed_data():
    try:
        users = []

        for i in range(1, 4):  # 3 users
            user = User(
                id=uuid.uuid4(),
                email=f"user{i}@example.com",
                username=f"user{i}",
                password="hashedpassword123",  # Giả sử đã mã hóa
                avatar_url=f"https://example.com/avatars/user{i}.png"
            )

            # Mỗi user có 2 video
            for j in range(1, 3):
                video = Video(
                    id=uuid.uuid4(),
                    title=f"Sample Video {i}-{j}",
                    url=f"https://example.com/videos/video_{i}_{j}.mp4",
                    thumnail_url=f"https://example.com/thumbs/thumb_{i}_{j}.jpg",
                    previous_version_url=None,
                    owner=user  # Liên kết thông qua quan hệ
                )
                session.add(video)

            session.add(user)
            users.append(user)

        session.commit()
        print("✅ Seeded 3 users with 2 videos each.")

    except Exception as e:
        session.rollback()
        print(f"❌ Error seeding data: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    seed_data()
