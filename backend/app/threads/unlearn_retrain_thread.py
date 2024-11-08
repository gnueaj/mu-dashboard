import threading
import asyncio
import time
import sys
from app.utils.helpers import save_model
from app.utils.evaluation import evaluate_model

class UnlearningRetrainThread(threading.Thread):
    def __init__(
        self,
        model,
        unlearning_loader,
        full_train_loader,
        test_loader,
        criterion,
        optimizer,
        scheduler,
        device,
        epochs,
        status,
        model_name,
        dataset_name,
        learning_rate
    ):
        threading.Thread.__init__(self)
        self.model = model
        self.unlearning_loader = unlearning_loader
        self.full_train_loader = full_train_loader
        self.test_loader = test_loader
        self.criterion = criterion
        self.optimizer = optimizer
        self.scheduler = scheduler
        self.device = device
        self.epochs = epochs
        self.status = status
        self.model_name = model_name
        self.dataset_name = dataset_name
        self.learning_rate = learning_rate
        self.exception = None
        self.loop = None
        self._stop_event = threading.Event()

    def stop(self):
        self._stop_event.set()

    def stopped(self):
        return self._stop_event.is_set()

    def run(self):
        try:
            self.loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self.loop)
            self.loop.run_until_complete(self.unlearn_retrain_model())
        except Exception as e:
            self.exception = e
        finally:
            if self.loop:
                self.loop.close()

    async def unlearn_retrain_model(self):
        self.model.train()
        self.status.start_time = time.time()
        self.status.total_epochs = self.epochs
        
        best_test_acc = 0.0
        best_epoch = 0

        train_accuracies = []
        test_accuracies = []

        for epoch in range(self.epochs):
            if self.stopped():
                self.status.is_unlearning = False
                print("\nTraining stopped.")
                return

            running_loss = 0.0
            correct = 0
            total = 0
            class_correct = [0] * 10
            class_total = [0] * 10

            # Training with unlearning_loader
            for i, (inputs, labels) in enumerate(self.unlearning_loader):
                if self.stopped():
                    self.status.is_unlearning = False
                    print("\nTraining cancelled mid-batch.")
                    return
                
                inputs, labels = inputs.to(self.device), labels.to(self.device)
                
                self.optimizer.zero_grad()
                outputs = self.model(inputs)
                loss = self.criterion(outputs, labels)
                loss.backward()
                self.optimizer.step()

                running_loss += loss.item()
                _, predicted = outputs.max(1)
                total += labels.size(0)
                correct += predicted.eq(labels).sum().item()
                
                c = (predicted == labels).squeeze()
                for i in range(labels.size(0)):
                    label = labels[i]
                    class_correct[label] += c[i].item()
                    class_total[label] += 1
            
            if self.stopped():
                self.status.is_unlearning = False
                print("\nUnlearning cancelled.")
                return
            
            self.scheduler.step()
            train_loss = running_loss / len(self.unlearning_loader)
            train_accuracy = correct / total
            train_class_accuracies = {
                i: (class_correct[i] / class_total[i] 
                    if class_total[i] > 0 else 0) 
                for i in range(10)
            }
            
            # Evaluate on test set
            (
                test_loss, 
                test_accuracy, 
                test_class_accuracies
            ) = await evaluate_model(
                self.model, 
                self.test_loader, 
                self.criterion, 
                self.device
            )
            
            if test_accuracy > best_test_acc:
                best_test_acc = test_accuracy
                best_epoch = epoch + 1
            
            train_accuracies.append(train_accuracy)
            test_accuracies.append(test_accuracy)

            # Update status
            self.status.current_epoch = epoch + 1
            self.status.current_loss = train_loss
            self.status.current_accuracy = train_accuracy
            self.status.test_loss = test_loss
            self.status.test_accuracy = test_accuracy
            self.status.train_class_accuracies = train_class_accuracies
            self.status.test_class_accuracies = test_class_accuracies
            
            if train_loss < self.status.best_loss:
                self.status.best_loss = train_loss
            if train_accuracy > self.status.best_accuracy:
                self.status.best_accuracy = train_accuracy
            if test_accuracy > self.status.best_test_accuracy:
                self.status.best_test_accuracy = test_accuracy
            
            elapsed_time = time.time() - self.status.start_time
            estimated_total_time = elapsed_time / (epoch + 1) * self.epochs
            self.status.estimated_time_remaining = max(
                0, estimated_total_time - elapsed_time
            )
            
            current_lr = self.optimizer.param_groups[0]['lr']

            # Print training progress
            print(f"\nEpoch [{epoch+1}/{self.epochs}]")
            print(f"Training   - Loss: {train_loss:.4f}, Accuracy: {train_accuracy:.4f}")
            print(f"Test - Loss: {test_loss:.4f}, Accuracy: {test_accuracy:.4f}")
            print(f"Best - Train: {self.status.best_accuracy:.4f}, Test: {self.status.best_test_accuracy:.4f}")
            print(f"Learning Rate: {current_lr:.5f}")
            print(f"Best Model: Epoch {best_epoch} (Test Acc: {best_test_acc:.4f})")
            
            print("\nPer-Class Accuracies:")
            print("Class |  Train  |  Test")
            print("-" * 30)
            for i in range(10):
                print(f"  {i}   | {train_class_accuracies[i]:6.4f} | {test_class_accuracies[i]:6.4f}")
            
            print(f"ETA: {self.status.estimated_time_remaining:.1f}s")
            
            sys.stdout.flush()
        
        total_training_time = time.time() - self.status.start_time
        print(f"\nTotal training time: {total_training_time:.1f} seconds ({total_training_time/60:.1f} minutes)")
        print()
        save_model(self.model, self.epochs, self.learning_rate)
