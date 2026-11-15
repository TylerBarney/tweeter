locals {
  post_status_codes = toset(["200", "400", "500"])
  error_selection_patterns = {
    "400" = "^\\[Bad Request\\].*"
    "500" = "^\\[Server Error\\].*"
  }
  cors_allow_origin  = "'*'"
  cors_allow_headers = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
  cors_allow_methods = "'POST,OPTIONS'"

  routes = {
    "followee/list" = {
      function_key = "get_followees"
      description  = "Returns one page of users the given user follows. The JSON body is a PagedUserItemRequest. The response is a PagedUserItemResponse."
    }
    "follower/list" = {
      function_key = "get_followers"
      description  = "Returns one page of users who follow the given user. The JSON body is a PagedUserItemRequest. The response is a PagedUserItemResponse."
    }
    "stories/list" = {
      function_key = "get_stories"
      description  = "Returns one page of statuses in the given user's story. The JSON body is a PagedUserStatusItemRequest. The response is a PagedStatusItemResponse."
    }
    "feed/list" = {
      function_key = "get_feed"
      description  = "Returns one page of statuses in the given user's feed. The JSON body is a PagedUserStatusItemRequest. The response is a PagedStatusItemResponse."
    }
    "status/post" = {
      function_key = "post_status"
      description  = "Posts a status for the authenticated user. The JSON body is a PostStatusRequest. The response is a TweeterResponse."
    }
    "followee/count" = {
      function_key = "get_followee_count"
      description  = "Returns how many users the given user follows. The JSON body is a FollowRequest. The response is a FollowCountResponse."
    }
    "follower/count" = {
      function_key = "get_follower_count"
      description  = "Returns how many users follow the given user. The JSON body is a FollowRequest. The response is a FollowCountResponse."
    }
    "follow" = {
      function_key = "follow"
      description  = "Follows the given user. The JSON body is a FollowRequest. The response is a FollowResponse."
    }
    "unfollow" = {
      function_key = "unfollow"
      description  = "Unfollows the given user. The JSON body is a FollowRequest. The response is a FollowResponse."
    }
    "follower/status" = {
      function_key = "get_follower_status"
      description  = "Returns whether the user follows the selected user. The JSON body is a FollowerStatusRequest. The response is a FollowerStatusResponse."
    }
    "user/get" = {
      function_key = "get_user"
      description  = "Returns the user with the given alias. The JSON body is a UserRequest. The response is a UserResponse."
    }
    "user/login" = {
      function_key = "login"
      description  = "Signs in with an alias and password. The JSON body is a LoginRequest. The response is an AuthenticationResponse."
    }
    "user/register" = {
      function_key = "register"
      description  = "Registers a user and signs them in. The JSON body is a RegisterRequest. The response is an AuthenticationResponse."
    }
  }

  route_segments = {
    for path in keys(local.routes) : path => split("/", path)
  }

  route_parents = toset([
    for path, segments in local.route_segments : segments[0]
    if length(segments) > 1
  ])

  post_responses = {
    for pair in setproduct(keys(local.routes), local.post_status_codes) :
    "${pair[0]}:${pair[1]}" => {
      path        = pair[0]
      status_code = pair[1]
    }
  }

  error_responses = {
    for pair in setproduct(keys(local.routes), keys(local.error_selection_patterns)) :
    "${pair[0]}:${pair[1]}" => {
      path              = pair[0]
      status_code       = pair[1]
      selection_pattern = local.error_selection_patterns[pair[1]]
    }
  }
}

resource "aws_api_gateway_rest_api" "tweeter" {
  name = "tweeter-api"

  endpoint_configuration {
    types = ["EDGE"]
  }
}

resource "aws_api_gateway_resource" "parent" {
  for_each = local.route_parents

  rest_api_id = aws_api_gateway_rest_api.tweeter.id
  parent_id   = aws_api_gateway_rest_api.tweeter.root_resource_id
  path_part   = each.key
}

resource "aws_api_gateway_resource" "route" {
  for_each = local.routes

  rest_api_id = aws_api_gateway_rest_api.tweeter.id
  parent_id = (
    length(local.route_segments[each.key]) > 1
    ? aws_api_gateway_resource.parent[local.route_segments[each.key][0]].id
    : aws_api_gateway_rest_api.tweeter.root_resource_id
  )
  path_part = local.route_segments[each.key][length(local.route_segments[each.key]) - 1]
}

resource "aws_api_gateway_method" "post" {
  for_each = local.routes

  rest_api_id   = aws_api_gateway_rest_api.tweeter.id
  resource_id   = aws_api_gateway_resource.route[each.key].id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post" {
  for_each = local.routes

  rest_api_id             = aws_api_gateway_rest_api.tweeter.id
  resource_id             = aws_api_gateway_resource.route[each.key].id
  http_method             = aws_api_gateway_method.post[each.key].http_method
  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = aws_lambda_function.handler[each.value.function_key].invoke_arn
  passthrough_behavior    = "WHEN_NO_MATCH"

  request_templates = {
    "application/json" = "$input.json('$')"
  }
}

resource "aws_api_gateway_method_response" "post" {
  for_each = local.post_responses

  rest_api_id = aws_api_gateway_rest_api.tweeter.id
  resource_id = aws_api_gateway_resource.route[each.value.path].id
  http_method = aws_api_gateway_method.post[each.value.path].http_method
  status_code = each.value.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "post_200" {
  for_each = local.routes

  rest_api_id = aws_api_gateway_rest_api.tweeter.id
  resource_id = aws_api_gateway_resource.route[each.key].id
  http_method = aws_api_gateway_method.post[each.key].http_method
  status_code = aws_api_gateway_method_response.post["${each.key}:200"].status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = local.cors_allow_origin
  }

  depends_on = [aws_api_gateway_integration.post]
}

resource "aws_api_gateway_integration_response" "post_error" {
  for_each = local.error_responses

  rest_api_id       = aws_api_gateway_rest_api.tweeter.id
  resource_id       = aws_api_gateway_resource.route[each.value.path].id
  http_method       = aws_api_gateway_method.post[each.value.path].http_method
  status_code       = aws_api_gateway_method_response.post["${each.value.path}:${each.value.status_code}"].status_code
  selection_pattern = each.value.selection_pattern

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = local.cors_allow_origin
  }

  depends_on = [
    aws_api_gateway_integration.post,
    aws_api_gateway_integration_response.post_200,
  ]
}

resource "aws_api_gateway_method" "options" {
  for_each = local.routes

  rest_api_id   = aws_api_gateway_rest_api.tweeter.id
  resource_id   = aws_api_gateway_resource.route[each.key].id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options" {
  for_each = local.routes

  rest_api_id = aws_api_gateway_rest_api.tweeter.id
  resource_id = aws_api_gateway_resource.route[each.key].id
  http_method = aws_api_gateway_method.options[each.key].http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({ statusCode = 200 })
  }
}

resource "aws_api_gateway_method_response" "options" {
  for_each = local.routes

  rest_api_id = aws_api_gateway_rest_api.tweeter.id
  resource_id = aws_api_gateway_resource.route[each.key].id
  http_method = aws_api_gateway_method.options[each.key].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options" {
  for_each = local.routes

  rest_api_id = aws_api_gateway_rest_api.tweeter.id
  resource_id = aws_api_gateway_resource.route[each.key].id
  http_method = aws_api_gateway_method.options[each.key].http_method
  status_code = aws_api_gateway_method_response.options[each.key].status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = local.cors_allow_headers
    "method.response.header.Access-Control-Allow-Methods" = local.cors_allow_methods
    "method.response.header.Access-Control-Allow-Origin"  = local.cors_allow_origin
  }

  depends_on = [aws_api_gateway_integration.options]
}

resource "aws_lambda_permission" "apigateway" {
  for_each = local.routes

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.handler[each.value.function_key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tweeter.execution_arn}/*/POST/${each.key}"
}

resource "aws_api_gateway_deployment" "dev" {
  rest_api_id = aws_api_gateway_rest_api.tweeter.id

  triggers = {
    redeployment = sha1(jsonencode({
      routes = {
        for path, route in local.routes : path => {
          uri              = aws_lambda_function.handler[route.function_key].invoke_arn
          request_template = aws_api_gateway_integration.post[path].request_templates
          error_patterns   = local.error_selection_patterns
          allow_origin     = local.cors_allow_origin
          allow_headers    = local.cors_allow_headers
          allow_methods    = local.cors_allow_methods
          options_template = aws_api_gateway_integration.options[path].request_templates
          post_method      = aws_api_gateway_method.post[path].id
          options_method   = aws_api_gateway_method.options[path].id
          route_resource   = aws_api_gateway_resource.route[path].id
        }
      }
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
    aws_lambda_permission.apigateway,
  ]
}

resource "aws_api_gateway_stage" "dev" {
  deployment_id         = aws_api_gateway_deployment.dev.id
  rest_api_id           = aws_api_gateway_rest_api.tweeter.id
  stage_name            = "dev"
  documentation_version = aws_api_gateway_documentation_version.published.version
}
