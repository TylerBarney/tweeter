locals {
  function_zip = "${path.module}/../tweeter-server/function.zip"
  layer_zip    = "${path.module}/../tweeter-server/layer.zip"
  lambda_policy_arns = toset([
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess",
  ])
  lambda_handlers = {
    get_followees = {
      function_name = "GetFollowees"
      handler       = "lambda/follow/GetFolloweesLambda.handler"
    }
    get_followers = {
      function_name = "GetFollowers"
      handler       = "lambda/follow/GetFollowersLambda.handler"
    }
  }
}

resource "aws_iam_role" "lambda" {
  name = "tweeter-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "sts:AssumeRole"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda" {
  for_each = local.lambda_policy_arns

  role       = aws_iam_role.lambda.name
  policy_arn = each.value
}

resource "aws_lambda_layer_version" "dependencies" {
  filename            = local.layer_zip
  layer_name          = "tweeter-dependencies"
  compatible_runtimes = ["nodejs24.x"]
  source_code_hash    = filebase64sha256(local.layer_zip)

  lifecycle {
    create_before_destroy = true

    precondition {
      condition     = fileexists(local.layer_zip)
      error_message = "Missing tweeter-server/layer.zip. Run npm run package:lambda in tweeter-server."
    }
  }
}

resource "aws_lambda_function" "handler" {
  for_each = local.lambda_handlers

  function_name    = each.value.function_name
  filename         = local.function_zip
  source_code_hash = filebase64sha256(local.function_zip)
  handler          = each.value.handler
  runtime          = "nodejs24.x"
  role             = aws_iam_role.lambda.arn
  layers           = [aws_lambda_layer_version.dependencies.arn]

  depends_on = [aws_iam_role_policy_attachment.lambda]

  lifecycle {
    precondition {
      condition     = fileexists(local.function_zip)
      error_message = "Missing tweeter-server/function.zip. Run npm run package:lambda in tweeter-server."
    }
  }
}
