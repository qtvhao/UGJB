package com.ugjb.integration.service

import mu.KotlinLogging
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

/**
 * Data Transformation Service
 *
 * Responsible for transforming raw data from external systems (Jira, GitLab, Firebase)
 * into a standardized format for consumption by downstream services.
 *
 * Transformation includes:
 * - Schema normalization
 * - Data enrichment
 * - Field mapping
 * - Data validation
 * - Metadata addition
 */
@Service
class TransformService {

    private val logger = KotlinLogging.logger {}

    /**
     * Transform Jira issue data to standardized format
     */
    fun transformJiraIssue(issue: Map<*, *>): Map<String, Any?> {
        logger.debug { "Transforming Jira issue: ${issue["key"]}" }

        val fields = issue["fields"] as? Map<*, *> ?: emptyMap<Any, Any>()

        return mapOf(
            "source" to "jira",
            "type" to "issue",
            "issueKey" to issue["key"],
            "issueId" to issue["id"],
            "summary" to fields["summary"],
            "description" to fields["description"],
            "status" to (fields["status"] as? Map<*, *>)?.get("name"),
            "priority" to (fields["priority"] as? Map<*, *>)?.get("name"),
            "issueType" to (fields["issuetype"] as? Map<*, *>)?.get("name"),
            "assignee" to extractJiraUser(fields["assignee"] as? Map<*, *>),
            "reporter" to extractJiraUser(fields["reporter"] as? Map<*, *>),
            "createdAt" to fields["created"],
            "updatedAt" to fields["updated"],
            "project" to (fields["project"] as? Map<*, *>)?.let {
                mapOf(
                    "id" to it["id"],
                    "key" to it["key"],
                    "name" to it["name"]
                )
            },
            "labels" to fields["labels"],
            "components" to (fields["components"] as? List<*>)?.map {
                (it as? Map<*, *>)?.get("name")
            },
            "metadata" to mapOf(
                "transformedAt" to Instant.now().toString(),
                "transformVersion" to "1.0"
            )
        )
    }

    /**
     * Transform Jira webhook data
     */
    fun transformJiraWebhook(webhookData: Map<*, *>): Map<String, Any?> {
        logger.debug { "Transforming Jira webhook event: ${webhookData["webhookEvent"]}" }

        val issue = webhookData["issue"] as? Map<*, *>
        if (issue != null) {
            return transformJiraIssue(issue).plus(
                "webhookEvent" to webhookData["webhookEvent"],
                "changelog" to webhookData["changelog"]
            )
        }

        return mapOf(
            "source" to "jira",
            "type" to "webhook",
            "webhookEvent" to webhookData["webhookEvent"],
            "rawData" to webhookData,
            "metadata" to mapOf(
                "transformedAt" to Instant.now().toString(),
                "transformVersion" to "1.0"
            )
        )
    }

    /**
     * Transform GitLab project data
     */
    fun transformGitLabProject(project: Map<*, *>): Map<String, Any?> {
        logger.debug { "Transforming GitLab project: ${project["name"]}" }

        return mapOf(
            "source" to "gitlab",
            "type" to "project",
            "projectId" to project["id"],
            "name" to project["name"],
            "path" to project["path"],
            "pathWithNamespace" to project["path_with_namespace"],
            "description" to project["description"],
            "visibility" to project["visibility"],
            "defaultBranch" to project["default_branch"],
            "webUrl" to project["web_url"],
            "sshUrlToRepo" to project["ssh_url_to_repo"],
            "httpUrlToRepo" to project["http_url_to_repo"],
            "createdAt" to project["created_at"],
            "lastActivityAt" to project["last_activity_at"],
            "namespace" to (project["namespace"] as? Map<*, *>)?.let {
                mapOf(
                    "id" to it["id"],
                    "name" to it["name"],
                    "path" to it["path"],
                    "kind" to it["kind"]
                )
            },
            "statistics" to mapOf(
                "starCount" to project["star_count"],
                "forksCount" to project["forks_count"],
                "openIssuesCount" to project["open_issues_count"]
            ),
            "metadata" to mapOf(
                "transformedAt" to Instant.now().toString(),
                "transformVersion" to "1.0"
            )
        )
    }

    /**
     * Transform GitLab merge request data
     */
    fun transformGitLabMergeRequest(mergeRequest: Map<*, *>): Map<String, Any?> {
        logger.debug { "Transforming GitLab merge request: ${mergeRequest["title"]}" }

        return mapOf(
            "source" to "gitlab",
            "type" to "merge_request",
            "mergeRequestId" to mergeRequest["id"],
            "iid" to mergeRequest["iid"],
            "projectId" to mergeRequest["project_id"],
            "title" to mergeRequest["title"],
            "description" to mergeRequest["description"],
            "state" to mergeRequest["state"],
            "mergeStatus" to mergeRequest["merge_status"],
            "targetBranch" to mergeRequest["target_branch"],
            "sourceBranch" to mergeRequest["source_branch"],
            "author" to extractGitLabUser(mergeRequest["author"] as? Map<*, *>),
            "assignee" to extractGitLabUser(mergeRequest["assignee"] as? Map<*, *>),
            "createdAt" to mergeRequest["created_at"],
            "updatedAt" to mergeRequest["updated_at"],
            "mergedAt" to mergeRequest["merged_at"],
            "webUrl" to mergeRequest["web_url"],
            "labels" to mergeRequest["labels"],
            "upvotes" to mergeRequest["upvotes"],
            "downvotes" to mergeRequest["downvotes"],
            "metadata" to mapOf(
                "transformedAt" to Instant.now().toString(),
                "transformVersion" to "1.0"
            )
        )
    }

    /**
     * Transform GitLab pipeline data
     */
    fun transformGitLabPipeline(pipeline: Map<*, *>): Map<String, Any?> {
        logger.debug { "Transforming GitLab pipeline: ${pipeline["id"]}" }

        return mapOf(
            "source" to "gitlab",
            "type" to "pipeline",
            "pipelineId" to pipeline["id"],
            "projectId" to pipeline["project_id"],
            "status" to pipeline["status"],
            "ref" to pipeline["ref"],
            "sha" to pipeline["sha"],
            "webUrl" to pipeline["web_url"],
            "createdAt" to pipeline["created_at"],
            "updatedAt" to pipeline["updated_at"],
            "startedAt" to pipeline["started_at"],
            "finishedAt" to pipeline["finished_at"],
            "duration" to pipeline["duration"],
            "queuedDuration" to pipeline["queued_duration"],
            "coverage" to pipeline["coverage"],
            "metadata" to mapOf(
                "transformedAt" to Instant.now().toString(),
                "transformVersion" to "1.0"
            )
        )
    }

    /**
     * Transform GitLab webhook data
     */
    fun transformGitLabWebhook(webhookData: Map<*, *>, eventType: String?): Map<String, Any?> {
        logger.debug { "Transforming GitLab webhook event: $eventType" }

        return when (eventType) {
            "Push Hook" -> transformGitLabPushEvent(webhookData)
            "Merge Request Hook" -> {
                val mr = webhookData["object_attributes"] as? Map<*, *>
                mr?.let { transformGitLabMergeRequest(it) } ?: emptyMap()
            }
            "Pipeline Hook" -> {
                val pipeline = webhookData["object_attributes"] as? Map<*, *>
                pipeline?.let { transformGitLabPipeline(it) } ?: emptyMap()
            }
            else -> mapOf(
                "source" to "gitlab",
                "type" to "webhook",
                "eventType" to eventType,
                "rawData" to webhookData,
                "metadata" to mapOf(
                    "transformedAt" to Instant.now().toString(),
                    "transformVersion" to "1.0"
                )
            )
        }
    }

    /**
     * Transform GitLab push event
     */
    private fun transformGitLabPushEvent(pushEvent: Map<*, *>): Map<String, Any?> {
        return mapOf(
            "source" to "gitlab",
            "type" to "push",
            "eventName" to pushEvent["event_name"],
            "ref" to pushEvent["ref"],
            "before" to pushEvent["before"],
            "after" to pushEvent["after"],
            "projectId" to pushEvent["project_id"],
            "userName" to pushEvent["user_name"],
            "userEmail" to pushEvent["user_email"],
            "commits" to (pushEvent["commits"] as? List<*>)?.map { commit ->
                (commit as? Map<*, *>)?.let {
                    mapOf(
                        "id" to it["id"],
                        "message" to it["message"],
                        "timestamp" to it["timestamp"],
                        "author" to mapOf(
                            "name" to it["author"]?.let { a -> (a as? Map<*, *>)?.get("name") },
                            "email" to it["author"]?.let { a -> (a as? Map<*, *>)?.get("email") }
                        )
                    )
                }
            },
            "totalCommitsCount" to pushEvent["total_commits_count"],
            "metadata" to mapOf(
                "transformedAt" to Instant.now().toString(),
                "transformVersion" to "1.0"
            )
        )
    }

    /**
     * Extract Jira user information
     */
    private fun extractJiraUser(user: Map<*, *>?): Map<String, Any?>? {
        if (user == null) return null

        return mapOf(
            "accountId" to user["accountId"],
            "displayName" to user["displayName"],
            "emailAddress" to user["emailAddress"],
            "active" to user["active"]
        )
    }

    /**
     * Extract GitLab user information
     */
    private fun extractGitLabUser(user: Map<*, *>?): Map<String, Any?>? {
        if (user == null) return null

        return mapOf(
            "id" to user["id"],
            "username" to user["username"],
            "name" to user["name"],
            "state" to user["state"],
            "avatarUrl" to user["avatar_url"],
            "webUrl" to user["web_url"]
        )
    }

    /**
     * Transform Firebase event data
     */
    fun transformFirebaseEvent(event: Map<*, *>): Map<String, Any?> {
        logger.debug { "Transforming Firebase event" }

        return mapOf(
            "source" to "firebase",
            "type" to "event",
            "eventId" to event["eventId"],
            "eventType" to event["eventType"],
            "userId" to event["userId"],
            "timestamp" to event["timestamp"],
            "data" to event["data"],
            "metadata" to mapOf(
                "transformedAt" to Instant.now().toString(),
                "transformVersion" to "1.0"
            )
        )
    }
}
