// AI-assisted: see AI-ATTRIBUTION.md
export interface View {
  displayErrorMessage: (message: string) => void;
}

export abstract class Presenter<V extends View> {
  private _view: V;
  public constructor(view: V) {
    this._view = view;
  }

  protected get view() {
    return this._view;
  }

  private messageFor(error: unknown, operationDescription: string): string {
    const message = (error instanceof Error ? error.message : "").trim();
    return message.length > 0 ? message : `Could not ${operationDescription}`;
  }

  //functions as parameters allows us to remove duplicate code by factoring out alogrithms who
  // only differ slightly on a handlful of operations. We pass the differing operations as a function into the
  // factored out algorithm. In this case the Presenter class has
  // a method which takes functions as a parameter to perform an operation and while doing error handling
  // It is used in almost all the child Presenter classes to remove the complexities of error handling.
  protected async doFailureReportingOperation(
    operation: () => Promise<void>,
    operationDescription: string,
    finallyOperation?: () => void,
  ) {
    try {
      await operation();
    } catch (error) {
      this.view.displayErrorMessage(
        this.messageFor(error, operationDescription),
      );
    } finally {
      finallyOperation?.();
    }
  }
}
