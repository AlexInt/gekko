import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from typing import Dict, Any, Optional
from app.ai.models.base import BaseAIModel
import os

class LSTMNet(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, output_size, dropout=0.2):
        super(LSTMNet, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=dropout)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        
        out, _ = self.lstm(x, (h0, c0))
        # out: (batch_size, seq_length, hidden_size)
        # 取最后一个时间步的输出
        out = out[:, -1, :]
        out = self.fc(out)
        return out

class LSTMModel(BaseAIModel):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.input_size = config.get('input_size', 1)
        self.hidden_size = config.get('hidden_size', 64)
        self.num_layers = config.get('num_layers', 2)
        self.output_size = config.get('output_size', 1)
        self.dropout = config.get('dropout', 0.2)
        self.learning_rate = config.get('learning_rate', 0.001)
        self.epochs = config.get('epochs', 10)
        self.batch_size = config.get('batch_size', 32)
        
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = LSTMNet(self.input_size, self.hidden_size, self.num_layers, self.output_size, self.dropout).to(self.device)
        self.criterion = nn.MSELoss()
        self.optimizer = optim.Adam(self.model.parameters(), lr=self.learning_rate)

    def train(self, X_train: np.ndarray, y_train: np.ndarray, X_val: Optional[np.ndarray] = None, y_val: Optional[np.ndarray] = None) -> Dict[str, Any]:
        self.model.train()
        
        # 转换为张量
        X_train_tensor = torch.FloatTensor(X_train).to(self.device)
        y_train_tensor = torch.FloatTensor(y_train).to(self.device).view(-1, self.output_size)
        
        dataset = torch.utils.data.TensorDataset(X_train_tensor, y_train_tensor)
        dataloader = torch.utils.data.DataLoader(dataset, batch_size=self.batch_size, shuffle=True)
        
        history = {'loss': [], 'val_loss': []}
        
        for epoch in range(self.epochs):
            epoch_loss = 0
            for batch_X, batch_y in dataloader:
                self.optimizer.zero_grad()
                outputs = self.model(batch_X)
                loss = self.criterion(outputs, batch_y)
                loss.backward()
                self.optimizer.step()
                epoch_loss += loss.item()
            
            avg_loss = epoch_loss / len(dataloader)
            history['loss'].append(avg_loss)
            
            if X_val is not None and y_val is not None:
                val_loss = self.evaluate(X_val, y_val)
                history['val_loss'].append(val_loss)
                # print(f"Epoch {epoch+1}/{self.epochs}, Loss: {avg_loss:.4f}, Val Loss: {val_loss:.4f}")
            else:
                pass
                # print(f"Epoch {epoch+1}/{self.epochs}, Loss: {avg_loss:.4f}")
                
        return {
            'final_loss': history['loss'][-1],
            'final_val_loss': history['val_loss'][-1] if history['val_loss'] else None,
            'history': history
        }

    def evaluate(self, X: np.ndarray, y: np.ndarray) -> float:
        self.model.eval()
        with torch.no_grad():
            X_tensor = torch.FloatTensor(X).to(self.device)
            y_tensor = torch.FloatTensor(y).to(self.device).view(-1, self.output_size)
            outputs = self.model(X_tensor)
            loss = self.criterion(outputs, y_tensor)
            return loss.item()

    def predict(self, X: np.ndarray) -> np.ndarray:
        self.model.eval()
        with torch.no_grad():
            X_tensor = torch.FloatTensor(X).to(self.device)
            outputs = self.model(X_tensor)
            return outputs.cpu().numpy()

    def save(self, path: str):
        torch.save({
            'model_state_dict': self.model.state_dict(),
            'config': self.config
        }, path)

    def load(self, path: str):
        checkpoint = torch.load(path, map_location=self.device)
        self.config = checkpoint['config']
        
        # 使用加载的配置重新初始化模型
        self.input_size = self.config.get('input_size', 1)
        self.hidden_size = self.config.get('hidden_size', 64)
        self.num_layers = self.config.get('num_layers', 2)
        self.output_size = self.config.get('output_size', 1)
        self.dropout = self.config.get('dropout', 0.2)
        
        self.model = LSTMNet(self.input_size, self.hidden_size, self.num_layers, self.output_size, self.dropout).to(self.device)
        
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.eval()
