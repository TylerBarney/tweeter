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
