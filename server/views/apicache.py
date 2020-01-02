from server import mc, TOOL_API_KEY
from server.cache import cache
from server.auth import user_mediacloud_client, user_mediacloud_key, is_user_logged_in, user_admin_mediacloud_client


def api_key():
    return user_mediacloud_key() if is_user_logged_in() else TOOL_API_KEY


def mc_client(admin=False):
    # return the user's client handler, or a tool one if not logged in
    if is_user_logged_in():
        client_to_use = user_mediacloud_client() if not admin else user_admin_mediacloud_client()
    else:
        client_to_use = mc
    return client_to_use


def media(media_id):
    return _cached_media(api_key(), media_id)


def get_media_with_key(mc_api_key, media_id):
    return _cached_get_media_with_key(mc_api_key, media_id)


@cache.cache_on_arguments()
def _cached_get_media_with_key(mc_api_key, media_id):
    local_client = user_mediacloud_client(mc_api_key)
    return local_client.media(media_id)


def get_media(mc_api_key, media_id):
    return _cached_media(mc_api_key, media_id)


@cache.cache_on_arguments()
def _cached_media(mc_api_key, media_id):
    # api_key passed in just to make this a user-level cache
    local_client = mc_client()
    return local_client.media(media_id)


def collection(tags_id):
    return _cached_tag(api_key(), tags_id)


def tag(tags_id):
    return _cached_tag(api_key(), tags_id)


@cache.cache_on_arguments()
def _cached_tag(api_key, tags_id):
    # api_key passed in just to make this a user-level cache
    local_client = mc_client()
    return local_client.tag(tags_id)


def story_count(api_key, q, fq):
    return _cached_story_count(api_key, q, fq)


@cache.cache_on_arguments()
def _cached_story_count(api_key, q, fq):
    # api_key passed in just to make this a user-level cache
    local_client = mc_client()
    return local_client.storyCount(solr_query=q, solr_filter=fq)


def story(user_mc_key, stories_id, **kwargs):
    return _cached_story(user_mc_key, stories_id, **kwargs)


@cache.cache_on_arguments()
def _cached_story(user_mc_key, stories_id, **kwargs):
    if user_mc_key == TOOL_API_KEY:
        local_mc = mc
    else:
        # important for this to be an admin client in case kwargs has admin-restricted items
        local_mc = user_admin_mediacloud_client()
    return local_mc.story(stories_id, **kwargs)
