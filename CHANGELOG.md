# v4.0.0

## ⚠️ Breaking Changes
- A session ID is now required when calling the `open` method to launch Finch Connect. You can create a session using the [Connect session endpoint](https://developer.tryfinch.com/api-reference/connect/new-session) on the Finch API.
- The `state` parameter has been moved from the `initialize` call to the `open` call
- The `open` call no longer allows overriding values for the auth session, all values must be set in the session created by calling the API