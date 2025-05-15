# Étape de build
FROM python:3.13-alpine AS builder
WORKDIR /app
# installer build-deps pour psycopg2 si besoin ou autres libs
RUN apk add --no-cache build-base gcc musl-dev \
    && pip install --upgrade pip

COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Étape finale
FROM python:3.13-alpine
WORKDIR /app
# copier les paquets installés
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

COPY . .
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]
