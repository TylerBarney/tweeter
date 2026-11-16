# Architecture

## Current client

The client calls the deployed API. The lambdas still return `FakeData`. DAOs are not built yet. Today the client looks like this:

```
view (React components and hooks)
  → presenter (view interface / observer)
    → service (application logic)
      → ServerFacade
        → ClientCommunicator
          → API Gateway
```

Async service calls return to the presenter with async/await. The presenter never updates the screen itself. It calls methods on its view (show an error, add a page of items, navigate, enable or disable a control).

## Views

`tweeter-web/src/components`. Routes in `App.tsx`: `/login`, `/register`, and, once signed in, `/feed/:alias`, `/story/:alias`, `/followees/:alias`, `/followers/:alias`. A signed-in user lands on their feed.

`ItemScroller` is the one paged list. It takes a presenter factory and an `itemComponentFactory` that turns an item into a user row or a status row.

## Presenters

`tweeter-web/src/presenter`.

- `Presenter` holds the view and `doFailureReportingOperation` (try, report failure through the view, optional finally).
- `MessagePresenter` adds an info toast around an operation. Used by post status, logout, and the user-info follow button.
- `AuthenticationPresenter` runs login or register, then tells the view the user is authenticated and where to navigate.
- `PagedItemPresenter` is the paging template: remember the last item, ask the service for the next page, tell the view to append items. `UserItemPresenter` and `StatusItemPresenter` specialize it. Followers, followees, feed, and story are the concrete classes.
- `UserNavigationHooksPresenter` resolves an alias to a user so mention links can navigate.

## Services

`tweeter-web/src/model.service`. Three classes cover the 14 operations. Each builds a request object and passes it to `ServerFacade` in `tweeter-web/src/network`. The service classes do not import the shared request or response types. `ServerFacade` receives the request and returns domain objects. `ClientCommunicator` performs the POST.

**UserService:** get user, login, register, logout.

**FollowService:** page of followees, page of followers, follow, unfollow, followee count, follower count, is-follower.

**StatusService:** page of story, page of feed, post status.

## Tests

- `tweeter-web/test/presenter/AppNavBarPresenter.test.ts` — logout messaging, the service call, and the success versus failure view updates.
- `tweeter-web/test/presenter/PostStatusPresenter.test.ts` — the same shape for posting a status.
- `tweeter-web/test/components/authentication/login/Login.test.tsx` — sign-in button enablement and that the presenter is called with the typed alias and password.
- `tweeter-web/test/components/postStatus/PostStatus.test.tsx` — Post and Clear button enablement, with `useUserInfo` mocked.

## Deployed API

POST `/followee/list`, POST `/follower/list`, POST `/followee/count`, POST `/follower/count`, POST `/follower/status`, POST `/follow`, POST `/unfollow`, POST `/user/get`, POST `/user/login`, POST `/user/register`, POST `/user/logout`, POST `/stories/list`, POST `/feed/list`, and POST `/status/post` are the live routes. API Gateway sends each JSON body to its Lambda as the event. The list handlers call the matching server service and still return `FakeData`. `GetFolloweeCount` and `GetFollowerCount` call `FollowService.getFolloweeCount` and `FollowService.getFollowerCount` and return a `FollowCountResponse`. `GetFollowerStatus` calls `FollowService.getIsFollowerStatus` and returns a `FollowerStatusResponse`. `Follow` and `Unfollow` call `FollowService.follow` and `FollowService.unfollow` and return a `FollowResponse`. `GetUser` calls `UserService.getUser` and returns a `UserResponse`. `Login` and `Register` call `UserService.login` and `UserService.register` and return an `AuthenticationResponse`. `Logout` calls `UserService.logout` and returns a `TweeterResponse`. `PostStatus` calls `StatusService.postStatus` and returns a `TweeterResponse`. The integration is `AWS`, not `AWS_PROXY`, so each handler takes a request DTO and returns a response DTO. HTTP 200 is that return value. HTTP 400 and 500 happen only when the Lambda throws `[Bad Request]` or `[Server Error]`.

Region, shared role, layer, zip layout, CORS, and the steps for the next route are in [lambda-api.md](lambda-api.md).

## Target

Same views and presenters. Client services stop reading `FakeData` and call the server. Request and response types live in `tweeter-shared`. New operations follow the deployed `GetFollowees` route.

```
view → presenter → client service
  → ServerFacade → ClientCommunicator
    → API Gateway → Lambda → server service → DAO
```

- `tweeter-server` depends on `tweeter-shared`. One Lambda per feature delegates to a server-side service. Those services are the home of the data access that is in the client services now.
- API Gateway exposes one endpoint per feature. Use POST for every endpoint, and put the auth token in the JSON body when a call needs it. Login and register responses carry a token.
- `ServerFacade` has one method per endpoint, receives the shared request, and uses `ClientCommunicator` for the HTTP call. Client services build that request and return domain objects to presenters. They do not import the request or response types.
- Server services go through DAOs. Users, sessions, follows, and statuses are stored in DynamoDB. Passwords are hashed. Profile images are stored on S3. Tokens expire after inactivity. Unauthorized calls fail at the API.
- Posting a status updates the author's story and the feeds of current followers off the request path, so a large follower count does not make the post call fall over. A feed includes a status only when the viewer followed the author at post time. Older feed entries stay after an unfollow.
- Until the DAOs exist, the server services can keep returning the same dummy data through the API. The client still must not touch `FakeData`.
- Add Lambdas and routes in `terraform/`, reusing the role, layer, function zip, API, and `dev` stage. See [lambda-api.md](lambda-api.md).
- Integration tests call the facade directly for register, a followers page, and a follow count, and call `StatusService` for a successful story page. Assert the returned data, not only that a call completed.
