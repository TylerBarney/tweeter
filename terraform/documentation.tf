locals {
  method_docs = merge([
    for path, route in local.routes : {
      "POST /${path}" = {
        method      = "POST"
        path        = "/${path}"
        description = route.description
      }
      "OPTIONS /${path}" = {
        method      = "OPTIONS"
        path        = "/${path}"
        description = "CORS preflight for POST /${path}."
      }
    }
  ]...)
}

resource "aws_api_gateway_documentation_part" "method" {
  for_each = local.method_docs

  rest_api_id = aws_api_gateway_rest_api.tweeter.id

  location {
    type   = "METHOD"
    method = each.value.method
    path   = each.value.path
  }

  properties = jsonencode({
    description = each.value.description
  })
}

resource "aws_api_gateway_documentation_version" "published" {
  rest_api_id = aws_api_gateway_rest_api.tweeter.id
  version     = "v${substr(sha256(jsonencode(local.method_docs)), 0, 8)}"
  description = "Published method documentation"

  depends_on = [aws_api_gateway_documentation_part.method]

  lifecycle {
    create_before_destroy = true
  }
}
