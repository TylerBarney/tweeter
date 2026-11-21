# Successful status post

`submitPost(MouseEvent)` starts at the filled circle. The circle is not an object. After the success message, the presenter deletes that toast and returns `void` to `PostStatus`, which then finishes `doAsync`.

```mermaid
---
config:
  sequence:
    mirrorActors: false
  themeCSS: "line.actor-line[name='Found']{display:none} g[data-id='Found'] text{display:none} rect[name='Found']{fill:#000;stroke:#000;filter:none;x:68px;y:116px;width:14px;height:14px;rx:7px;ry:7px}"
---
sequenceDiagram
    participant Found as ●
    participant PostStatus
    participant Presenter as PostStatusPresenter
    participant ClientStatusService as StatusService (client)
    participant ServerFacade
    participant ClientCommunicator
    box rgb(232, 240, 254) AWS
        participant APIGateway as API Gateway
    end
    participant PostStatusLambda

    Found->>PostStatus: submitPost(MouseEvent)
    activate PostStatus
    PostStatus->>PostStatus: await doAsync(Function)
    activate PostStatus
    PostStatus->>PostStatus: setIsLoading(true)
    activate PostStatus
    PostStatus-->>PostStatus: void
    deactivate PostStatus
    PostStatus->>Presenter: await submitPost(string, User, AuthToken)
    activate Presenter
    Presenter->>Presenter: await doInfoMessageOperation(string, Function, string)
    activate Presenter
    Presenter->>Presenter: await doFailureReportingOperation(Function, string, Function)
    activate Presenter
    Presenter->>PostStatus: displayInfoMessage(string, number)
    activate PostStatus
    PostStatus-->>Presenter: string
    deactivate PostStatus
    Presenter->>ClientStatusService: await postStatus(AuthToken, Status)
    activate ClientStatusService
    ClientStatusService->>ServerFacade: await postStatus(PostStatusRequest)
    activate ServerFacade
    ServerFacade->>ServerFacade: await post(PostStatusRequest, string)
    activate ServerFacade
    ServerFacade->>ClientCommunicator: await doPost(PostStatusRequest, string)
    activate ClientCommunicator
    ClientCommunicator->>ClientCommunicator: getUrl(string)
    activate ClientCommunicator
    ClientCommunicator-->>ClientCommunicator: string
    deactivate ClientCommunicator
    ClientCommunicator->>ClientCommunicator: getParams(string, Headers, BodyInit)
    activate ClientCommunicator
    ClientCommunicator-->>ClientCommunicator: RequestInit
    deactivate ClientCommunicator
    ClientCommunicator->>APIGateway: await fetch(string, RequestInit)
    activate APIGateway
    APIGateway->>PostStatusLambda: handler(PostStatusRequest)
    activate PostStatusLambda
    create participant ServerStatusService as StatusService (server)
    PostStatusLambda->>ServerStatusService: new StatusService()
    PostStatusLambda->>ServerStatusService: await postStatus(string, StatusDto)
    activate ServerStatusService
    ServerStatusService-->>PostStatusLambda: void
    deactivate ServerStatusService
    PostStatusLambda-->>APIGateway: TweeterResponse
    deactivate PostStatusLambda
    APIGateway-->>ClientCommunicator: TweeterResponse
    deactivate APIGateway
    ClientCommunicator-->>ServerFacade: TweeterResponse
    deactivate ClientCommunicator
    ServerFacade-->>ServerFacade: TweeterResponse
    deactivate ServerFacade
    ServerFacade-->>ClientStatusService: void
    deactivate ServerFacade
    ClientStatusService-->>Presenter: void
    deactivate ClientStatusService
    Presenter->>Presenter: clearPost()
    activate Presenter
    Presenter->>PostStatus: setPost(string)
    activate PostStatus
    PostStatus-->>Presenter: void
    deactivate PostStatus
    deactivate Presenter
    Presenter->>PostStatus: displayInfoMessage(string, number)
    activate PostStatus
    PostStatus-->>Presenter: string
    deactivate PostStatus
    Presenter->>PostStatus: deleteMessage(string)
    activate PostStatus
    PostStatus-->>Presenter: void
    deactivate PostStatus
    deactivate Presenter
    deactivate Presenter
    Presenter-->>PostStatus: void
    deactivate Presenter
    PostStatus->>PostStatus: setIsLoading(false)
    activate PostStatus
    deactivate PostStatus
    PostStatus-->>PostStatus: void
    deactivate PostStatus
    deactivate PostStatus
```
