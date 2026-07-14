import json
from pathlib import Path


DATA_PATH = Path(
    "app/data/interview_questions.json"
)


def question(
    text,
    answer,
    skill,
    difficulty,
    experience_level,
    tags,
):
    return {
        "question": text,
        "answer": answer,
        "skill": skill,
        "category": "Technical",
        "difficulty": difficulty,
        "experience_level": experience_level,
        "company": None,
        "role": None,
        "tags": tags,
        "source": "Admin",
        "approved": True,
    }


NEW_QUESTIONS = [
    # ==================================================
    # MACHINE LEARNING
    # ==================================================
    question(
        "What is the difference between supervised and unsupervised learning?",
        (
            "Supervised learning trains a model using labeled examples, "
            "where each input has a known target. It is commonly used for "
            "classification and regression. Unsupervised learning works "
            "with unlabeled data and identifies hidden patterns or "
            "structures, such as clusters or lower-dimensional "
            "representations. The choice depends on whether reliable "
            "target labels are available and what business problem must "
            "be solved."
        ),
        "Machine Learning",
        "Easy",
        "Fresher",
        [
            "supervised-learning",
            "unsupervised-learning",
            "classification",
            "clustering",
        ],
    ),
    question(
        "What is overfitting, and how can you reduce it?",
        (
            "Overfitting occurs when a model learns noise and "
            "training-specific patterns instead of generalizable "
            "relationships. It usually performs well on training data "
            "but poorly on unseen data. Common mitigation techniques "
            "include cross-validation, regularization, reducing model "
            "complexity, feature selection, collecting more data, "
            "early stopping, pruning, and appropriate data "
            "augmentation."
        ),
        "Machine Learning",
        "Easy",
        "Fresher",
        [
            "overfitting",
            "regularization",
            "cross-validation",
            "generalization",
        ],
    ),
    question(
        "What is the bias-variance trade-off?",
        (
            "Bias is error caused by assumptions that are too simple, "
            "while variance is error caused by excessive sensitivity "
            "to the training data. High-bias models tend to underfit, "
            "whereas high-variance models tend to overfit. Model "
            "selection aims to find a balance that minimizes "
            "generalization error on unseen data."
        ),
        "Machine Learning",
        "Medium",
        "Mid-Level",
        [
            "bias",
            "variance",
            "underfitting",
            "overfitting",
        ],
    ),
    question(
        "How would you handle an imbalanced classification dataset?",
        (
            "First evaluate the imbalance and use suitable metrics such "
            "as precision, recall, F1-score, PR-AUC, or class-specific "
            "recall instead of accuracy alone. Possible techniques "
            "include class weighting, oversampling, undersampling, "
            "SMOTE, threshold tuning, stratified validation, and "
            "collecting more minority-class examples. The final "
            "approach should reflect the business cost of false "
            "positives and false negatives."
        ),
        "Machine Learning",
        "Medium",
        "Mid-Level",
        [
            "class-imbalance",
            "classification",
            "smote",
            "evaluation-metrics",
        ],
    ),
    question(
        "How do you select an appropriate evaluation metric for a machine learning model?",
        (
            "The metric should reflect the model objective and the "
            "business cost of different errors. Accuracy may be useful "
            "for balanced classification, while precision, recall, "
            "F1-score, ROC-AUC, or PR-AUC may be better for imbalanced "
            "problems. Regression commonly uses MAE, RMSE, MAPE, or "
            "R-squared. Metric selection should also consider "
            "interpretability, threshold behavior, and operational "
            "impact."
        ),
        "Machine Learning",
        "Medium",
        "Mid-Level",
        [
            "model-evaluation",
            "precision",
            "recall",
            "rmse",
        ],
    ),
    question(
        "What is data leakage, and how would you prevent it?",
        (
            "Data leakage occurs when information unavailable at real "
            "prediction time influences model training or validation. "
            "It produces unrealistically strong evaluation results. "
            "Prevent it by splitting data before fitting preprocessing "
            "steps, using pipelines, applying time-aware splits where "
            "required, excluding future information, auditing feature "
            "lineage, and ensuring that related entities do not appear "
            "across training and validation sets incorrectly."
        ),
        "Machine Learning",
        "Medium",
        "Mid-Level",
        [
            "data-leakage",
            "validation",
            "feature-engineering",
            "pipelines",
        ],
    ),
    question(
        "How would you diagnose model performance degradation in production?",
        (
            "Compare current performance with the validated baseline, "
            "then inspect data quality, schema changes, feature drift, "
            "prediction drift, concept drift, segment-level metrics, "
            "latency, and upstream pipeline health. Confirm that labels "
            "and monitoring calculations are reliable. Depending on the "
            "cause, actions may include rollback, feature correction, "
            "threshold adjustment, retraining, or redesigning the "
            "model."
        ),
        "Machine Learning",
        "Hard",
        "Senior",
        [
            "model-monitoring",
            "data-drift",
            "concept-drift",
            "production-ml",
        ],
    ),
    question(
        "How would you design a reliable end-to-end machine learning pipeline?",
        (
            "A reliable pipeline should include versioned data "
            "ingestion, validation, reproducible preprocessing, feature "
            "engineering, training, experiment tracking, evaluation "
            "gates, model registration, deployment, monitoring, and "
            "rollback. It should preserve lineage across code, data, "
            "features, parameters, and model artifacts. Automated tests, "
            "access controls, observability, and controlled retraining "
            "are also important for production reliability."
        ),
        "Machine Learning",
        "Hard",
        "Senior",
        [
            "ml-pipeline",
            "model-lifecycle",
            "deployment",
            "monitoring",
        ],
    ),

    # ==================================================
    # NLP
    # ==================================================
    question(
        "What is tokenization in natural language processing?",
        (
            "Tokenization divides text into smaller units called "
            "tokens. Tokens may be words, subwords, characters, or "
            "other learned units. Modern transformer models commonly "
            "use subword tokenization because it handles unknown words "
            "and vocabulary size efficiently. The tokenizer must match "
            "the model used for training or inference."
        ),
        "NLP",
        "Easy",
        "Fresher",
        [
            "tokenization",
            "subword-tokenization",
            "text-processing",
            "transformers",
        ],
    ),
    question(
        "What is the difference between stemming and lemmatization?",
        (
            "Stemming applies heuristic rules to remove word endings "
            "and may produce non-dictionary roots. Lemmatization uses "
            "linguistic information to return a valid base form or "
            "lemma. Stemming is generally faster but less precise, "
            "while lemmatization is usually more accurate but requires "
            "additional language analysis."
        ),
        "NLP",
        "Easy",
        "Fresher",
        [
            "stemming",
            "lemmatization",
            "text-normalization",
            "preprocessing",
        ],
    ),
    question(
        "What is the difference between TF-IDF and dense text embeddings?",
        (
            "TF-IDF creates sparse vectors based on term frequency and "
            "document frequency, so it is strong for lexical matching "
            "and is relatively interpretable. Dense embeddings encode "
            "text into compact learned vectors that can capture "
            "semantic similarity even when exact words differ. Hybrid "
            "retrieval can combine both approaches to preserve lexical "
            "precision and semantic recall."
        ),
        "NLP",
        "Medium",
        "Mid-Level",
        [
            "tf-idf",
            "dense-embeddings",
            "sparse-vectors",
            "semantic-similarity",
        ],
    ),
    question(
        "How would you evaluate an NLP classification model?",
        (
            "Use a representative holdout set and metrics aligned with "
            "the problem, such as precision, recall, F1-score, "
            "confusion matrices, and class-specific performance. "
            "Evaluate important segments, inspect misclassified "
            "examples, test robustness to noisy or shifted text, and "
            "check calibration when probabilities drive decisions."
        ),
        "NLP",
        "Medium",
        "Mid-Level",
        [
            "nlp-evaluation",
            "classification",
            "f1-score",
            "error-analysis",
        ],
    ),
    question(
        "How would you handle long documents that exceed a transformer's context window?",
        (
            "Possible approaches include semantic or structure-aware "
            "chunking, overlapping windows, hierarchical processing, "
            "retrieval of relevant sections, summarization, or using "
            "a model with a larger context window. The design should "
            "preserve important relationships while controlling cost "
            "and latency. Evaluation should test whether relevant "
            "information is lost across chunk boundaries."
        ),
        "NLP",
        "Hard",
        "Senior",
        [
            "long-documents",
            "context-window",
            "chunking",
            "transformers",
        ],
    ),
    question(
        "How would you detect and reduce domain drift in a production NLP system?",
        (
            "Monitor changes in vocabulary, embedding distributions, "
            "input length, language patterns, confidence, and "
            "task-specific quality metrics. Review errors by domain "
            "and user segment, and maintain representative labeled "
            "evaluation sets. Mitigation may involve updated training "
            "data, domain adaptation, prompt or retrieval changes, "
            "threshold tuning, or controlled model retraining."
        ),
        "NLP",
        "Hard",
        "Senior",
        [
            "domain-drift",
            "nlp-monitoring",
            "production-nlp",
            "domain-adaptation",
        ],
    ),

    # ==================================================
    # RAG
    # ==================================================
    question(
        "What is retrieval-augmented generation?",
        (
            "Retrieval-augmented generation, or RAG, retrieves relevant "
            "information from an external knowledge source and provides "
            "it as context to a language model before generation. It "
            "can improve factual grounding, use current or private "
            "knowledge, and provide evidence for answers without "
            "retraining the language model."
        ),
        "RAG",
        "Easy",
        "Fresher",
        [
            "rag",
            "retrieval",
            "llm",
            "grounding",
        ],
    ),
    question(
        "Why is chunking important in a RAG pipeline?",
        (
            "Chunking determines the units indexed and retrieved. "
            "Chunks that are too large may contain irrelevant content "
            "and waste context, while chunks that are too small may "
            "lose meaning and relationships. Effective chunking "
            "considers document structure, semantic boundaries, "
            "overlap, metadata, embedding behavior, and the expected "
            "question types."
        ),
        "RAG",
        "Medium",
        "Mid-Level",
        [
            "chunking",
            "retrieval",
            "context",
            "document-processing",
        ],
    ),
    question(
        "What is the difference between retrieval quality and generation quality in RAG?",
        (
            "Retrieval quality measures whether the system finds "
            "relevant evidence, using metrics such as recall, "
            "precision, MRR, or nDCG. Generation quality measures "
            "whether the final answer is correct, relevant, faithful, "
            "and well supported. The two should be evaluated "
            "separately because a poor answer may result from failed "
            "retrieval or from incorrect use of good context."
        ),
        "RAG",
        "Medium",
        "Mid-Level",
        [
            "retrieval-evaluation",
            "generation-evaluation",
            "faithfulness",
            "rag-metrics",
        ],
    ),
    question(
        "How would you reduce hallucinations in a RAG application?",
        (
            "Improve document quality and retrieval, use suitable "
            "chunking and metadata filters, rerank retrieved results, "
            "require the model to answer from supplied evidence, "
            "include citations, and allow an explicit insufficient-"
            "information response. Evaluate faithfulness with a "
            "representative test set and monitor unsupported claims "
            "in production."
        ),
        "RAG",
        "Medium",
        "Mid-Level",
        [
            "hallucination",
            "grounding",
            "reranking",
            "citations",
        ],
    ),
    question(
        "How would you evaluate an end-to-end RAG system?",
        (
            "Create a representative evaluation dataset containing "
            "questions, expected evidence, and reference answers. "
            "Measure retrieval recall, precision, ranking quality, "
            "answer correctness, relevance, faithfulness, citation "
            "quality, latency, and cost. Perform component-level error "
            "analysis to separate ingestion, retrieval, reranking, "
            "prompting, and generation failures."
        ),
        "RAG",
        "Hard",
        "Senior",
        [
            "rag-evaluation",
            "retrieval-metrics",
            "faithfulness",
            "latency",
        ],
    ),
    question(
        "How would you design a production RAG system for frequently changing documents?",
        (
            "Use an incremental ingestion pipeline with stable document "
            "and chunk identifiers, content hashes, metadata, versioning, "
            "and deletion handling. Re-embed only changed content, make "
            "index updates idempotent, and support rollback or index "
            "version switching. Add access controls, observability, "
            "retrieval evaluation, freshness monitoring, and safe "
            "handling of partial indexing failures."
        ),
        "RAG",
        "Hard",
        "Senior",
        [
            "production-rag",
            "incremental-indexing",
            "versioning",
            "freshness",
        ],
    ),

    # ==================================================
    # SEMANTIC SEARCH
    # ==================================================
    question(
        "What is semantic search?",
        (
            "Semantic search retrieves content based on meaning rather "
            "than only exact keyword overlap. It commonly converts "
            "queries and documents into embeddings and compares them "
            "using a similarity measure. This allows related concepts "
            "to match even when they use different wording."
        ),
        "Semantic Search",
        "Easy",
        "Fresher",
        [
            "semantic-search",
            "embeddings",
            "similarity",
            "retrieval",
        ],
    ),
    question(
        "What is the difference between lexical search and semantic search?",
        (
            "Lexical search focuses on exact terms and statistical "
            "keyword relevance, while semantic search uses learned "
            "representations to match meaning. Lexical search is strong "
            "for identifiers and exact terminology. Semantic search can "
            "improve recall for paraphrases and related concepts. Many "
            "production systems combine them through hybrid retrieval."
        ),
        "Semantic Search",
        "Medium",
        "Mid-Level",
        [
            "lexical-search",
            "semantic-search",
            "hybrid-search",
            "retrieval",
        ],
    ),
    question(
        "What is hybrid search, and why would you use it?",
        (
            "Hybrid search combines lexical retrieval, such as BM25, "
            "with dense semantic retrieval. It can preserve exact "
            "keyword matching while also finding semantically related "
            "content. Results may be combined through weighted scores "
            "or rank-fusion methods. The weighting should be tuned on "
            "a representative relevance dataset."
        ),
        "Semantic Search",
        "Medium",
        "Mid-Level",
        [
            "hybrid-search",
            "bm25",
            "dense-retrieval",
            "rank-fusion",
        ],
    ),
    question(
        "How would you improve the relevance of a semantic search system?",
        (
            "Inspect failed queries and evaluate retrieval with labeled "
            "relevance judgments. Improvements may include better "
            "document cleaning, chunking, embedding models, metadata "
            "filters, query rewriting, hybrid retrieval, reranking, "
            "hard-negative training, and domain adaptation. Changes "
            "should be validated with offline metrics and online user "
            "behavior."
        ),
        "Semantic Search",
        "Hard",
        "Senior",
        [
            "search-relevance",
            "reranking",
            "query-rewriting",
            "evaluation",
        ],
    ),
    question(
        "How would you monitor a semantic search system in production?",
        (
            "Monitor indexing freshness, query and retrieval latency, "
            "empty-result rates, click or engagement signals, relevance "
            "metrics, embedding-model versions, and performance by "
            "query segment. Track data and query drift, maintain a "
            "human-labeled evaluation set, and use controlled "
            "experiments before deploying major ranking changes."
        ),
        "Semantic Search",
        "Hard",
        "Senior",
        [
            "search-monitoring",
            "relevance",
            "query-drift",
            "production-search",
        ],
    ),

    # ==================================================
    # EMBEDDINGS AND VECTOR SEARCH
    # ==================================================
    question(
        "What is a text embedding?",
        (
            "A text embedding is a numerical vector representing the "
            "meaning or characteristics of text. Similar text is "
            "typically mapped to nearby locations in the embedding "
            "space. Embeddings are used in semantic search, clustering, "
            "recommendation, classification, and retrieval systems."
        ),
        "Embeddings & Vector Search",
        "Easy",
        "Fresher",
        [
            "embeddings",
            "vectors",
            "semantic-similarity",
            "representation-learning",
        ],
    ),
    question(
        "What is cosine similarity?",
        (
            "Cosine similarity measures the angle between two vectors. "
            "It focuses on vector direction rather than absolute "
            "magnitude and commonly ranges from minus one to one, "
            "although practical embedding values are often concentrated "
            "in a smaller range. It is widely used to compare text "
            "embeddings."
        ),
        "Embeddings & Vector Search",
        "Easy",
        "Fresher",
        [
            "cosine-similarity",
            "vectors",
            "distance-metrics",
            "embeddings",
        ],
    ),
    question(
        "What is approximate nearest-neighbor search?",
        (
            "Approximate nearest-neighbor search uses specialized "
            "indexes to find vectors close to a query without comparing "
            "against every stored vector. It trades a small amount of "
            "recall for much lower latency and better scalability. "
            "Common approaches include graph-based indexes such as "
            "HNSW and partition-based methods."
        ),
        "Embeddings & Vector Search",
        "Medium",
        "Mid-Level",
        [
            "ann-search",
            "hnsw",
            "vector-index",
            "scalability",
        ],
    ),
    question(
        "What factors would you consider when selecting an embedding model?",
        (
            "Consider domain relevance, language support, retrieval "
            "quality, vector dimension, context length, latency, "
            "throughput, deployment constraints, licensing, and cost. "
            "Evaluate candidate models on representative queries and "
            "documents rather than relying only on public benchmarks. "
            "Also consider whether asymmetric query-document encoding "
            "is required."
        ),
        "Embeddings & Vector Search",
        "Medium",
        "Mid-Level",
        [
            "embedding-model",
            "model-selection",
            "retrieval-quality",
            "latency",
        ],
    ),
    question(
        "How would you migrate a production vector index to a new embedding model?",
        (
            "Create a versioned index because vectors from different "
            "embedding models should generally not be mixed. Re-embed "
            "the corpus through an idempotent pipeline, validate "
            "coverage and retrieval quality, run shadow or canary "
            "traffic, and compare relevance, latency, and cost. Switch "
            "traffic only after validation and retain rollback capability "
            "until the migration is stable."
        ),
        "Embeddings & Vector Search",
        "Hard",
        "Senior",
        [
            "embedding-migration",
            "vector-index",
            "versioning",
            "production-retrieval",
        ],
    ),

    # ==================================================
    # MLOPS
    # ==================================================
    question(
        "What is experiment tracking in machine learning?",
        (
            "Experiment tracking records parameters, code versions, "
            "datasets, metrics, artifacts, and model outputs for each "
            "training run. It makes experiments reproducible and allows "
            "teams to compare models systematically. Tools such as "
            "MLflow can provide tracking, artifact storage, and model "
            "lifecycle capabilities."
        ),
        "MLOps",
        "Easy",
        "Fresher",
        [
            "experiment-tracking",
            "mlflow",
            "reproducibility",
            "model-training",
        ],
    ),
    question(
        "What is a model registry?",
        (
            "A model registry is a controlled repository for versioned "
            "model artifacts and their metadata. It supports lifecycle "
            "states, approvals, lineage, deployment references, and "
            "rollback. A registry helps ensure that production systems "
            "use validated and traceable model versions."
        ),
        "MLOps",
        "Easy",
        "Fresher",
        [
            "model-registry",
            "model-versioning",
            "deployment",
            "mlflow",
        ],
    ),
    question(
        "What information should be tracked to reproduce a machine learning model?",
        (
            "Track the code commit, environment and dependencies, data "
            "version or snapshot, feature definitions, preprocessing "
            "steps, random seeds, model parameters, hyperparameters, "
            "training metrics, evaluation results, and generated "
            "artifacts. The complete lineage should make it possible "
            "to recreate both training and inference behavior."
        ),
        "MLOps",
        "Medium",
        "Mid-Level",
        [
            "reproducibility",
            "lineage",
            "versioning",
            "experiment-tracking",
        ],
    ),
    question(
        "How would you implement safe model deployment and rollback?",
        (
            "Package and validate a versioned model artifact, run "
            "automated tests, and deploy through shadow, canary, or "
            "blue-green strategies. Monitor technical and model-quality "
            "metrics against defined thresholds. Keep the previous "
            "version deployable, separate configuration from artifacts, "
            "and automate rollback when critical health checks fail."
        ),
        "MLOps",
        "Hard",
        "Senior",
        [
            "model-deployment",
            "canary",
            "rollback",
            "production-ml",
        ],
    ),
    question(
        "How would you design monitoring for a production machine learning system?",
        (
            "Monitor service health, latency, throughput, errors, input "
            "schema and quality, feature distributions, prediction "
            "distributions, drift, confidence, and task-specific "
            "performance when labels become available. Add segment-level "
            "analysis, alert thresholds, model and data version context, "
            "and response procedures for rollback, investigation, or "
            "retraining."
        ),
        "MLOps",
        "Hard",
        "Senior",
        [
            "ml-monitoring",
            "drift",
            "observability",
            "model-performance",
        ],
    ),

    # ==================================================
    # PYSPARK
    # ==================================================
    question(
        "What is PySpark?",
        (
            "PySpark is the Python API for Apache Spark. It enables "
            "distributed processing of large datasets using DataFrames, "
            "SQL, machine learning utilities, and streaming components. "
            "Spark divides work across a cluster and uses lazy "
            "evaluation to optimize execution before actions run."
        ),
        "PySpark",
        "Easy",
        "Fresher",
        [
            "pyspark",
            "apache-spark",
            "distributed-computing",
            "dataframes",
        ],
    ),
    question(
        "What is the difference between a transformation and an action in Spark?",
        (
            "Transformations define new datasets from existing ones and "
            "are evaluated lazily. Examples include select, filter, and "
            "groupBy. Actions trigger execution and return or persist "
            "results, such as count, collect, or write. Spark builds an "
            "execution plan from transformations and runs it when an "
            "action is requested."
        ),
        "PySpark",
        "Easy",
        "Fresher",
        [
            "transformations",
            "actions",
            "lazy-evaluation",
            "spark",
        ],
    ),
    question(
        "What is a shuffle in Spark, and why can it be expensive?",
        (
            "A shuffle redistributes data across partitions, commonly "
            "during joins, aggregations, sorting, or repartitioning. It "
            "can require network transfer, serialization, disk spill, "
            "and additional coordination, making it expensive. Reduce "
            "unnecessary shuffles through appropriate partitioning, "
            "broadcast joins, pre-aggregation, and efficient query "
            "plans."
        ),
        "PySpark",
        "Medium",
        "Mid-Level",
        [
            "spark-shuffle",
            "partitions",
            "performance",
            "distributed-processing",
        ],
    ),
    question(
        "When would you use a broadcast join in Spark?",
        (
            "Use a broadcast join when one side of a join is small "
            "enough to be copied efficiently to each executor. This "
            "can avoid shuffling the larger dataset and significantly "
            "improve performance. The decision should consider the "
            "actual data size, executor memory, Spark thresholds, and "
            "the risk of memory pressure."
        ),
        "PySpark",
        "Medium",
        "Mid-Level",
        [
            "broadcast-join",
            "spark-joins",
            "optimization",
            "shuffle",
        ],
    ),
    question(
        "How would you diagnose and optimize a slow PySpark job?",
        (
            "Inspect the Spark UI, execution plan, stage timing, task "
            "distribution, shuffle volume, spills, skew, partition "
            "sizes, executor memory, and input-file layout. Common "
            "improvements include predicate pushdown, column pruning, "
            "appropriate partitioning, broadcast joins, handling skew, "
            "avoiding unnecessary Python UDFs, caching only reused data, "
            "and tuning cluster resources based on evidence."
        ),
        "PySpark",
        "Hard",
        "Senior",
        [
            "spark-optimization",
            "spark-ui",
            "data-skew",
            "performance",
        ],
    ),
]


def normalize(value):
    return " ".join(
        str(value or "")
        .strip()
        .lower()
        .split()
    )


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Question file not found: {DATA_PATH}"
        )

    with DATA_PATH.open(
        "r",
        encoding="utf-8",
    ) as file:
        existing_questions = json.load(
            file
        )

    if not isinstance(
        existing_questions,
        list,
    ):
        raise ValueError(
            "Question JSON root must be a list."
        )

    existing_keys = {
        (
            normalize(item.get("question")),
            normalize(item.get("skill")),
        )
        for item in existing_questions
    }

    inserted = []
    skipped = []

    for item in NEW_QUESTIONS:
        key = (
            normalize(
                item.get("question")
            ),
            normalize(
                item.get("skill")
            ),
        )

        if key in existing_keys:
            skipped.append(
                item
            )
            continue

        existing_questions.append(
            item
        )

        existing_keys.add(
            key
        )

        inserted.append(
            item
        )

    backup_path = DATA_PATH.with_suffix(
        ".before_ml_questions.json"
    )

    if not backup_path.exists():
        backup_path.write_text(
            DATA_PATH.read_text(
                encoding="utf-8"
            ),
            encoding="utf-8",
        )

    with DATA_PATH.open(
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            existing_questions,
            file,
            ensure_ascii=False,
            indent=2,
        )

        file.write(
            "\n"
        )

    print(
        "Existing questions before:",
        len(existing_questions)
        - len(inserted),
    )

    print(
        "New questions inserted:",
        len(inserted),
    )

    print(
        "Duplicate questions skipped:",
        len(skipped),
    )

    print(
        "Total questions after:",
        len(existing_questions),
    )

    print(
        "Backup:",
        backup_path,
    )


if __name__ == "__main__":
    main()
