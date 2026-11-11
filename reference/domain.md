# Domain

A **user** has a real name (first and last), one **alias** (the login handle, such as `matt`), and a profile photo.

A **status** is a short public post: text plus a timestamp, written by one user. The text can contain **user mentions** (`@` plus an alias) and **URLs**. Both are kinds of reference. A mention points at an alias.

A user's **story** is every status that user posted, newest first. The user owns that collection.

**Follow** is one-way. A follows B does not mean B follows A. Users who follow A are A's **followers**. Users A follows are A's **followees**. A user cannot follow themselves.

A user's **feed** is statuses posted by people they follow, newest first. A status is added to the feed only if the viewer was following the author when it was posted. Unfollowing stops future statuses from that author from entering the feed. Statuses already in the feed stay.

Relationships, in short:

- A user has one alias, one story, and one feed.
- A user posts many statuses. The story contains those statuses. A feed aggregates statuses from followees.
- A status contains many references (mentions and URLs).
- Follow links a follower user to a followee user.
