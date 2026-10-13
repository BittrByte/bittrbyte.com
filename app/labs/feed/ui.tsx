"use client";

import { useActionState } from "react";
import {
  createCommentAction,
  createPostAction,
  type FeedState,
} from "./actions";

const initial: FeedState = {};

export function NewPostForm() {
  const [state, action, pending] = useActionState(createPostAction, initial);
  return (
    <form className="labs-form" action={action}>
      <div className="labs-field">
        <label htmlFor="body">New update</label>
        <textarea id="body" name="body" required placeholder="Share a development note…" />
      </div>
      {state.error ? <p className="labs-error">{state.error}</p> : null}
      {state.ok ? <p className="labs-ok">{state.ok}</p> : null}
      <button className="btn btn--primary" disabled={pending}>
        {pending ? "Posting…" : "Post"}
      </button>
    </form>
  );
}

export function CommentForm({ postId }: { postId: string }) {
  const [state, action, pending] = useActionState(createCommentAction, initial);
  return (
    <form className="labs-form" action={action} style={{ marginTop: "0.75rem" }}>
      <input type="hidden" name="postId" value={postId} />
      <div className="labs-field">
        <label htmlFor={`comment-${postId}`}>Comment</label>
        <input id={`comment-${postId}`} name="body" required placeholder="Add a comment" />
      </div>
      {state.error ? <p className="labs-error">{state.error}</p> : null}
      <button className="btn" disabled={pending}>
        {pending ? "Sending…" : "Comment"}
      </button>
    </form>
  );
}
