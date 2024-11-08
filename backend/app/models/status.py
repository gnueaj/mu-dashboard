from typing import List, Optional, Dict

class TrainingStatus:
    def __init__(self):
        self.is_training = False
        self.progress = 0
        self.current_epoch = 0
        self.total_epochs = 0
        self.current_loss = 0
        self.best_loss = 9999.99
        self.current_accuracy = 0
        self.best_accuracy = 0
        self.test_loss = 0
        self.test_accuracy = 0
        self.best_test_accuracy = 0
        self.train_class_accuracies: Dict[int, float] = {}
        self.test_class_accuracies: Dict[int, float] = {}
        self.start_time = None
        self.estimated_time_remaining = None
        self.umap_embeddings = None
        self.svg_files: Optional[List[str]] = None
        self.cancel_requested = False

    def reset(self):
        self.__init__()
        
class UnlearningStatus:
    def __init__(self):
        self.is_unlearning = False
        self.cancel_requested = False
        self.recent_id = None
        self.progress = "Idle"
        self.forget_class = -1
        self.current_epoch = 0
        self.total_epochs = 0
        self.current_unlearn_loss = 0
        self.current_unlearn_accuracy = 0
        self.estimated_time_remaining = 0

    def reset(self):
        self.__init__()