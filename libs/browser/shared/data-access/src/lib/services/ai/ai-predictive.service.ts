import { Injectable, signal } from '@angular/core';
import { PredictiveModel, PredictionResult } from '../../models/ai-bot.model';

@Injectable({ providedIn: 'root' })
export class AIPredictiveService {
  private readonly _predictiveModels = signal<Record<string, PredictiveModel[]>>({});
  readonly predictiveModels = this._predictiveModels.asReadonly();

  createPredictiveModel(feature: string, type: PredictiveModel['type'], name: string, description: string): string {
    const modelId = `model_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const model: PredictiveModel = {
      id: modelId, feature, type, name, description,
      accuracy: 0, lastTrained: Date.now(), predictions: [], parameters: {}
    };

    this._predictiveModels.update(current => ({
      ...current,
      [feature]: [...(current[feature] || []), model]
    }));
    return modelId;
  }

  generatePrediction(modelId: string, input: Record<string, unknown>): PredictionResult | null {
    let targetModel: PredictiveModel | null = null;
    let feature = '';

    for (const [feat, models] of Object.entries(this._predictiveModels())) {
      const model = models.find(m => m.id === modelId);
      if (model) { targetModel = model; feature = feat; break; }
    }

    if (!targetModel) return null;

    const result: PredictionResult = {
      id: `pred_${Date.now()}`,
      timestamp: Date.now(),
      input,
      prediction: this.calculatePrediction(targetModel, input),
      confidence: this.calculateConfidence(targetModel, input)
    };

    this._predictiveModels.update(current => ({
      ...current,
      [feature]: current[feature].map(m => m.id === modelId ? { ...m, predictions: [...m.predictions, result] } : m)
    }));
    return result;
  }

  private calculatePrediction(model: PredictiveModel, input: Record<string, unknown>): any {
    switch (model.type) {
      case 'demand_forecast':
        return Math.round(((input['currentStock'] as number) || 100) * ((input['growthRate'] as number) || 1.1));
      case 'churn_prediction':
        return (((input['complaints'] as number) || 0) * 10 + (5 - ((input['satisfaction'] as number) || 5)) * 20) > 50 ? 'high_risk' : 'low_risk';
      default: return 'unknown';
    }
  }

  private calculateConfidence(model: PredictiveModel, input: Record<string, unknown>): number {
    return Math.min(100, (model.accuracy || 50) + (Object.keys(input).length > 3 ? 20 : 10));
  }
}
