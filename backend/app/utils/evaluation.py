import torch
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from datetime import datetime
from app.config.settings import UMAP_DATA_SIZE

async def get_layer_activations_and_predictions(model, data_loader, device, num_samples=UMAP_DATA_SIZE, forget_class=1):
    model.eval()
    activations = [[], [], [], []]
    predictions = []
    logits = []
    sample_count = 0
    
    with torch.no_grad():
        for inputs, labels in data_loader:
            inputs = inputs.to(device)
            labels = labels.to(device)
            
            # Get predictions
            outputs = model(inputs)
            _, predicted = outputs.max(1)
            predictions.extend(predicted.cpu().numpy())
            
            # Only add logits for non-forget classes
            non_forget_mask = labels != forget_class
            logits.extend(outputs[non_forget_mask].cpu().numpy())
            
            # Get activations
            x = model.conv1(inputs)
            x = model.bn1(x)
            x = model.relu(x)
            x = model.maxpool(x)

            x = model.layer1(x)
            activations[0].append(x.cpu().numpy())

            x = model.layer2(x)
            activations[1].append(x.cpu().numpy())

            x = model.layer3(x)
            activations[2].append(x.cpu().numpy())

            x = model.layer4(x)
            activations[3].append(x.cpu().numpy())

            sample_count += inputs.size(0)
            if sample_count >= num_samples:
                break

    activations = [np.concatenate(act)[:num_samples] for act in activations]
    predictions = np.array(predictions)[:num_samples]
    logits = np.array(logits)
    
    # Calculate max logits
    max_logits = logits.max(axis=1)
    
    # Generate timestamp for the filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Plot KDE of max logits
    plt.figure(figsize=(10, 6))
    sns.kdeplot(max_logits, fill=True)
    plt.xlim(0, 100)
    plt.ylim(0, 0.1)
    plt.title("Distribution of Max Logit Values (Excluding Forget Class)")
    plt.xlabel("Max Logit Value")
    plt.ylabel("Density")
    
    # Save the plot with timestamp in the filename
    plot_filename = f"max_logit_distribution_{timestamp}.png"
    plt.savefig(plot_filename)
    plt.close()
    
    print(f"Max logit distribution plot saved as {plot_filename}")
    print(f"Mean max logit: {max_logits.mean():.4f}")
    print(f"Median max logit: {np.median(max_logits):.4f}")
    print(f"Min max logit: {max_logits.min():.4f}")
    print(f"Max max logit: {max_logits.max():.4f}")
    
    return activations, predictions #, logits

async def evaluate_model(model, data_loader, criterion, device):
    model.eval()
    total_loss = 0
    correct = 0
    total = 0
    class_correct = [0] * 10
    class_total = [0] * 10
    
    with torch.no_grad():
        for data in data_loader:
            images, labels = data[0].to(device), data[1].to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            total_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
            c = (predicted == labels).squeeze()
            for i in range(len(labels)):
                label = labels[i]
                class_correct[label] += c[i].item()
                class_total[label] += 1
    
    accuracy = 100. * correct / total
    class_accuracies = {i: (100 * class_correct[i] / class_total[i] if class_total[i] > 0 else 0) for i in range(10)}
    
    return total_loss / len(data_loader), accuracy, class_accuracies