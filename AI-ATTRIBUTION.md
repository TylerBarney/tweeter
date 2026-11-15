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

## 2026-11-14: tweeter-shared/src/model/net/request/FollowCountRequest.ts (new file), tweeter-shared/src/model/net/response/FollowCountResponse.ts (new file), tweeter-shared/src/index.ts, tweeter-server/src/lambda/follow/GetFolloweeCountLambda.ts (new file), tweeter-server/src/model/service/FollowService.ts, terraform/lambda.tf, terraform/api.tf, terraform/outputs.tf, tweeter-server/function.zip, tweeter-server/layer.zip, reference/lambda-api.md, reference/architecture.md, AGENTS.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add GetFolloweeCountLambda and POST /followee/count, and change getFolloweeCount to take a token and a UserDto.
- Review: Had to correct some follow count duplication but otherwise worked well.

## 2026-11-14: tweeter-server/src/lambda/follow/FollowCountHandler.ts (new file), tweeter-server/src/lambda/follow/GetFolloweeCountLambda.ts, tweeter-server/src/lambda/follow/GetFollowerCountLambda.ts (new file), tweeter-server/src/model/service/FollowService.ts, terraform/lambda.tf, terraform/api.tf, terraform/outputs.tf, tweeter-server/function.zip, tweeter-server/layer.zip, reference/lambda-api.md, reference/architecture.md, AGENTS.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add GetFollowerCountLambda and POST /follower/count, and share the follow-count handler and fake-count lookup with the followee count.
- Review: Changed some of the mark down files to reduce verboseness. Also removed some unnecessary and overly complicated lines of code from FollowService.ts

## 2026-11-15: tweeter-shared/src/model/net/request/FollowRequest.ts (new file), tweeter-shared/src/model/net/request/FollowCountRequest.ts (deleted), tweeter-shared/src/model/net/response/FollowResponse.ts (new file), tweeter-shared/src/index.ts, tweeter-server/src/lambda/follow/FollowLambda.ts (new file), tweeter-server/src/lambda/follow/FollowCountHandler.ts, tweeter-server/src/model/service/FollowService.ts, terraform/lambda.tf, terraform/api.tf, terraform/outputs.tf, tweeter-server/function.zip, tweeter-server/layer.zip, reference/lambda-api.md, reference/architecture.md, AGENTS.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add FollowLambda and POST /follow, change follow to take a token and a UserDto.
- Review: Introduced Code duplication with FollowRequest interface and FollowCountRequest. Factored out duplication with a single FollowRequest

## 2026-11-15: tweeter-server/src/lambda/follow/FollowHandler.ts (new file), tweeter-server/src/lambda/follow/FollowLambda.ts, tweeter-server/src/lambda/follow/UnfollowLambda.ts (new file), tweeter-server/src/model/service/FollowService.ts, terraform/lambda.tf, terraform/api.tf, terraform/outputs.tf, tweeter-server/function.zip, tweeter-server/layer.zip, reference/lambda-api.md, reference/architecture.md, AGENTS.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add UnfollowLambda and POST /unfollow, share the follow response handler with Follow, and change unfollow to take a token and a UserDto.
- Review: Everything looked good

## 2026-11-15: tweeter-shared/src/model/net/request/FollowerStatusRequest.ts (new file), tweeter-shared/src/model/net/response/FollowerStatusResponse.ts (new file), tweeter-shared/src/index.ts, tweeter-server/src/lambda/follow/GetFollowerStatusLambda.ts (new file), tweeter-server/src/model/service/FollowService.ts, terraform/lambda.tf, terraform/api.tf, terraform/outputs.tf, tweeter-server/function.zip, tweeter-server/layer.zip, reference/lambda-api.md, reference/architecture.md, AGENTS.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add GetFollowerStatusLambda and POST /follower/status, and change getIsFollowerStatus to take a token and two UserDtos.
- Review: Everything looked good

## 2026-11-15: tweeter-shared/src/model/net/request/TweeterRequest.ts, tweeter-shared/src/model/net/request/TokenRequest.ts (new file), tweeter-shared/src/model/net/request/PagedItemRequest.ts, tweeter-shared/src/model/net/request/PostStatusRequest.ts, tweeter-shared/src/model/net/request/FollowRequest.ts, tweeter-shared/src/model/net/request/UserRequest.ts (new file), tweeter-shared/src/model/net/response/UserResponse.ts (new file), tweeter-shared/src/index.ts, tweeter-server/src/lambda/user/GetUserLambda.ts (new file), tweeter-server/src/model/service/UserService.ts, terraform/lambda.tf, terraform/api.tf, terraform/outputs.tf, tweeter-server/function.zip, tweeter-server/layer.zip, reference/lambda-api.md, reference/architecture.md, AGENTS.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Make TweeterRequest empty, add TokenRequest, and add GetUserLambda and POST /user/get that returns a UserDto or null.
- Review: Had to guide it through some inhertiance issues. Otherwise all looked good

## 2026-11-15: tweeter-shared/src/model/dto/AuthTokenDto.ts (new file), tweeter-shared/src/model/domain/AuthToken.ts, tweeter-shared/src/model/net/request/LoginRequest.ts (new file), tweeter-shared/src/model/net/response/LoginResponse.ts (new file), tweeter-shared/src/index.ts, tweeter-server/src/lambda/user/LoginLambda.ts (new file), tweeter-server/src/model/service/UserService.ts, terraform/lambda.tf, terraform/api.tf, terraform/outputs.tf, tweeter-server/function.zip, tweeter-server/layer.zip, reference/lambda-api.md, reference/architecture.md, AGENTS.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add LoginLambda and POST /user/login. LoginRequest carries alias and password, login returns a UserDto and AuthTokenDto, and LoginResponse returns both.
- Review: Added way too much to the LoginLambda for all sorts of authentication checks. Had to remove it and simiplify.
