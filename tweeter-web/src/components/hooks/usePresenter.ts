import { useRef } from "react";
import { Presenter, View } from "../../presenter/Presenter";
const usePresenter = <V extends View, P extends Presenter<V>>(
  viewFactory: () => V,
  presenterFactory: (view: V) => P,
) => {
  const presenterRef = useRef<P | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = presenterFactory(viewFactory());
  }
  return presenterRef.current;
};

export default usePresenter;
