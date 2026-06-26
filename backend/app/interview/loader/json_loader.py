import os
import json
import logging
from typing import List
from app.interview.schemas.question import QuestionBankItem

logger = logging.getLogger(__name__)

class JSONQuestionLoader:
    def __init__(self, data_directory: str = None):
        if data_directory is None:
            
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_directory = os.path.join(base_dir, "data")
        self.data_directory = data_directory

    def load_questions(self) -> List[QuestionBankItem]:
        questions = []
        if not os.path.exists(self.data_directory):
            logger.info("Question Bank JSON directory %s does not exist yet. Returning empty list.", self.data_directory)
            return questions

        for filename in os.listdir(self.data_directory):
            if filename.endswith(".json"):
                file_path = os.path.join(self.data_directory, filename)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        if isinstance(data, list):
                            for item in data:
                                questions.append(QuestionBankItem(**item))
                        elif isinstance(data, dict):
                            # In case it is a single question or nested under a key
                            items = data.get("questions", [data])
                            for item in items:
                                questions.append(QuestionBankItem(**item))
                except Exception as e:
                    logger.error("Failed to parse question JSON file %s: %s", filename, str(e))
        
        logger.info("Loaded %d questions from Question Bank JSON files.", len(questions))
        return questions
