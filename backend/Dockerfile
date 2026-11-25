FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
RUN pip install --no-cache-dir poetry==2.2.1
COPY pyproject.toml ./
RUN poetry config virtualenvs.create false && poetry install --no-root
COPY alembic.ini ./
COPY alembic ./alembic
COPY app ./app
COPY tests ./tests
EXPOSE 8000
