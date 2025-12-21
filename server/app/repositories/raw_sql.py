from repositories.abstract import AbstractRepository
from sqlalchemy import text, insert, delete, update, select, and_, Enum
from db.session import async_session
from typing import Any
from enum import Enum as PythonEnum


class RawSQLRepository(AbstractRepository):
    model = None

    async def add_one(self, data: dict) -> Any:
        for field_name, value in data.items():
            column = getattr(self.model, field_name, None)
            if column is not None and hasattr(column, 'type') and isinstance(column.type, Enum):
                if isinstance(value, PythonEnum):
                    data[field_name] = value.value

        insert_sql = text(f"""
            INSERT INTO {self.model.__tablename__} ({', '.join(data.keys())})
            VALUES ({', '.join(':' + k for k in data.keys())})
            RETURNING *
        """)

        async with async_session() as session:
            result = await session.execute(insert_sql, data)
            await session.commit()
            row = result.fetchone()
            instance = self.model(**dict(row._mapping))
            return instance.to_read_model()

    async def get_one(self, id: int) -> Any | None:
        select_sql = text(f"""
            SELECT * FROM {self.model.__tablename__}
            WHERE id = :id
        """)

        async with async_session() as session:
            result = await session.execute(select_sql, {"id": id})
            row = result.fetchone()
            if row:
                instance = self.model(**dict(row._mapping))
                return instance.to_read_model()
            return None

    async def get_all(self) -> list[Any]:
        select_sql = text(f"""
            SELECT * FROM {self.model.__tablename__}
        """)

        async with async_session() as session:
            result = await session.execute(select_sql)
            rows = result.fetchall()
            return [self.model(**dict(row._mapping)).to_read_model() for row in rows]

    async def delete_one(self, id: int) -> bool:
        delete_sql = text(f"""
            DELETE FROM {self.model.__tablename__}
            WHERE id = :id
        """)

        async with async_session() as session:
            result = await session.execute(delete_sql, {"id": id})
            await session.commit()
            return result.rowcount > 0

    async def update_one(self, id: int, data: dict) -> Any:
        for field_name, value in data.items():
            column = getattr(self.model, field_name, None)
            if column is not None and hasattr(column, 'type') and isinstance(column.type, Enum):
                if isinstance(value, PythonEnum):
                    data[field_name] = value.value

        set_clause = ', '.join(f"{col} = :{col}" for col in data.keys())
        update_sql = text(f"""
            UPDATE {self.model.__tablename__}
            SET {set_clause}
            WHERE id = :id
            RETURNING *
        """)

        params = {**data, "id": id}

        async with async_session() as session:
            result = await session.execute(update_sql, params)
            await session.commit()
            row = result.fetchone()
            instance = self.model(**dict(row._mapping))
            return instance.to_read_model()
