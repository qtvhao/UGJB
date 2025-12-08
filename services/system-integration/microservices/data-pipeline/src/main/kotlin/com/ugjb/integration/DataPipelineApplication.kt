package com.ugjb.integration

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories
import org.springframework.kafka.annotation.EnableKafka
import org.springframework.scheduling.annotation.EnableScheduling

/**
 * DataPipeline Microservice
 *
 * Provides ETL (Extract, Transform, Load) capabilities for integrating external systems
 * including Jira, GitLab, and Firebase with the UGJB platform.
 *
 * Key Features:
 * - Apache Camel routes for data extraction from external APIs
 * - Kafka Streams for real-time data transformation
 * - MongoDB for persistent storage of transformed data
 * - RESTful health check endpoints
 *
 * Technology Stack:
 * - Kotlin
 * - Spring Boot 3.2.0
 * - Apache Camel 4.2.0
 * - Apache Kafka Streams 3.6.0
 * - MongoDB
 *
 * Port: 8061
 * Database: system_integration_db
 */
@SpringBootApplication
@EnableKafka
@EnableMongoRepositories
@EnableScheduling
class DataPipelineApplication

fun main(args: Array<String>) {
    runApplication<DataPipelineApplication>(*args)
}
