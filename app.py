from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import requests
from bs4 import BeautifulSoup
import numpy as np
from collections import defaultdict

app = Flask(__name__)

# Configure CORS to allow requests from Chrome extensions
CORS(app, resources={r"/*": {"origins": ["chrome-extension://*"]}})

# In-memory database (replace with a real database in production)
users = defaultdict(lambda: {"profile": {}, "history": []})

# TF-IDF vectorizer
vectorizer = TfidfVectorizer()  

@app.route('/personalize', methods=['POST'])
def personalize():
    if request.method == 'OPTIONS':
        # Respond to preflight request
        response = app.make_default_options_response()
    else:
        data = request.json
        query = data['query']
        user_profile = data['userProfile']
        user_id = request.remote_addr  # In production, use a proper user identification method
        
        # Update user profile
        users[user_id]["profile"] = user_profile
        
        # Fetch Google search results
        search_results = fetch_search_results(query)
        
        # Personalize results
        personalized_results = rerank_results(search_results, user_id)
        
        response = jsonify(personalized_results)

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': request.headers.get('Origin', '*'),
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    response.headers.extend(headers)
    return response

def fetch_search_results(query):
    # Implement Google search scraping here
    # This is a placeholder and might violate Google's ToS
    url = f"https://www.google.com/search?q={query}"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    results = []
    for g in soup.find_all('div', class_='g'):
        anchor = g.find('a')
        if anchor:
            link = anchor['href']
            title = anchor.find('h3').text if anchor.find('h3') else ''
            snippet = g.find('div', class_='s').text if g.find('div', class_='s') else ''
            results.append({'title': title, 'link': link, 'snippet': snippet})
    return results

def rerank_results(results, user_id):
    user_profile = users[user_id]["profile"]
    user_history = users[user_id]["history"]
    
    # Combine user interests, profession, and search history
    user_text = (f"{' '.join(user_profile.get('interests', []))} "
                 f"{user_profile.get('profession', '')} "
                 f"{' '.join([item['query'] for item in user_history])}")
    
    result_texts = [f"{r['title']} {r['snippet']}" for r in results]
    all_texts = [user_text] + result_texts
    
    # Calculate TF-IDF
    tfidf_matrix = vectorizer.fit_transform(all_texts)
    
    # Calculate content-based similarity
    user_vector = tfidf_matrix[0]
    result_vectors = tfidf_matrix[1:]
    content_similarities = cosine_similarity(user_vector, result_vectors)[0]
    
    # Calculate collaborative similarity
    collab_similarities = calculate_collaborative_similarity(results, user_id)
    
    # Combine content-based and collaborative similarities
    combined_similarities = 0.7 * content_similarities + 0.3 * collab_similarities
    
    # Add relevance scores to results
    for i, sim in enumerate(combined_similarities):
        results[i]['relevance'] = float(sim)
    
    return sorted(results, key=lambda x: x['relevance'], reverse=True)

def calculate_collaborative_similarity(results, user_id):
    # This is a simplified collaborative filtering approach
    # In a real-world scenario, you'd use a more sophisticated method
    
    similarities = np.zeros(len(results))
    
    for other_user_id, other_user_data in users.items():
        if other_user_id != user_id:
            other_history = other_user_data["history"]
            for i, result in enumerate(results):
                if any(item['clickedUrl'] == result['link'] for item in other_history):
                    similarities[i] += 1
    
    # Normalize similarities
    if np.sum(similarities) > 0:
        similarities = similarities / np.sum(similarities)
    
    return similarities

@app.route('/update_history', methods=['POST'])
def update_history():
    data = request.json
    user_id = request.remote_addr  # In production, use a proper user identification method
    
    users[user_id]["history"].append({
        "query": data['query'],
        "clickedUrl": data['clickedUrl'],
        "timestamp": data['timestamp']
    })
    
    # Keep only the last 100 items
    users[user_id]["history"] = users[user_id]["history"][-100:]
    
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)