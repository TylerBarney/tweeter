# Provisioned capacity is summed across every table and index. Stay at or under
# 25 RCU and 25 WCU so the account remains in the DynamoDB free tier. Raise a
# number only for a short pass-off, then put it back. Do not enable DAX.

locals {
  followers_index_name = "followers"
  dynamodb_capacity = {
    users           = { read = 2, write = 2 }
    auth_tokens     = { read = 2, write = 2 }
    follows         = { read = 2, write = 1 }
    followers_index = { read = 2, write = 1 }
    story           = { read = 2, write = 2 }
    feed            = { read = 5, write = 10 }
  }
  dynamodb_read_total  = sum([for capacity in local.dynamodb_capacity : capacity.read])
  dynamodb_write_total = sum([for capacity in local.dynamodb_capacity : capacity.write])
  profile_image_prefix = "image/"
}

check "dynamodb_free_tier" {
  assert {
    condition     = local.dynamodb_read_total <= 25 && local.dynamodb_write_total <= 25
    error_message = "Provisioned DynamoDB capacity is ${local.dynamodb_read_total} RCU and ${local.dynamodb_write_total} WCU. The free tier is 25 RCU and 25 WCU across every table and index."
  }
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

resource "aws_dynamodb_table" "users" {
  name         = "tweeter-users"
  billing_mode = "PROVISIONED"
  hash_key     = "alias"

  read_capacity  = local.dynamodb_capacity.users.read
  write_capacity = local.dynamodb_capacity.users.write

  attribute {
    name = "alias"
    type = "S"
  }
}

resource "aws_dynamodb_table" "auth_tokens" {
  name         = "tweeter-auth-tokens"
  billing_mode = "PROVISIONED"
  hash_key     = "token"

  read_capacity  = local.dynamodb_capacity.auth_tokens.read
  write_capacity = local.dynamodb_capacity.auth_tokens.write

  attribute {
    name = "token"
    type = "S"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }
}

resource "aws_dynamodb_table" "follows" {
  name         = "tweeter-follows"
  billing_mode = "PROVISIONED"
  hash_key     = "followerAlias"
  range_key    = "followeeAlias"

  read_capacity  = local.dynamodb_capacity.follows.read
  write_capacity = local.dynamodb_capacity.follows.write

  attribute {
    name = "followerAlias"
    type = "S"
  }

  attribute {
    name = "followeeAlias"
    type = "S"
  }

  global_secondary_index {
    name            = local.followers_index_name
    projection_type = "ALL"
    read_capacity   = local.dynamodb_capacity.followers_index.read
    write_capacity  = local.dynamodb_capacity.followers_index.write

    key_schema {
      attribute_name = "followeeAlias"
      key_type       = "HASH"
    }

    key_schema {
      attribute_name = "followerAlias"
      key_type       = "RANGE"
    }
  }
}

resource "aws_dynamodb_table" "story" {
  name         = "tweeter-story"
  billing_mode = "PROVISIONED"
  hash_key     = "alias"
  range_key    = "timestamp"

  read_capacity  = local.dynamodb_capacity.story.read
  write_capacity = local.dynamodb_capacity.story.write

  attribute {
    name = "alias"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }
}

resource "aws_dynamodb_table" "feed" {
  name         = "tweeter-feed"
  billing_mode = "PROVISIONED"
  hash_key     = "alias"
  range_key    = "postedAt"

  read_capacity  = local.dynamodb_capacity.feed.read
  write_capacity = local.dynamodb_capacity.feed.write

  attribute {
    name = "alias"
    type = "S"
  }

  attribute {
    name = "postedAt"
    type = "S"
  }
}

resource "aws_s3_bucket" "profile_images" {
  bucket        = "tweeter-profile-images-${data.aws_caller_identity.current.account_id}"
  force_destroy = true
}

resource "aws_s3_bucket_ownership_controls" "profile_images" {
  bucket = aws_s3_bucket.profile_images.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }

  depends_on = [aws_s3_bucket_public_access_block.profile_images]
}

resource "aws_s3_bucket_public_access_block" "profile_images" {
  bucket = aws_s3_bucket.profile_images.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "profile_images" {
  bucket = aws_s3_bucket.profile_images.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadProfileImages"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.profile_images.arn}/${local.profile_image_prefix}*"
      }
    ]
  })

  depends_on = [
    aws_s3_bucket_public_access_block.profile_images,
    aws_s3_bucket_ownership_controls.profile_images,
  ]
}

resource "aws_iam_role_policy" "lambda_data" {
  name = "tweeter-lambda-data"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DynamoDbData"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:ConditionCheckItem",
          "dynamodb:TransactGetItems",
          "dynamodb:TransactWriteItems",
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          aws_dynamodb_table.auth_tokens.arn,
          aws_dynamodb_table.follows.arn,
          "${aws_dynamodb_table.follows.arn}/index/${local.followers_index_name}",
          aws_dynamodb_table.story.arn,
          aws_dynamodb_table.feed.arn,
        ]
      },
      {
        Sid    = "ProfileImageBucket"
        Effect = "Allow"
        Action = "s3:*"
        Resource = [
          aws_s3_bucket.profile_images.arn,
          "${aws_s3_bucket.profile_images.arn}/*",
        ]
      }
    ]
  })
}
