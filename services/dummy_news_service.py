import random
import requests
from datetime import datetime, timedelta
from django.conf import settings
from django.core.cache import cache
from django.db.models import Q
from ..models.help_center_models import (
    Keyword, 
    DailyKeywordSelection, 
    ArticleCache,
    KeywordCategory
)

class NewsService:
    def __init__(self):
        self.api_key = settings.NEWS_API_KEY
        self.base_url = 'https://newsapi.org/v2/everything'
        
    def get_daily_keywords(self, profile_type):  
        """Get or create daily keyword selection"""
        today = datetime.now().date()
        print(f"Fetching keywords for date: {today}")
        print(f"Profile type being searched: {profile_type}")  
        
        # Get keywords for profile type
        available_keywords = Keyword.objects.filter(
            category__profile_type=profile_type,  
            is_active=True
        )
        print(f"Available keywords count: {available_keywords.count()}")
        print(f"Sample keywords: {list(available_keywords.values_list('word', flat=True))[:5]}")
        
        daily_selection = DailyKeywordSelection.objects.filter(date=today).first()
        print(f"Existing daily selection: {daily_selection}")  # Debug line
        
        if not daily_selection:
            print("Creating new daily selection")  # Debug line
            # Randomly select 10 keywords
            if available_keywords.exists():
                selected_keywords = random.sample(
                    list(available_keywords), 
                    min(10, available_keywords.count())
                )
                
                # Create new daily selection
                daily_selection = DailyKeywordSelection.objects.create()
                daily_selection.keywords.set(selected_keywords)
                print(f"Created new selection with {len(selected_keywords)} keywords")  # Debug line
            else:
                print("No available keywords found!")  # Debug line
                return []
        
        return daily_selection.keywords.all()
    
    def fetch_articles(self, profile_type): 
        """Fetch articles for selected keywords"""
        print(f"Fetching articles for profile type: {profile_type}")  # Updated debug line
        
        cache_key = f'articles_{profile_type}_{datetime.now().date()}'
        cached_articles = cache.get(cache_key)
        
        if cached_articles:
            print("Returning cached articles")  # Debug line
            return cached_articles
            
        keywords = self.get_daily_keywords(profile_type)
        print(f"Selected keywords count: {len(keywords)}")  # Debug line
        
        if not keywords:
            print("No keywords available!")  # Debug line
            return []
            
        all_articles = []
        
        for keyword in keywords:
            print(f"Fetching articles for keyword: {keyword.word}")  # Debug line
            # Fetch from API
            params = {
                'q': keyword.word,
                'sortBy': 'relevancy',
                'language': 'en',
                'pageSize': 3,  # 3 articles per keyword
                'apiKey': self.api_key
            }
            
            try:
                response = requests.get(self.base_url, params=params)
                data = response.json()
                
                if data.get('status') == 'ok':
                    articles = data.get('articles', [])
                    print(f"Found {len(articles)} articles for keyword {keyword.word}")  # Debug line
                    for article in articles:
                        article_data = {
                            'title': article.get('title', ''),
                            'description': article.get('description', ''),
                            'url': article.get('url', ''),
                            'category': keyword.category.name
                        }
                        all_articles.append(article_data)
                else:
                    print(f"API error for keyword {keyword.word}: {data.get('message')}")  # Debug line
            
            except Exception as e:
                print(f"Error fetching articles for keyword {keyword.word}: {e}")  # Debug line
                continue
        
        # Cache the final results
        if all_articles:
            random.shuffle(all_articles)  # Randomize order
            all_articles = all_articles[:10]  # Keep only top 10
            cache.set(cache_key, all_articles, 86400)  # Cache for 24 hours
            print(f"Cached {len(all_articles)} articles")  # Debug line
        else:
            print("No articles found!")  # Debug line
        
        return all_articles