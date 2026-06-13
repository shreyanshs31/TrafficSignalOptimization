from supabase import create_client, Client
from supabaseKeys import urlKey, secretKey

url: str = urlKey
key: str = secretKey
supabase: Client = create_client(url, key)
