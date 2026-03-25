# Fase 1: Construcción (Build)
FROM maven:3.8-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Fase 2: Ejecución (Runtime)
# Usamos eclipse-temurin que es mucho más confiable que la vieja de openjdk
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/hospital-system-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 9090
ENTRYPOINT ["java", "-jar", "app.jar"]