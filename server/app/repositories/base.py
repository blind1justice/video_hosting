from repositories.sqlalchemy import SQLAclhemyRepository


CURRENT_REPOSITORY = SQLAclhemyRepository


class BaseRepository(CURRENT_REPOSITORY):
    pass
