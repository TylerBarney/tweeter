import { Presenter, View } from "./Presenter";

export interface MessageView extends View {
  displayInfoMessage: (
    message: string,
    duration: number,
    bootstrapClasses?: string | undefined,
  ) => string;
  deleteMessage: (message: string) => void;
}
export class MessagePresenter<V extends MessageView> extends Presenter<V> {
  protected async doInfoMessageOperation(
    message: string,
    operation: () => Promise<void>,
    operationDescription: string,
  ): Promise<void> {
    var toast = "";
    await this.doFailureReportingOperation(
      async () => {
        toast = this.view.displayInfoMessage(message, 0);
        await operation();
      },
      operationDescription,
      () => this.view.deleteMessage(toast),
    );
  }
}
