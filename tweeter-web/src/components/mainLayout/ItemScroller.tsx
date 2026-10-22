import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "react-router-dom";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserInfoHooks";
import {
  PagedItemPresenter,
  PagedItemView,
} from "../../presenter/PagedItemPresenter";
import { Service } from "../../model.service/Service";
import usePresenter from "../hooks/usePresenter";

interface Props<T, S extends Service> {
  featureUrl: string;
  presenterFactory: (view: PagedItemView<T>) => PagedItemPresenter<T, S>;
  itemComponentFactory: (item: T, featurePath: string) => JSX.Element;
}

const ItemScroller = <T, S extends Service>(props: Props<T, S>) => {
  const { displayErrorMessage } = useMessageActions();
  const [items, setItems] = useState<T[]>([]);

  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const { displayedUser: displayedUserAliasParam } = useParams();

  const listener: PagedItemView<T> = {
    addItems: (newItems: T[]) =>
      setItems((previousItems) => [...previousItems, ...newItems]),
    displayErrorMessage: displayErrorMessage,
  };

  const presenter = usePresenter(
    () => listener,
    (view) => props.presenterFactory(view),
  );

  // Update the displayed user context variable whenever the displayedUser url parameter changes. This allows browser forward and back buttons to work correctly.
  useEffect(() => {
    if (
      authToken &&
      displayedUserAliasParam &&
      displayedUserAliasParam != displayedUser!.alias
    ) {
      presenter.getUser(authToken!, displayedUserAliasParam!).then((toUser) => {
        if (toUser) {
          setDisplayedUser(toUser);
        }
      });
    }
  }, [displayedUserAliasParam]);

  // Initialize the component whenever the displayed user changes
  useEffect(() => {
    reset();
    loadMoreItems();
  }, [displayedUser]);

  const reset = async () => {
    setItems(() => []);
    presenter.reset();
  };

  const loadMoreItems = async () => {
    presenter.loadMoreItems(authToken!, displayedUser!.alias);
  };

  return (
    <div className="container px-0 overflow-visible vh-100">
      <InfiniteScroll
        className="pr-0 mr-0"
        dataLength={items.length}
        next={() => loadMoreItems()}
        hasMore={presenter.hasMoreItems}
        loader={<h4>Loading...</h4>}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="row mb-3 mx-0 px-0 border rounded bg-white"
          >
            {props.itemComponentFactory(item, props.featureUrl)}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default ItemScroller;
