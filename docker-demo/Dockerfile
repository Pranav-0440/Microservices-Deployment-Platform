# Build stage using Maven and Eclipse Temurin JDK 21
FROM maven:3.9.8-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the package (skipping tests for speed in docker build demo)
RUN mvn clean package -DskipTests

# Run stage using a slim JRE 21 image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
