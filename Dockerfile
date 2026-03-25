# Fase 1: Construcción (Build)
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
# Copiamos los archivos de configuración primero para aprovechar la caché
COPY pom.xml .
RUN mvn dependency:go-offline
# Copiamos el código fuente y compilamos
COPY src ./src
RUN mvn clean package -DskipTests

# Fase 2: Ejecución (Runtime)
FROM openjdk:17-jdk-slim
WORKDIR /app
# Copiamos el .jar generado en la fase anterior
COPY --from=build /app/target/hospital-system-0.0.1-SNAPSHOT.jar app.jar
# Exponemos el puerto que usa Spring Boot por defecto
EXPOSE 8080
# Comando para arrancar la app
ENTRYPOINT ["java", "-jar", "app.jar"]