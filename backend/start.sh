#!/bin/bash
cd /app/backend
mvn clean install -DskipTests
mvn spring-boot:run