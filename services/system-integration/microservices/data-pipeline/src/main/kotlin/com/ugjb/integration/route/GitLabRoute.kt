package com.ugjb.integration.route

import com.fasterxml.jackson.databind.ObjectMapper
import com.ugjb.integration.service.TransformService
import mu.KotlinLogging
import org.apache.camel.Exchange
import org.apache.camel.builder.RouteBuilder
import org.apache.camel.model.dataformat.JsonLibrary
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

/**
 * GitLab Integration Route
 *
 * Apache Camel route for extracting data from GitLab and publishing to Kafka.
 * Handles:
 * - Polling GitLab REST API for projects, commits, merge requests, and pipelines
 * - Authentication using private tokens
 * - Data transformation and enrichment
 * - Publishing events to Kafka topic
 * - Error handling and dead letter queue
 */
@Component
class GitLabRoute(
    private val transformService: TransformService,
    private val objectMapper: ObjectMapper,
    @Value("\${integration.gitlab.base-url}") private val gitlabBaseUrl: String,
    @Value("\${integration.gitlab.api-token}") private val gitlabApiToken: String,
    @Value("\${integration.gitlab.poll-interval}") private val pollInterval: Long,
    @Value("\${integration.gitlab.groups}") private val gitlabGroups: String,
    @Value("\${kafka.topics.gitlab-events}") private val gitlabEventsTopic: String,
    @Value("\${kafka.topics.dead-letter}") private val deadLetterTopic: String
) : RouteBuilder() {

    private val logger = KotlinLogging.logger {}

    override fun configure() {
        // Error handling configuration
        errorHandler(
            deadLetterChannel("direct:gitlab-dlq")
                .maximumRedeliveries(3)
                .redeliveryDelay(5000)
                .useExponentialBackOff()
                .logStackTrace(true)
                .onRedelivery { exchange ->
                    logger.warn {
                        "Redelivering GitLab request. Attempt: ${exchange.getIn().getHeader(Exchange.REDELIVERY_COUNTER)}"
                    }
                }
        )

        // Main GitLab polling route
        from("timer:gitlab-poll?period=$pollInterval&delay=15000")
            .routeId("gitlab-poll-route")
            .log("Starting GitLab data extraction...")
            .multicast()
            .to("direct:fetch-gitlab-projects", "direct:fetch-gitlab-merge-requests", "direct:fetch-gitlab-pipelines")

        // Fetch GitLab projects
        from("direct:fetch-gitlab-projects")
            .routeId("gitlab-fetch-projects")
            .setHeader(Exchange.HTTP_METHOD, constant("GET"))
            .setHeader("PRIVATE-TOKEN", constant(gitlabApiToken))
            .setHeader("Accept", constant("application/json"))
            .process { exchange ->
                val groupsParam = if (gitlabGroups.isNotBlank()) {
                    val groupIds = gitlabGroups.split(",").joinToString(",")
                    "owned=true&per_page=100"
                } else {
                    "owned=true&per_page=100"
                }
                exchange.getIn().setHeader(Exchange.HTTP_URI, "$gitlabBaseUrl/api/v4/projects?$groupsParam")
            }
            .to("http://dummy") // URI is set dynamically in header
            .unmarshal().json(JsonLibrary.Jackson)
            .log("Received ${bodyAs(List::class.java).size} projects from GitLab")
            .to("direct:process-gitlab-projects")

        // Process GitLab projects
        from("direct:process-gitlab-projects")
            .routeId("gitlab-process-projects")
            .split().body()
            .process { exchange ->
                val project = exchange.getIn().getBody(Map::class.java)
                logger.debug { "Processing GitLab project: ${project["name"]}" }

                val transformedData = transformService.transformGitLabProject(project)
                exchange.getIn().body = objectMapper.writeValueAsString(transformedData)
            }
            .setHeader("event.type", constant("project"))
            .to("direct:publish-gitlab-event")

        // Fetch GitLab merge requests
        from("direct:fetch-gitlab-merge-requests")
            .routeId("gitlab-fetch-merge-requests")
            .setHeader(Exchange.HTTP_METHOD, constant("GET"))
            .setHeader("PRIVATE-TOKEN", constant(gitlabApiToken))
            .setHeader("Accept", constant("application/json"))
            .setHeader(Exchange.HTTP_URI, constant("$gitlabBaseUrl/api/v4/merge_requests?state=opened&per_page=100"))
            .to("http://dummy")
            .unmarshal().json(JsonLibrary.Jackson)
            .log("Received ${bodyAs(List::class.java).size} merge requests from GitLab")
            .to("direct:process-gitlab-merge-requests")

        // Process GitLab merge requests
        from("direct:process-gitlab-merge-requests")
            .routeId("gitlab-process-merge-requests")
            .split().body()
            .process { exchange ->
                val mergeRequest = exchange.getIn().getBody(Map::class.java)
                logger.debug { "Processing GitLab MR: ${mergeRequest["title"]}" }

                val transformedData = transformService.transformGitLabMergeRequest(mergeRequest)
                exchange.getIn().body = objectMapper.writeValueAsString(transformedData)
            }
            .setHeader("event.type", constant("merge_request"))
            .to("direct:publish-gitlab-event")

        // Fetch GitLab pipelines
        from("direct:fetch-gitlab-pipelines")
            .routeId("gitlab-fetch-pipelines")
            .setHeader(Exchange.HTTP_METHOD, constant("GET"))
            .setHeader("PRIVATE-TOKEN", constant(gitlabApiToken))
            .setHeader("Accept", constant("application/json"))
            .setHeader(Exchange.HTTP_URI, constant("$gitlabBaseUrl/api/v4/projects?per_page=10"))
            .to("http://dummy")
            .unmarshal().json(JsonLibrary.Jackson)
            .split().body()
            .process { exchange ->
                val project = exchange.getIn().getBody(Map::class.java)
                val projectId = project["id"]
                exchange.getIn().setHeader("projectId", projectId)
                exchange.getIn().setHeader(Exchange.HTTP_URI, "$gitlabBaseUrl/api/v4/projects/$projectId/pipelines?per_page=10")
            }
            .setHeader(Exchange.HTTP_METHOD, constant("GET"))
            .setHeader("PRIVATE-TOKEN", constant(gitlabApiToken))
            .to("http://dummy")
            .unmarshal().json(JsonLibrary.Jackson)
            .to("direct:process-gitlab-pipelines")

        // Process GitLab pipelines
        from("direct:process-gitlab-pipelines")
            .routeId("gitlab-process-pipelines")
            .split().body()
            .process { exchange ->
                val pipeline = exchange.getIn().getBody(Map::class.java)
                logger.debug { "Processing GitLab pipeline: ${pipeline["id"]}" }

                val transformedData = transformService.transformGitLabPipeline(pipeline)
                exchange.getIn().body = objectMapper.writeValueAsString(transformedData)
            }
            .setHeader("event.type", constant("pipeline"))
            .to("direct:publish-gitlab-event")

        // Publish to Kafka
        from("direct:publish-gitlab-event")
            .routeId("gitlab-publish-event")
            .setHeader("kafka.KEY", simple("\${header.event.type}-\${date:now:yyyyMMddHHmmssSSS}"))
            .log("Publishing GitLab event: ${header.event.type}")
            .to("kafka:$gitlabEventsTopic?brokers=\${camel.component.kafka.brokers}")
            .log("Successfully published GitLab event to Kafka")

        // Dead Letter Queue handling
        from("direct:gitlab-dlq")
            .routeId("gitlab-dlq-handler")
            .log("Moving failed GitLab message to DLQ: ${body}")
            .setHeader("error.source", constant("gitlab-route"))
            .setHeader("error.timestamp", simple("\${date:now:yyyy-MM-dd'T'HH:mm:ss.SSSZ}"))
            .setHeader("error.exception", simple("\${exception.message}"))
            .to("kafka:$deadLetterTopic?brokers=\${camel.component.kafka.brokers}")

        // GitLab webhook receiver (optional - for real-time updates)
        from("direct:gitlab-webhook")
            .routeId("gitlab-webhook-receiver")
            .log("Received GitLab webhook: ${body}")
            .unmarshal().json(JsonLibrary.Jackson)
            .process { exchange ->
                val webhookData = exchange.getIn().getBody(Map::class.java)
                val eventType = exchange.getIn().getHeader("X-Gitlab-Event", String::class.java)

                val transformedData = transformService.transformGitLabWebhook(webhookData, eventType)
                exchange.getIn().body = objectMapper.writeValueAsString(transformedData)
                exchange.getIn().setHeader("event.type", eventType)
            }
            .to("direct:publish-gitlab-event")
    }
}
