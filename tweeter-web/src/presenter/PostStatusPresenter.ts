import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";
import { MessagePresenter, MessageView } from "./MessagePresenter";

export interface PostStatusView extends MessageView {
  setPost: (post: string) => void;
}

export class PostStatusPresenter extends MessagePresenter<PostStatusView> {
  private service: StatusService = new StatusService();

  public async submitPost(
    post: string,
    currentUser: User,
    authToken: AuthToken,
  ) {
    await this.doInfoMessageOperation(
      "Posting status...",
      async () => {
        const status = new Status(post, currentUser, Date.now());

        await this.service.postStatus(authToken!, status);

        this.clearPost();
        this.view.displayInfoMessage("Status posted!", 2000);
      },
      "post the status",
    );
  }

  public clearPost(): void {
    this.view.setPost("");
  }
}
