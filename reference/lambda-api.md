# Lambda and API Gateway

Region `us-east-1`. One edge-optimized REST API named `tweeter-api`, deployed to a stage named `dev`. Terraform lives in `terraform/`. The AWS provider is `hashicorp/aws` version `>= 6.21.0`, which is what accepts runtime `nodejs24.x`. State stays local and is gitignored. Keep `.terraform.lock.hcl`. Do not destroy the stack unless asked.

## Reuse these

Do not create a second copy of any of these.

- Role `tweeter-lambda-role` (`aws_iam_role.lambda`). `lambda.amazonaws.com` can assume it. Attached policies: `AWSLambdaBasicExecutionRole` and `CloudWatchLogsFullAccess`.
- Layer `tweeter-dependencies` from `tweeter-server/layer.zip`, with `compatible_runtimes = ["nodejs24.x"]`. The zip root is `nodejs/node_modules/` and contains only `tweeter-shared`, `date-fns`, and `uuid`.
- `tweeter-server/function.zip`, the compiled `tweeter-server/dist` tree. Every function uses this same zip. Terraform does not build either zip.
- REST API `aws_api_gateway_rest_api.tweeter`, deployment `aws_api_gateway_deployment.dev`, and stage `aws_api_gateway_stage.dev`.

If either zip is missing, stop and tell the user to run `npm run package:lambda` in `tweeter-server`.

## Request path

`POST /followee/list` with `Content-Type: application/json` hits an `AWS` integration, not `AWS_PROXY`. The `application/json` mapping template is `$input.json('$')`, so the Lambda event is the JSON body. The handler returns a response object. HTTP 200 sends that object through unchanged. There is no response mapping template.

A normal return stays 200, including `{ "success": false, ... }`. HTTP 400 and 500 are only for thrown errors:

- 400 when `errorMessage` matches `^\[Bad Request\].*`
- 500 when `errorMessage` matches `^\[Server Error\].*`

The 200 integration response has no selection pattern. It is the default. Do not add a catch-all `.*` pattern. The error body is the Lambda error JSON, passed through.

200, 400, and 500 each declare `Access-Control-Allow-Origin` and map it to `'*'`, including the single quotes. OPTIONS on the same resource is a `MOCK` integration that returns 200 with:

- `Access-Control-Allow-Origin` = `'*'`
- `Access-Control-Allow-Headers` = `'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'`
- `Access-Control-Allow-Methods` = `'POST,OPTIONS'`

Authorization on the method is `NONE`. When a call needs a token, the token is a field in the JSON body.

## Current route

POST `/followee/list` invokes function `GetFollowees`, handler `lambda/follow/GetFolloweesLambda.handler`.

The event is a `PagedUserItemRequest`: `token`, `userAlias`, `pageSize` (a JSON number), and `lastItem` (`UserDto` or null). The return value is a `PagedUserItemResponse`: `success`, `message`, `hasMore`, and `items`. The handler calls `FollowService.loadMoreFollowees`, which still uses `FakeData`. Terraform output `followee_list_url` is the deployed URL.

Path resources are `followee` under the API root and child `list`. A later route under `/followee/...` reuses `aws_api_gateway_resource.followee` and adds a sibling of `list`.

## Adding another function and route

1. Add `tweeter-server/src/lambda/<area>/<Name>Lambda.ts`. Export `handler`. The argument is the shared request type, not an API Gateway proxy event. Return the shared response type. Call the server service. Throw a message starting with `[Bad Request]` or `[Server Error]` only when that status is required.
2. Export any new shared request or response type from `tweeter-shared/src/index.ts` by name.
3. From `tweeter-server`, run `npm run package:lambda`. That rebuilds both zips. Do not zip inside Terraform.
4. In `terraform/lambda.tf`, add one `aws_lambda_function` with the same `filename`, `source_code_hash`, `runtime` (`nodejs24.x`), `role`, and `layers` as `get_followees`. `function_name` is the handler name, such as `GetFollowers`. `handler` is the path under `dist` without `.js`, plus `.handler`, such as `lambda/follow/GetFollowersLambda.handler`. Depend on the existing policy attachments, and keep the zip-file precondition.
5. In `terraform/api.tf`, add only the path resources that do not exist yet. Then add the same POST shape as `/followee/list`: authorization `NONE`, integration type `AWS`, integration method `POST`, `uri` set to that function's `invoke_arn`, the `application/json` template `$input.json('$')`, method responses for 200, 400, and 500, integration responses with the same selection patterns and `'*'` origin header, and an OPTIONS mock on that resource. Reuse `local.post_status_codes`, `local.error_selection_patterns`, and the CORS locals. Add both the POST and OPTIONS methods to `local.method_docs` in `terraform/documentation.tf`. That creates the Documentation tab entries and publishes a new documentation version because the version id is a hash of those descriptions. The `dev` stage already points at `aws_api_gateway_documentation_version.published`.
6. Let API Gateway invoke that method only. `source_arn` is `"${aws_api_gateway_rest_api.tweeter.execution_arn}/*/POST/<path>"`.
7. Add the new integration, responses, and permission to `aws_api_gateway_deployment.dev` `depends_on`, and include them in `triggers.redeployment`. Otherwise the `dev` stage keeps serving the previous API.
8. Add an output in `terraform/outputs.tf`: `"${aws_api_gateway_stage.dev.invoke_url}/<path>"`.
9. Once a second route exists, replace copied method blocks with one map of routes and `for_each`. Do not keep cloning the GetFollowees resources.

Do not add the other operations, S3, DynamoDB, or SQS unless the task asks for them. Do not change a handler's request or response types to fit API Gateway.

## Checks

From `terraform/`, `terraform init -backend=false` and `terraform validate` must pass. Run `terraform apply` only when the task says to deploy. After apply, call the new handler directly and POST that same JSON to the new URL. The status is 200, `Access-Control-Allow-Origin` is `*`, and the body equals the handler's return value. Delete every temporary test file, test script, and test-only dependency before finishing. Do not test the 400 and 500 patterns unless that handler throws `[Bad Request]` or `[Server Error]`.
