import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    id("org.springframework.boot") version "3.2.0"
    id("io.spring.dependency-management") version "1.1.4"
    kotlin("jvm") version "1.9.20"
    kotlin("plugin.spring") version "1.9.20"
}

group = "com.ugjb"
version = "0.0.1-SNAPSHOT"

java {
    sourceCompatibility = JavaVersion.VERSION_17
}

repositories {
    mavenCentral()
}

extra["camelVersion"] = "4.2.0"
extra["kafkaVersion"] = "3.6.0"

dependencies {
    // Spring Boot
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-data-mongodb")

    // Kotlin
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

    // Apache Camel
    implementation("org.apache.camel.springboot:camel-spring-boot-starter:${property("camelVersion")}")
    implementation("org.apache.camel:camel-core:${property("camelVersion")}")
    implementation("org.apache.camel:camel-http:${property("camelVersion")}")
    implementation("org.apache.camel:camel-jackson:${property("camelVersion")}")
    implementation("org.apache.camel:camel-kafka:${property("camelVersion")}")
    implementation("org.apache.camel:camel-mongodb:${property("camelVersion")}")
    implementation("org.apache.camel:camel-rest:${property("camelVersion")}")

    // Kafka Streams
    implementation("org.apache.kafka:kafka-streams:${property("kafkaVersion")}")
    implementation("org.springframework.kafka:spring-kafka")

    // HTTP Client for external APIs
    implementation("org.apache.httpcomponents.client5:httpclient5:5.3")

    // JSON Processing
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")

    // Logging
    implementation("io.github.microutils:kotlin-logging-jvm:3.0.5")

    // Test dependencies
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.apache.camel:camel-test-spring-junit5:${property("camelVersion")}")
    testImplementation("org.springframework.kafka:spring-kafka-test")
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs += "-Xjsr305=strict"
        jvmTarget = "17"
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.named<org.springframework.boot.gradle.tasks.bundling.BootJar>("bootJar") {
    archiveBaseName.set("data-pipeline")
    archiveVersion.set(version.toString())
}
