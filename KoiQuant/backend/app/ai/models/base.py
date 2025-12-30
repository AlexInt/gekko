from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import numpy as np

class BaseAIModel(ABC):
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.model = None

    @abstractmethod
    def train(self, X_train: np.ndarray, y_train: np.ndarray, X_val: Optional[np.ndarray] = None, y_val: Optional[np.ndarray] = None) -> Dict[str, Any]:
        """
        Train the model.
        Returns a dictionary of metrics (e.g. {'loss': 0.01, 'accuracy': 0.8})
        """
        pass

    @abstractmethod
    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Make predictions.
        """
        pass

    @abstractmethod
    def save(self, path: str):
        """
        Save the model to disk.
        """
        pass

    @abstractmethod
    def load(self, path: str):
        """
        Load the model from disk.
        """
        pass
