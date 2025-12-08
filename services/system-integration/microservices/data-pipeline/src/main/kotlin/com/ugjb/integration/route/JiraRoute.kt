package com.ugjb.integration.route

import com.fasterxml.jackson.databind.ObjectMapper
import com.ugjb.integration.service.TransformService
import mu.KotlinLogging
import org.apache.camel.Exchange
import org.apache.camel.builder.RouteBuilder
import org.apache.camel.model.dataformat.JsonLibrary
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.Base64

/**
 * Jira Integration Route
 *
 * Apache Camel route for extracting data from Jira and publishing to Kafka.
 * Handles:
 * - Polling Jira REST API for issues, projects, and updates
 * - Authentication using API tokens
 * - Data transformation and enrichment
 * - Publishing events to Kafka topic
 * - Error handling and dead letter queue
 */
@Component
class JiraRoute(
    private val transformService: TransformService,
    private val objectMapper: ObjectMapper,
    @Value("\${integration.jira.base-url}") private val jiraBaseUrl: String,
    @Value("\${integration.jira.api-token}") private val jiraApiToken: String,
    @Value("\${integration.jira.username}") private val jiraUsername: String,
    @Value("\${integration.jira.poll-interval}") private val pollInterval: Long,
    @Value("\${integration.jira.projects}") private val jiraProjects: String,
    @Value("\${kafka.topics.jira-events}") private val jiraEventsTopic: String,
    @Value("\${kafka.topics.dead-letter}") private val deadLetterTopic: String
) : RouteBuilder() {

    private val logger = KotlinLogging.logger {}

    override fun configure() {
        // Error handling configuration
        errorHandler(
            deadLetterChannel("direct:jira-dlq")
                .maximumRedeliveries(3)
                .redeliveryDelay(5000)
                .useExponentialBackOff()
                .logStackTrace(true)
                .onRedelivery { exchange ->
                    logger.warn {
                        "Redelivering Jira request. Attempt: ${exchange.getIn().getHeader(Exchange.REDELIVERY_COUNTER)}"
                    }
                }
        )

        // Main Jira polling route
        from("timer:jira-poll?period=$pollInterval&delay=10000")
            .routeId("jira-poll-route")
            .log("Starting Jira data extraction...")
            .to("direct:fetch-jira-issues")

        // Fetch Jira issues
        from("direct:fetch-jira-issues")
            .routeId("jira-fetch-issues")
            .setHeader(Exchange.HTTP_METHOD, constant("GET"))
            .setHeader("Authorization", method(this, "getAuthorizationHeader"))
            .setHeader("Accept", constant("application/json"))
            .setHeader("Content-Type", constant("application/json"))
            .process { exchange ->
                val projects = if (jiraProjects.isNotBlank()) {
                    jiraProjects.split(",").joinToString(" OR ") { "project=$it" }
                } else {
                    ""
                }
                val jql = if (projects.isNotBlank()) {
                    "jql=${java.net.URLEncoder.encode(projects, "UTF-8")}&maxResults=100"
                } else {
                    "maxResults=100"
                }
                exchange.getIn().setHeader(Exchange.HTTP_URI, "$jiraBaseUrl/rest/api/3/search?$jql")
            }
            .to("http://dummy") // URI is set dynamically in header
            .unmarshal().json(JsonLibrary.Jackson)
            .log("Received ${body} from Jira")
            .to("direct:process-jira-issues")

        // Process and transform Jira issues
        from("direct:process-jira-issues")
            .routeId("jira-process-issues")
            .split().jsonpath("$.issues")
            .process { exchange ->
                val issue = exchange.getIn().getBody(Map::class.java)
                logger.debug { "Processing Jira issue: ${issue["key"]}" }

                val transformedData = transformService.transformJiraIssue(issue)
                exchange.getIn().body = objectMapper.writeValueAsString(transformedData)
            }
            .to("direct:publish-jira-event")

        // Publish to Kafka
        from("direct:publish-jira-event")
            .routeId("jira-publish-event")
            .setHeader("kafka.KEY", jsonpath("$.issueKey"))
            .log("Publishing Jira event: ${body}")
            .to("kafka:$jiraEventsTopic?brokers=\${camel.component.kafka.brokers}")
            .log("Successfully published Jira event to Kafka")

        // Dead Letter Queue handling
        from("direct:jira-dlq")
            .routeId("jira-dlq-handler")
            .log("Moving failed Jira message to DLQ: ${body}")
            .setHeader("error.source", constant("jira-route"))
            .setHeader("error.timestamp", simple("\${date:now:yyyy-MM-dd'T'HH:mm:ss.SSSZ}"))
            .setHeader("error.exception", simple("\${exception.message}"))
            .to("kafka:$deadLetterTopic?brokers=\${camel.component.kafka.brokers}")

        // Jira webhook receiver (optional - for real-time updates)
        from("direct:jira-webhook")
            .routeId("jira-webhook-receiver")
            .log("Received Jira webhook: ${body}")
            .unmarshal().json(JsonLibrary.Jackson)
            .process { exchange ->
                val webhookData = exchange.getIn().getBody(Map::class.java)
                val transformedData = transformService.transformJiraWebhook(webhookData)
                exchange.getIn().body = objectMapper.writeValueAsString(transformedData)
            }
            .to("direct:publish-jira-event")
    }

    /**
     * Generate Basic Authentication header for Jira API
     */
    fun getAuthorizationHeader(): String {
        val credentials = "$jiraUsername:$jiraApiToken"
        val encodedCredentials = Base64.getEncoder().encodeToString(credentials.toByteArray())
        return "Basic $encodedCredentials"
    }
}
