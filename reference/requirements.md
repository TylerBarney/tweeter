# Requirements

"A signed-in user can" means only a signed-in user can. "A user can" means the action works whether or not they are signed in.

## Session

- Sign-up takes name, alias, password, and a profile image, then signs the user in and opens an empty feed.
- Passwords are stored as hashes. Profile images are stored on S3. The current client does neither.
- Sign-in takes alias and password and opens that user's feed.
- Auth tokens expire after a period of inactivity. Login returns a token, and later calls send it.
- A signed-in user can sign out.

## Statuses

- A signed-in user can post a status. It is then added to the feeds of the author's followers.
- The signed-in user's default view is their feed: statuses from followees, newest first.
- Anyone can open a user's story (all of that user's statuses, newest first), including from an `@mention` link.

## Follows

- Anyone can list a user's followees and followers, including their own, and can see both counts.
- A signed-in user can follow any number of other users, except themselves and users they already follow.
- A signed-in user can unfollow only someone they follow. Past feed entries from that user remain. New ones are not added.
- Counts update when someone follows or unfollows.

## Interface

Main views are paged lists of statuses or users. Another page loads when the reader reaches the bottom. Status rows show the author's photo and turn mentions and URLs into links. A mention opens that user's story, which also reaches their followers and followees. Actions that do not apply (for example follow when already following, or when logged out) are disabled or omitted. Errors are shown the same way across views.
