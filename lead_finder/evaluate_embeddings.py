import sqlite3

def run_evaluation():
    try:
        from sentence_transformers import SentenceTransformer
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np
    except ImportError:
        print("Please install sentence-transformers, scikit-learn, and numpy")
        return

    # Dataset of pairs
    pairs = [
        ("NEPA don waka since morning", "The power has been out since morning"),
        ("This wahala too much", "This problem is too much"),
        ("I dey find where to buy cheap solar panel", "I am looking for a place to buy affordable solar panels"),
        ("Omo, fuel price don cost no be small", "Wow, the price of fuel has become very expensive"),
        ("Abeg who sabi good dispatch rider for Lagos?", "Please, who knows a reliable delivery rider in Lagos?"),
        ("My phone battery don spoil", "My phone battery is damaged"),
        ("Wetin be the best app for send money to Naija?", "What is the best app for sending money to Nigeria?"),
        ("I need make una help me find job", "I need you guys to help me find a job"),
        ("No network since yesterday", "There has been no internet connection since yesterday"),
        ("Dem don steal my laptop", "They have stolen my laptop"),
        # Pure English variations to see baseline
        ("Where can I buy cheap solar panels?", "I am looking for a place to buy affordable solar panels"),
    ]

    models_to_test = [
        "all-MiniLM-L6-v2",
        "paraphrase-multilingual-MiniLM-L12-v2"
    ]

    for model_name in models_to_test:
        print(f"\n--- Evaluating Model: {model_name} ---")
        model = SentenceTransformer(model_name)
        
        scores = []
        for pidgin, english in pairs:
            embeddings = model.encode([pidgin, english])
            score = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
            scores.append(score)
            print(f"Similarity: {score:.4f}")
            print(f"  Pidgin:  {pidgin}")
            print(f"  English: {english}\n")
        
        print(f"Average Similarity for {model_name}: {np.mean(scores):.4f}")

if __name__ == "__main__":
    run_evaluation()
