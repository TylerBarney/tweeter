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

## 2026-11-15: tweeter-shared/src/model/net/request/RegisterRequest.ts (new file), tweeter-shared/src/model/net/response/AuthenticationResponse.ts (new file), tweeter-shared/src/model/net/response/LoginResponse.ts (deleted), tweeter-shared/src/index.ts, tweeter-server/src/lambda/user/AuthenticationHandler.ts (new file), tweeter-server/src/lambda/user/LoginLambda.ts, tweeter-server/src/lambda/user/RegisterLambda.ts (new file), tweeter-server/src/model/service/UserService.ts, terraform/lambda.tf, terraform/api.tf, terraform/outputs.tf, tweeter-server/function.zip, tweeter-server/layer.zip, reference/lambda-api.md, reference/architecture.md, AGENTS.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add RegisterLambda and POST /user/register. RegisterRequest extends LoginRequest, register returns a UserDto and AuthTokenDto, and LoginResponse is renamed to AuthenticationResponse. Login and register share one handler and one service helper.
- Review: Had to correct changing the image into a string.

## 2026-11-15: tweeter-server/src/lambda/user/LogoutLambda.ts (new file), tweeter-server/src/model/service/UserService.ts, terraform/lambda.tf, terraform/api.tf, terraform/outputs.tf, tweeter-server/function.zip, tweeter-server/layer.zip, reference/lambda-api.md, reference/architecture.md, AGENTS.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add LogoutLambda and POST /user/logout. The request is a TokenRequest, logout takes a token string, and the response is a TweeterResponse.
- Review: Everything looked good

## 2026-11-15: tweeter-web/src/network/ClientCommunicator.ts (new file), tweeter-web/src/network/ServerFacade.ts (new file), tweeter-web/src/model.service/UserService.ts, tweeter-web/src/model.service/FollowService.ts, tweeter-web/src/model.service/StatusService.ts, tweeter-shared/src/index.ts, reference/architecture.md, AGENTS.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add ClientCommunicator and ServerFacade, and change the client services to call all 14 deployed endpoints instead of FakeData.
- Review: Did a surprisingly great job. Even removed the duplication

## 2026-11-16: tweeter-web/test/network/ServerFacade.integration.test.ts (new file), tweeter-web/test/model.service/StatusService.integration.test.ts (new file), tweeter-web/src/model.service/Service.ts, tweeter-web/src/model.service/UserService.ts, tweeter-web/src/model.service/FollowService.ts, tweeter-web/src/model.service/StatusService.ts, tweeter-web/package.json, package-lock.json, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add Jest integration tests that call the deployed API through ServerFacade for register, followers, and follow counts, and through StatusService for a successful story page.
- Review: Had to fix tests to load consecutive pages rather than just testing one page retrival. Added spies to StatusService integration tests. Edited Service classes so I could stub in a ServerFacade.

## 2026-11-16: tweeter-shared/src/model/net/request/PagedItemRequest.ts, tweeter-server/src/lambda/PagedItemHandler.ts, tweeter-server/src/model/service/UserService.ts, tweeter-web/src/model.service/Service.ts, tweeter-web/src/model.service/FollowService.ts, tweeter-web/src/model.service/StatusService.ts, tweeter-web/src/model.service/UserService.ts, tweeter-web/src/network/ServerFacade.ts, tweeter-web/test/model.service/StatusService.integration.test.ts, tweeter-web/test/network/ServerFacade.integration.test.ts, reference/lambda-api.md, reference/architecture.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Make PagedItemRequest extend UserRequest and use the inherited alias field, updating the paged handler, tests, and API docs. Web services still build the requests they pass to ServerFacade, through a shared helper, and do not import request or response types.
- Review: Everything looked good for the most part but had to make a couple of changes to the service and server facade to match my style.

## 2026-11-16: docs/diagrams/post-status-success.mmd, docs/diagrams/post-status-success.md, docs/diagrams/post-status-success.png, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: create post status sequence diagram
- Review: Lots of little edits of functions left out and styling issue. Overall good, just missed a couple of things.

## 2026-11-20: .cursor/environment.json (new file), AGENTS.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Set up this repo for cloud agent support with an environment install, the Vite dev server, and cloud-specific instructions.
- Review: Worked well.

## 2026-11-20: terraform/data.tf (new file), terraform/lambda.tf, terraform/outputs.tf, reference/lambda-api.md, reference/architecture.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add DynamoDB tables, a public S3 bucket for profile images, and Lambda permissions so the existing functions can use both.
- Review: Had to make tweeks to the DynamoDB table set up. But mostly good.

## 2026-11-22: terraform/data.tf, reference/dynamoDB.md (new file), reference/lambda-api.md, reference/architecture.md, AGENTS.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Revise the DynamoDB table keys to match the class design, and record the schemas in reference/dynamoDB.md instead of lambda-api.md and architecture.md.
- Review: Had to make a change or two to the suggested table design. Also had to test deployment worked.

## 2026-11-22: tweeter-server/src/model/dao/DataPage.ts (new file), tweeter-server/src/model/dao/FollowDao.ts (new file), AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add the database-agnostic FollowDao interface and the DataPage type its paged methods return.
- Review: Looked good.

## 2026-11-22: tweeter-server/src/model/dao/DaoFactory.ts (new file), tweeter-server/src/model/service/Service.ts, tweeter-server/src/model/service/FollowService.ts, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add the DaoFactory and route FollowService through the shared Service base so follow operations receive their DAOs from the factory.
- Review: Had to fix the DaoFactory calls on the FollowService.

## 2026-11-22: tweeter-server/src/model/dao/UserDao.ts (new file), tweeter-server/src/model/dao/ImageDao.ts (new file), tweeter-server/src/model/dao/AuthTokenDao.ts (new file), tweeter-server/src/model/service/UserService.ts, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add the UserDao, ImageDao, and AuthTokenDao interfaces, and route UserService through them for lookup, registration, login, and logout.
- Review: Again had to fix the DaoFactory calls on the UserService.

## 2026-11-22: tweeter-server/src/model/dao/StatusDao.ts (new file), tweeter-server/src/model/service/StatusService.ts, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add the StatusDao interface and route StatusService through it for story pages, feed pages, and posting a status.
- Review: All looked good

## 2026-11-22: tweeter-server/src/model/dao/defaultFactory.ts (new file), tweeter-server/src/model/dao/fake/FakeDao.ts (new file), tweeter-server/src/model/dao/fake/FakeUserDao.ts (new file), tweeter-server/src/model/dao/fake/FakeAuthTokenDao.ts (new file), tweeter-server/src/model/dao/fake/FakeFollowDao.ts (new file), tweeter-server/src/model/dao/fake/FakeStatusDao.ts (new file), tweeter-server/src/model/dao/fake/FakeImageDao.ts (new file), tweeter-server/src/model/dao/fake/FakeDaoFactory.ts (new file), reference/architecture.md, reference/lambda-api.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add the fake DAO implementations and the default factory that supplies them, and record in the reference docs that services read FakeData through those DAOs.
- Review: All looked good. Ran the tests and they still pass

## 2026-11-22: tweeter-server/src/model/dao/dynamo/documentClient.ts (new file), tweeter-server/src/model/dao/dynamo/DynamoDao.ts (new file), tweeter-server/src/model/dao/dynamo/DynamoFollowDao.ts (new file), tweeter-server/package.json, tweeter-server/package-lock.json, tweeter-server/scripts/package-lambda.sh, reference/lambda-api.md, tweeter-server/tsconfig.json, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add a DynamoDB FollowDao that pages follows, loads the matching users, and updates follow counts in one transaction. Include the DynamoDB SDK in the Lambda layer.
- Review: Had to add query page options type for easier readability

## 2026-11-23: tweeter-server/src/model/dao/dynamo/DynamoUserDao.ts (new file), tweeter-server/src/model/dao/dynamo/DynamoDao.ts, tweeter-server/src/model/dao/dynamo/DynamoFollowDao.ts, tweeter-server/package.json, tweeter-server/package-lock.json, tweeter-server/scripts/package-lambda.sh, reference/lambda-api.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add a DynamoDB UserDao that loads a user by alias and registers a new user when the alias is free. Password hashing is left for a later step.
- Review: Implemented password hashing at first so I had to remove it.

## 2026-11-23: tweeter-server/src/model/dao/dynamo/S3ImageDao.ts (new file), tweeter-server/src/model/dao/dynamo/lazy.ts (new file), tweeter-server/src/model/dao/dynamo/documentClient.ts, tweeter-server/package.json, tweeter-server/package-lock.json, tweeter-server/scripts/package-lambda.sh, reference/lambda-api.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add an S3 ImageDao in the Dynamo package that stores a public profile image and returns its URL.
- Review: Had to fix the error handling for putting an image.

## 2026-11-23: tweeter-server/src/model/dao/dynamo/DynamoAuthTokenDao.ts (new file), tweeter-server/src/model/dao/dynamo/DynamoDao.ts, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add a DynamoDB AuthTokenDao that creates a 30-minute session, renews it on lookup, rejects an expired token, and deletes it on logout.
- Review: Removed unnecessary helpers.

## 2026-11-23: tweeter-server/src/model/dao/dynamo/DynamoStatusDao.ts (new file), tweeter-server/src/model/dao/dynamo/DynamoDao.ts, tweeter-server/src/model/dao/dynamo/DynamoFollowDao.ts, tweeter-server/src/model/service/StatusService.ts, tweeter-server/src/model/dao/FollowDao.ts, tweeter-server/src/model/dao/StatusDao.ts, tweeter-server/src/model/dao/fake/FakeFollowDao.ts, tweeter-server/src/model/dao/fake/FakeStatusDao.ts, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add DynamoDB story and feed DAOs that page statuses newest first and copy a post into each follower's feed.
- Review: Lots of small fixes with the factory, separating the FeedDao and StoryDao.

## 2026-11-23: tweeter-server/src/model/dao/dynamo/DynamoDaoFactory.ts (new file), tweeter-server/src/model/dao/defaultFactory.ts, reference/architecture.md, reference/lambda-api.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Add a Dynamo DAO factory that creates each DAO on first use, and make it the default factory.
- Review: All looked good.

## 2026-11-23: tweeter-server/src/model/service/AuthorizationService.ts (new file), tweeter-server/src/lambda/authorizeRequest.ts (new file), tweeter-server/src/model/dao/dynamo/DynamoUserDao.ts, tweeter-server/src/model/service/UserService.ts, tweeter-server/src/lambda/PagedItemHandler.ts, tweeter-server/src/lambda/follow/FollowHandler.ts, tweeter-server/src/lambda/follow/FollowCountHandler.ts, tweeter-server/src/lambda/follow/GetFollowerStatusLambda.ts, tweeter-server/src/lambda/user/GetUserLambda.ts, tweeter-server/src/lambda/user/LogoutLambda.ts, tweeter-server/src/lambda/status/PostStatusLambda.ts, tweeter-server/package.json, tweeter-server/package-lock.json, tweeter-server/scripts/package-lambda.sh, reference/lambda-api.md, AI-ATTRIBUTION.md

- Tool: Cursor (Grok 4.7)
- Task: Hash passwords with bcryptjs, and require a valid session in every Lambda that receives a token.
- Review: Moved password hashing into the service, rather than the dao because I want it to live in one place.
