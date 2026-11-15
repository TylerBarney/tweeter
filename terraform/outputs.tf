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
