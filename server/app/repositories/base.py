from repositories.sqlalchemy import SQLAclhemyRepository
from repositories.raw_sql import RawSQLRepository


CURRENT_REPOSITORY = RawSQLRepository


class BaseRepository(CURRENT_REPOSITORY):
    pass
