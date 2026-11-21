locals {
  schema_dialect = "http://json-schema.org/draft-04/schema#"
  model_ref_base = "https://apigateway.amazonaws.com/restapis/${aws_api_gateway_rest_api.tweeter.id}/models"

  response_properties = {
    success = { type = "boolean" }
    message = {
      type        = "string"
      description = "Null when the call succeeded."
    }
  }

  response_required = ["success", "message"]

  timestamp_property = {
    type        = "integer"
    format      = "int64"
    description = "Milliseconds since the Unix epoch."
  }
}

locals {
  dto_models = {
    UserDto = {
      description = "Public user profile."
      required    = ["firstName", "lastName", "alias", "imageUrl"]
      properties = {
        firstName = { type = "string" }
        lastName  = { type = "string" }
        alias     = { type = "string" }
        imageUrl  = { type = "string" }
      }
    }
    AuthTokenDto = {
      description = "Session token returned by login and register."
      required    = ["token", "timestamp"]
      properties = {
        token     = { type = "string" }
        timestamp = local.timestamp_property
      }
    }
    PostSegmentDto = {
      description = "One segment of a status post."
      required    = ["text", "startPosition", "endPosition", "type"]
      properties = {
        text          = { type = "string" }
        startPosition = { type = "integer" }
        endPosition   = { type = "integer" }
        type = {
          type = "string"
          enum = ["Text", "Alias", "URL", "Newline"]
        }
      }
    }
  }
}

locals {
  user_dto_ref = {
    "$ref" = "${local.model_ref_base}/${aws_api_gateway_model.dto["UserDto"].name}"
  }
  auth_token_dto_ref = {
    "$ref" = "${local.model_ref_base}/${aws_api_gateway_model.dto["AuthTokenDto"].name}"
  }
  post_segment_dto_ref = {
    "$ref" = "${local.model_ref_base}/${aws_api_gateway_model.dto["PostSegmentDto"].name}"
  }

  status_models = {
    StatusDto = {
      description = "A status in a story or feed."
      required    = ["post", "user", "timestamp", "segments"]
      properties = {
        post      = { type = "string" }
        user      = local.user_dto_ref
        timestamp = local.timestamp_property
        segments = {
          type  = "array"
          items = local.post_segment_dto_ref
        }
      }
    }
  }
}

locals {
  status_dto_ref = {
    "$ref" = "${local.model_ref_base}/${aws_api_gateway_model.status["StatusDto"].name}"
  }

  payload_models = {
    TokenRequest = {
      description = "An authenticated call."
      required    = ["token"]
      properties = {
        token = { type = "string" }
      }
    }
    UserRequest = {
      description = "An authenticated call for one user alias."
      required    = ["token", "alias"]
      properties = {
        token = { type = "string" }
        alias = { type = "string" }
      }
    }
    LoginRequest = {
      description = "Alias and password for sign-in."
      required    = ["alias", "password"]
      properties = {
        alias    = { type = "string" }
        password = { type = "string" }
      }
    }
    RegisterRequest = {
      description = "New user details for registration."
      required    = ["alias", "password", "firstName", "lastName", "userImageBytes", "imageFileExtension"]
      properties = {
        alias              = { type = "string" }
        password           = { type = "string" }
        firstName          = { type = "string" }
        lastName           = { type = "string" }
        userImageBytes     = { type = "string" }
        imageFileExtension = { type = "string" }
      }
    }
    PagedUserItemRequest = {
      description = "One page of a follow list. lastItem is a UserDto, or null on the first page."
      required    = ["token", "alias", "pageSize", "lastItem"]
      properties = {
        token    = { type = "string" }
        alias    = { type = "string" }
        pageSize = { type = "integer" }
        lastItem = local.user_dto_ref
      }
    }
    PagedUserStatusItemRequest = {
      description = "One page of a story or feed. lastItem is a StatusDto, or null on the first page."
      required    = ["token", "alias", "pageSize", "lastItem"]
      properties = {
        token    = { type = "string" }
        alias    = { type = "string" }
        pageSize = { type = "integer" }
        lastItem = local.status_dto_ref
      }
    }
    PostStatusRequest = {
      description = "A status to post for the authenticated user."
      required    = ["token", "newStatus"]
      properties = {
        token     = { type = "string" }
        newStatus = local.status_dto_ref
      }
    }
    FollowRequest = {
      description = "The authenticated user and the user they follow or count."
      required    = ["token", "user"]
      properties = {
        token = { type = "string" }
        user  = local.user_dto_ref
      }
    }
    FollowerStatusRequest = {
      description = "The authenticated user and the selected user."
      required    = ["token", "user", "selectedUser"]
      properties = {
        token        = { type = "string" }
        user         = local.user_dto_ref
        selectedUser = local.user_dto_ref
      }
    }
    TweeterResponse = {
      description = "Success flag and an optional message."
      required    = local.response_required
      properties  = local.response_properties
    }
    PagedUserItemResponse = {
      description = "One page of users. items is null when there are no items."
      required    = concat(local.response_required, ["hasMore", "items"])
      properties = merge(local.response_properties, {
        hasMore = { type = "boolean" }
        items = {
          type        = "array"
          description = "Null when there are no items."
          items       = local.user_dto_ref
        }
      })
    }
    PagedStatusItemResponse = {
      description = "One page of statuses. items is null when there are no items."
      required    = concat(local.response_required, ["hasMore", "items"])
      properties = merge(local.response_properties, {
        hasMore = { type = "boolean" }
        items = {
          type        = "array"
          description = "Null when there are no items."
          items       = local.status_dto_ref
        }
      })
    }
    FollowCountResponse = {
      description = "A follow or follower count."
      required    = concat(local.response_required, ["count"])
      properties = merge(local.response_properties, {
        count = { type = "integer" }
      })
    }
    FollowResponse = {
      description = "Follower and followee counts after a follow change."
      required    = concat(local.response_required, ["followerCount", "followeeCount"])
      properties = merge(local.response_properties, {
        followerCount = { type = "integer" }
        followeeCount = { type = "integer" }
      })
    }
    FollowerStatusResponse = {
      description = "Whether the user follows the selected user."
      required    = concat(local.response_required, ["isFollower"])
      properties = merge(local.response_properties, {
        isFollower = { type = "boolean" }
      })
    }
    UserResponse = {
      description = "The user for an alias. user is null when no user has that alias."
      required    = concat(local.response_required, ["user"])
      properties = merge(local.response_properties, {
        user = local.user_dto_ref
      })
    }
    AuthenticationResponse = {
      description = "The signed-in user and session token."
      required    = concat(local.response_required, ["user", "authToken"])
      properties = merge(local.response_properties, {
        user      = local.user_dto_ref
        authToken = local.auth_token_dto_ref
      })
    }
  }
}

locals {
  api_model_bodies = merge(local.dto_models, local.status_models, local.payload_models)
}

resource "aws_api_gateway_model" "dto" {
  for_each = local.dto_models

  rest_api_id  = aws_api_gateway_rest_api.tweeter.id
  name         = each.key
  description  = each.value.description
  content_type = "application/json"

  schema = jsonencode({
    "$schema"            = local.schema_dialect
    title                = each.key
    type                 = "object"
    additionalProperties = false
    description          = each.value.description
    required             = each.value.required
    properties           = each.value.properties
  })
}

resource "aws_api_gateway_model" "status" {
  for_each = local.status_models

  rest_api_id  = aws_api_gateway_rest_api.tweeter.id
  name         = each.key
  description  = each.value.description
  content_type = "application/json"

  schema = jsonencode({
    "$schema"            = local.schema_dialect
    title                = each.key
    type                 = "object"
    additionalProperties = false
    description          = each.value.description
    required             = each.value.required
    properties           = each.value.properties
  })

  depends_on = [aws_api_gateway_model.dto]
}

resource "aws_api_gateway_model" "payload" {
  for_each = local.payload_models

  rest_api_id  = aws_api_gateway_rest_api.tweeter.id
  name         = each.key
  description  = each.value.description
  content_type = "application/json"

  schema = jsonencode({
    "$schema"            = local.schema_dialect
    title                = each.key
    type                 = "object"
    additionalProperties = false
    description          = each.value.description
    required             = each.value.required
    properties           = each.value.properties
  })

  depends_on = [
    aws_api_gateway_model.dto,
    aws_api_gateway_model.status,
  ]
}
