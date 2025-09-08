from flask import Blueprint, request, jsonify, session, url_for
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import os
import google.oauth2.credentials

blogger_bp = Blueprint("blogger", __name__)

# --- OAuth 2.0 Configuration ---
CLIENT_SECRETS_FILE = "client_secret.json"  # This file should be in your project root
SCOPES = ["https://www.googleapis.com/auth/blogger"]
API_SERVICE_NAME = "blogger"
API_VERSION = "v3"

@blogger_bp.route("/authorize")
def authorize():
    """Starts the OAuth 2.0 authorization flow."""
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES, redirect_uri=request.host_url + "api/blogger/oauth2callback")

    authorization_url, state = flow.authorization_url(
        access_type="offline", include_granted_scopes="true")

    # Store the state in the session so we can verify it in the callback
    session["state"] = state

    return jsonify({"authorization_url": authorization_url})

@blogger_bp.route("/oauth2callback")
def oauth2callback():
    """Handles the OAuth 2.0 callback."""
    # Get the state from the session and the request
    state = session["state"]
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES, state=state, redirect_uri=url_for("blogger.oauth2callback", _external=True))

    flow.fetch_token(authorization_response=request.url)

    # Store the credentials in the session.
    credentials = flow.credentials
    session["credentials"] = credentials_to_dict(credentials)





    return jsonify({"message": "Authorization successful!"})

@blogger_bp.route("/publish", methods=["POST"])
def publish_post():
    """Publishes a new blog post to Blogger."""
    # Get the credentials from the session
    credentials = session.get("credentials")
    if not credentials:
        return jsonify({"error": "User not authenticated"}), 401

    credentials = google.oauth2.credentials.Credentials(**credentials)

    # Create the Blogger API service
    blogger = build(API_SERVICE_NAME, API_VERSION, credentials=credentials)

    data = request.get_json()
    blog_id = data.get("blog_id")
    title = data.get("title")
    content = data.get("content")

    if not all([blog_id, title, content]):
        return jsonify({"error": "Missing required fields"}), 400

    body = {
        "kind": "blogger#post",
        "blog": {
            "id": blog_id
        },
        "title": title,
        "content": content
    }

    try:
        posts = blogger.posts()
        insert = posts.insert(blogId=blog_id, body=body)
        post = insert.execute()
        return jsonify(post)
        # return jsonify({"message": "Post published successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def credentials_to_dict(credentials):
    return {"token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri,
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
            "scopes": credentials.scopes}


