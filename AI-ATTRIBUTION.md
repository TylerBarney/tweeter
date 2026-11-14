## 2026-11-11: AGENTS.md (new file), reference/domain.md (new file), reference/requirements.md (new file), reference/architecture.md (new file), AI-ATTRIBUTION.md (new file)

- Tool: Cursor (Grok 4.7)
- Task: Add AGENTS.md for the Tweeter project, with short reference docs for the domain, requirements, current MVP architecture, and later goals, plus the AI attribution rule.
- Review: Everything looked good. Had to correct some of the current and future architecture writing but otherwise everything looked good.

## 2026-11-13: tweeter-server/scripts/package-lambda.sh (new file), tweeter-server/package.json, .gitignore, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add an npm script that builds the Lambda layer and function zips, including only tweeter-shared, date-fns, and uuid in the layer.
- Review: Reviewed and tested it. It was simple so it got it all right

## 2026-11-13: terraform/versions.tf (new file), terraform/lambda.tf (new file), terraform/api.tf (new file), terraform/outputs.tf (new file), terraform/.gitignore (new file), terraform/.terraform.lock.hcl (new file), AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add Terraform that deploys the GetFollowees Lambda and a non-proxy API Gateway POST /followee/list endpoint, using the existing function and layer zips.
- Review: There were a few API Gateway setups that needed to be changed. The layer created needed to be updated from node 20 to node24.

## 2026-11-13: AGENTS.md, reference/architecture.md, reference/lambda-api.md (new file), AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Document the deployed Lambda and API Gateway setup, and how future agents should add functions and routes, in AGENTS.md and the reference docs.
- Review: Everything looked good here.

## 2026-11-13: terraform/api.tf, terraform/documentation.tf (new file), reference/lambda-api.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Put API Gateway documentation parts and the published documentation version into documentation.tf
- Review: I questioned whether or not the right move was to move it to documentation.tf but after further research it was clear that we could not create the description in the same resource. So I had to put it in a documentation.tf file.

## 2026-11-13: tweeter-server/src/lambda/follow/GetFollowersLambda.ts (new file), terraform/lambda.tf, terraform/api.tf, terraform/documentation.tf, terraform/outputs.tf, reference/lambda-api.md, reference/architecture.md, AGENTS.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add GetFollowersLambda, deploy it as POST /follower/list through the shared API Gateway route map, and apply Terraform.
- Review: I had to correct some of the terraform for api gateway because it was only for a single endpoint and was not versatile for multiple endpoints. This created a lot of code duplication in terraform. Also the AI Attribution was in the wrong place in the log for some reason.

## 2026-11-13: tweeter-server/src/lambda/PagedItemHandler.ts (new file), tweeter-server/src/lambda/follow/GetFollowersLambda.ts, tweeter-server/src/lambda/follow/GetFolloweesLambda.ts, tweeter-server/src/lambda/status/GetStoriesLambda.ts, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Factor the shared paged-request handling out of GetFollowersLambda, GetFolloweesLambda, and GetStoriesLambda into one generic handler.
- Review: There were unused generics that had to be removed

## 2026-11-14: terraform/lambda.tf, terraform/api.tf, terraform/outputs.tf, tweeter-server/function.zip, tweeter-server/layer.zip, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Package GetStoriesLambda into the shared function zip, then add and deploy the GetStories Lambda and POST /stories/list on the existing API Gateway.
- Review: Everything looks perfect. Just needed to have it check more cases to ensure the lambda and gateway worked correctly

## 2026-11-14: tweeter-server/src/lambda/status/GetFeedLambda.ts (new file), tweeter-server/src/model/service/StatusService.ts, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add GetFeedLambda and change loadMoreFeedItems to return StatusDto pages through the existing getFakeData helper.
- Review: Did it perfectly

## 2026-11-14: terraform/lambda.tf, terraform/api.tf, terraform/outputs.tf, tweeter-server/function.zip, tweeter-server/layer.zip, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Package GetFeedLambda into the shared function zip, then add and deploy the GetFeed Lambda and POST /feed/list on the existing API Gateway.
- Review: Did it perfectly

## 2026-11-14: tweeter-shared/src/model/net/request/TweeterRequest.ts, tweeter-shared/src/model/net/request/PagedItemRequest.ts, tweeter-shared/src/model/net/request/PostStatusRequest.ts (new file), tweeter-shared/src/index.ts, tweeter-server/src/model/service/StatusService.ts, tweeter-server/src/lambda/status/PostStatusLambda.ts (new file), terraform/lambda.tf, terraform/api.tf, terraform/outputs.tf, tweeter-server/function.zip, tweeter-server/layer.zip, reference/lambda-api.md, reference/architecture.md, AGENTS.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add PostStatusLambda and POST /status/post, move userAlias off TweeterRequest onto paged requests, and change postStatus to take a StatusDto.
- Review: Struggled to test it correctly and needed aditional guidance
