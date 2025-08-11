#!/bin/bash
echo "Starting Backend on localhost:8080..."
cd /app/backend
mvn clean install -DskipTests
mvn spring-boot:run