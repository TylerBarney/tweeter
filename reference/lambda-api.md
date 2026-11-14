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

## Current routes

POST `/followee/list` invokes function `GetFollowees`, handler `lambda/follow/GetFolloweesLambda.handler`. It calls `FollowService.loadMoreFollowees`. Terraform output `followee_list_url` is the deployed URL.

POST `/follower/list` invokes function `GetFollowers`, handler `lambda/follow/GetFollowersLambda.handler`. It calls `FollowService.loadMoreFollowers`. Terraform output `follower_list_url` is the deployed URL.

Both follow events are a `PagedUserItemRequest`: `token`, `userAlias`, `pageSize` (a JSON number), and `lastItem` (`UserDto` or null). Both return a `PagedUserItemResponse`: `success`, `message`, `hasMore`, and `items`. Both services still use `FakeData`.

POST `/stories/list` invokes function `GetStories`, handler `lambda/status/GetStoriesLambda.handler`. It calls `StatusService.loadMoreStoryItems`. Terraform output `stories_list_url` is the deployed URL.

POST `/feed/list` invokes function `GetFeed`, handler `lambda/status/GetFeedLambda.handler`. It calls `StatusService.loadMoreFeedItems`. Terraform output `feed_list_url` is the deployed URL.

Both status-page events are a `PagedUserStatusItemRequest`: `token`, `userAlias`, `pageSize`, and `lastItem` (`StatusDto` or null). Both return a `PagedStatusItemResponse`. Both services still use `FakeData`.

POST `/status/post` invokes function `PostStatus`, handler `lambda/status/PostStatusLambda.handler`. It calls `StatusService.postStatus`. Terraform output `status_post_url` is the deployed URL. The event is a `PostStatusRequest`: `token` and `newStatus` (`StatusDto`). The return value is a `TweeterResponse`: `success` and `message`. `postStatus` still only pauses and does not store the status.

`TweeterRequest` is `token` only. A request that pages by user adds `userAlias` on `PagedItemRequest`. `PostStatusRequest` does not have `userAlias`.

Handlers live in `local.lambda_handlers` in `terraform/lambda.tf`. Routes live in `local.routes` in `terraform/api.tf`. A route key is the path without a leading slash, such as `follower/list`. The first segment is the parent resource, so another route under `/followee/...` reuses that parent and adds a sibling of `list`. POST, OPTIONS, CORS, the 400 and 500 selection patterns, the invoke permission, the deployment trigger, and `local.method_docs` are all generated from those maps.

## Adding another function and route

1. Add `tweeter-server/src/lambda/<area>/<Name>Lambda.ts`. Export `handler`. The argument is the shared request type, not an API Gateway proxy event. Return the shared response type. Call the server service. Throw a message starting with `[Bad Request]` or `[Server Error]` only when that status is required.
2. Export any new shared request or response type from `tweeter-shared/src/index.ts` by name.
3. From `tweeter-server`, run `npm run package:lambda`. That rebuilds both zips. Do not zip inside Terraform.
4. Add one entry to `local.lambda_handlers`. `function_name` is the handler name, such as `GetFollowers`. `handler` is the path under `dist` without `.js`, plus `.handler`, such as `lambda/follow/GetFollowersLambda.handler`. Every function already shares the zip, hash, `nodejs24.x` runtime, role, layer, policy-attachment dependency, and zip-file precondition.
5. Add one entry to `local.routes`. The key is the path, such as `follower/list`. `function_key` matches the lambda map. `description` is the POST method documentation. That entry creates the path resources, the POST integration (`AWS`, not `AWS_PROXY`, template `$input.json('$')`, authorization `NONE`), the 200, 400, and 500 responses, the OPTIONS mock, the invoke permission for `/*/POST/<path>` only, and both Documentation tab entries. The documentation version id is a hash of those descriptions, and the `dev` stage already points at `aws_api_gateway_documentation_version.published`.
6. The deployment already depends on the route resources and hashes `local.routes`. A new map entry redeploys the `dev` stage. Do not add a copied method block.
7. Add an output in `terraform/outputs.tf`: `"${aws_api_gateway_stage.dev.invoke_url}/<path>"`.

Do not add the other operations, S3, DynamoDB, or SQS unless the task asks for them. Do not change a handler's request or response types to fit API Gateway.

## Checks

From `terraform/`, `terraform init -backend=false` and `terraform validate` must pass. Run `terraform apply` only when the task says to deploy. After apply, call the new handler directly and POST that same JSON to the new URL. The status is 200, `Access-Control-Allow-Origin` is `*`, and the body equals the handler's return value. Delete every temporary test file, test script, and test-only dependency before finishing. Do not test the 400 and 500 patterns unless that handler throws `[Bad Request]` or `[Server Error]`.
