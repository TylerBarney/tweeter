output "followee_list_url" {
  description = "POST /followee/list on the dev stage"
  value       = "${aws_api_gateway_stage.dev.invoke_url}/followee/list"
}

output "follower_list_url" {
  description = "POST /follower/list on the dev stage"
  value       = "${aws_api_gateway_stage.dev.invoke_url}/follower/list"
}

output "stories_list_url" {
  description = "POST /stories/list on the dev stage"
  value       = "${aws_api_gateway_stage.dev.invoke_url}/stories/list"
}

output "feed_list_url" {
  description = "POST /feed/list on the dev stage"
  value       = "${aws_api_gateway_stage.dev.invoke_url}/feed/list"
}

output "status_post_url" {
  description = "POST /status/post on the dev stage"
  value       = "${aws_api_gateway_stage.dev.invoke_url}/status/post"
}

output "followee_count_url" {
  description = "POST /followee/count on the dev stage"
  value       = "${aws_api_gateway_stage.dev.invoke_url}/followee/count"
}

output "follower_count_url" {
  description = "POST /follower/count on the dev stage"
  value       = "${aws_api_gateway_stage.dev.invoke_url}/follower/count"
}

output "follow_url" {
  description = "POST /follow on the dev stage"
  value       = "${aws_api_gateway_stage.dev.invoke_url}/follow"
}

output "unfollow_url" {
  description = "POST /unfollow on the dev stage"
  value       = "${aws_api_gateway_stage.dev.invoke_url}/unfollow"
}

output "follower_status_url" {
  description = "POST /follower/status on the dev stage"
  value       = "${aws_api_gateway_stage.dev.invoke_url}/follower/status"
}

output "user_get_url" {
  description = "POST /user/get on the dev stage"
  value       = "${aws_api_gateway_stage.dev.invoke_url}/user/get"
}

output "user_login_url" {
  description = "POST /user/login on the dev stage"
  value       = "${aws_api_gateway_stage.dev.invoke_url}/user/login"
}

output "user_register_url" {
  description = "POST /user/register on the dev stage"
  value       = "${aws_api_gateway_stage.dev.invoke_url}/user/register"
}

output "user_logout_url" {
  description = "POST /user/logout on the dev stage"
  value       = "${aws_api_gateway_stage.dev.invoke_url}/user/logout"
}

output "users_table" {
  description = "DynamoDB table for users"
  value       = aws_dynamodb_table.users.name
}

output "auth_tokens_table" {
  description = "DynamoDB table for auth tokens"
  value       = aws_dynamodb_table.auth_tokens.name
}

output "follows_table" {
  description = "DynamoDB table for follows"
  value       = aws_dynamodb_table.follows.name
}

output "story_table" {
  description = "DynamoDB table for stories"
  value       = aws_dynamodb_table.story.name
}

output "feed_table" {
  description = "DynamoDB table for precomputed feeds"
  value       = aws_dynamodb_table.feed.name
}

output "profile_image_bucket" {
  description = "S3 bucket for profile images"
  value       = aws_s3_bucket.profile_images.bucket
}

output "profile_image_url_prefix" {
  description = "Public URL prefix for profile images"
  value       = "https://${aws_s3_bucket.profile_images.bucket}.s3.${data.aws_region.current.region}.amazonaws.com/${local.profile_image_prefix}"
}
