locals {
  post_status_codes = toset(["200", "400", "500"])
  error_selection_patterns = {
    "400" = "^\\[Bad Request\\].*"
    "500" = "^\\[Server Error\\].*"
  }
  cors_allow_origin  = "'*'"
  cors_allow_headers = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
  cors_allow_methods = "'POST,OPTIONS'"
}

resource "aws_api_gateway_rest_api" "tweeter" {
  name = "tweeter-api"

  endpoint_configuration {
    types = ["EDGE"]
  }
}

resource "aws_api_gateway_resource" "followee" {
  rest_api_id = aws_api_gateway_rest_api.tweeter.id
  parent_id   = aws_api_gateway_rest_api.tweeter.root_resource_id
  path_part   = "followee"
}

resource "aws_api_gateway_resource" "list" {
  rest_api_id = aws_api_gateway_rest_api.tweeter.id
  parent_id   = aws_api_gateway_resource.followee.id
  path_part   = "list"
}

resource "aws_api_gateway_method" "post" {
  rest_api_id   = aws_api_gateway_rest_api.tweeter.id
  resource_id   = aws_api_gateway_resource.list.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post" {
  rest_api_id             = aws_api_gateway_rest_api.tweeter.id
  resource_id             = aws_api_gateway_resource.list.id
  http_method             = aws_api_gateway_method.post.http_method
  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = aws_lambda_function.get_followees.invoke_arn
  passthrough_behavior    = "WHEN_NO_MATCH"

  request_templates = {
    "application/json" = "$input.json('$')"
  }
}

resource "aws_api_gateway_method_response" "post" {
  for_each = local.post_status_codes

  rest_api_id = aws_api_gateway_rest_api.tweeter.id
  resource_id = aws_api_gateway_resource.list.id
  http_method = aws_api_gateway_method.post.http_method
  status_code = each.value

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "post_200" {
  rest_api_id = aws_api_gateway_rest_api.tweeter.id
  resource_id = aws_api_gateway_resource.list.id
  http_method = aws_api_gateway_method.post.http_method
  status_code = aws_api_gateway_method_response.post["200"].status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = local.cors_allow_origin
  }

  depends_on = [aws_api_gateway_integration.post]
}

resource "aws_api_gateway_integration_response" "post_error" {
  for_each = local.error_selection_patterns

  rest_api_id       = aws_api_gateway_rest_api.tweeter.id
  resource_id       = aws_api_gateway_resource.list.id
  http_method       = aws_api_gateway_method.post.http_method
  status_code       = aws_api_gateway_method_response.post[each.key].status_code
  selection_pattern = each.value

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = local.cors_allow_origin
  }

  depends_on = [
    aws_api_gateway_integration.post,
    aws_api_gateway_integration_response.post_200,
  ]
}

resource "aws_api_gateway_method" "options" {
  rest_api_id   = aws_api_gateway_rest_api.tweeter.id
  resource_id   = aws_api_gateway_resource.list.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options" {
  rest_api_id = aws_api_gateway_rest_api.tweeter.id
  resource_id = aws_api_gateway_resource.list.id
  http_method = aws_api_gateway_method.options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({ statusCode = 200 })
  }
}

resource "aws_api_gateway_method_response" "options" {
  rest_api_id = aws_api_gateway_rest_api.tweeter.id
  resource_id = aws_api_gateway_resource.list.id
  http_method = aws_api_gateway_method.options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options" {
  rest_api_id = aws_api_gateway_rest_api.tweeter.id
  resource_id = aws_api_gateway_resource.list.id
  http_method = aws_api_gateway_method.options.http_method
  status_code = aws_api_gateway_method_response.options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = local.cors_allow_headers
    "method.response.header.Access-Control-Allow-Methods" = local.cors_allow_methods
    "method.response.header.Access-Control-Allow-Origin"  = local.cors_allow_origin
  }

  depends_on = [aws_api_gateway_integration.options]
}

resource "aws_lambda_permission" "apigateway_get_followees" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_followees.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tweeter.execution_arn}/*/POST/followee/list"
}

resource "aws_api_gateway_deployment" "dev" {
  rest_api_id = aws_api_gateway_rest_api.tweeter.id

  triggers = {
    redeployment = sha1(jsonencode({
      uri              = aws_lambda_function.get_followees.invoke_arn
      request_template = aws_api_gateway_integration.post.request_templates
      error_patterns   = local.error_selection_patterns
      allow_origin     = local.cors_allow_origin
      allow_headers    = local.cors_allow_headers
      allow_methods    = local.cors_allow_methods
      options_template = aws_api_gateway_integration.options.request_templates
      post_method      = aws_api_gateway_method.post.id
      options_method   = aws_api_gateway_method.options.id
      list_resource    = aws_api_gateway_resource.list.id
    }))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.post,
    aws_api_gateway_integration_response.post_200,
    aws_api_gateway_integration_response.post_error,
    aws_api_gateway_integration.options,
    aws_api_gateway_integration_response.options,
  ]
}

resource "aws_api_gateway_stage" "dev" {
  deployment_id = aws_api_gateway_deployment.dev.id
  rest_api_id   = aws_api_gateway_rest_api.tweeter.id
  stage_name    = "dev"
}
