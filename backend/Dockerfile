# Use an official, lightweight Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory inside the container to /app
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code into the container at /app
COPY . .

# UPDATED: Added the --proxy-headers flag
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]