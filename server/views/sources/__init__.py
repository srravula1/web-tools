from server.util.csv import stream_response, download_media_csv
from server.auth import user_has_auth_role, ROLE_MEDIA_EDIT, user_admin_mediacloud_client
from server.cache import cache

SOURCES_TEMPLATE_PROPS_VIEW = ['media_id', 'url','name', 'pub_country', 'pub_state', 'primary_language', 'subject_country', 'public_notes', 'is_monitored']
SOURCES_TEMPLATE_PROPS_EDIT = ['media_id', 'url','name', 'pub_country', 'pub_state', 'primary_language', 'subject_country', 'public_notes', 'is_monitored', 'editor_notes']

COLLECTIONS_TEMPLATE_PROPS_EDIT = ['media_id', 'url','name', 'pub_country', 'pub_state', 'primary_language', 'subject_country', 'public_notes', 'is_monitored', 'editor_notes']

# hand-made whitelist of collections to show up as "featured" on source mgr homepage
FEATURED_COLLECTION_LIST = [8875027, 2453107, 8878332, 9201395]

# hand-made whitelist of collections to show up as "popular" on source mgr homepage
POPULAR_COLLECTION_LIST = [9272347, 9201395, 8877968, 9315147, 9353688, 9173065, 9325106, 8875027, 8878332, 9319462, 9353689, 9353685, 9139458, 9273433, 9297151, 9351677, 9213928, 9228386, 9349925]

def download_sources_csv(all_media, file_prefix):

    what_type_download = SOURCES_TEMPLATE_PROPS_EDIT

    if user_has_auth_role(ROLE_MEDIA_EDIT):
        what_type_download = SOURCES_TEMPLATE_PROPS_EDIT
    else:
        what_type_download = SOURCES_TEMPLATE_PROPS_VIEW # no editor_notes

    return download_media_csv(all_media, file_prefix, what_type_download)

@cache
def _cached_source_story_count(user_mc_key, query):
    user_mc = user_admin_mediacloud_client()
    return user_mc.storyCount(query)['count']
