import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getCurrentQuarter, getQuartersAhead } from '../../utils';

export function VisionFeature() {
  const { visions, addVision, deleteVision, backwardSteps, addBackwardStep, updateBackwardStep, deleteBackwardStep, selectedVisionId, setSelectedVisionId } = useApp();
  const [newVisionTitle, setNewVisionTitle] = useState('');
  const [newVisionDesc, setNewVisionDesc] = useState('');
  const [newVisionDate, setNewVisionDate] = useState('');
  const [newStepContent, setNewStepContent] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter());

  const selectedVision = visions.find(v => v.id === selectedVisionId);
  const quarters = getQuartersAhead(getCurrentQuarter(), 8);

  useEffect(() => {
    if (!selectedVisionId && visions.length > 0) {
      setSelectedVisionId(visions[0].id);
    }
  }, [visions, selectedVisionId, setSelectedVisionId]);

  useEffect(() => {
    if (selectedVisionId) {
      const steps = backwardSteps.filter(s => s.visionId === selectedVisionId);
      if (steps.length === 0) {
      }
    }
  }, [selectedVisionId]);

  const handleAddVision = () => {
    if (!newVisionTitle.trim()) return;
    addVision({
      title: newVisionTitle.trim(),
      description: newVisionDesc.trim(),
      targetDate: newVisionDate,
      status: 'active',
    });
    setNewVisionTitle('');
    setNewVisionDesc('');
    setNewVisionDate('');
  };

  const handleDeleteVision = (id: string) => {
    if (confirm('确定删除这个愿景吗？相关规划也会被删除。')) {
      deleteVision(id);
    }
  };

  const handleAddStep = () => {
    if (!newStepContent.trim() || !selectedVisionId) return;
    const existingSteps = backwardSteps.filter(
      s => s.visionId === selectedVisionId && s.quarter === selectedQuarter
    );
    addBackwardStep({
      visionId: selectedVisionId,
      content: newStepContent.trim(),
      quarter: selectedQuarter,
      status: 'pending',
      order: existingSteps.length,
    });
    setNewStepContent('');
  };

  const handleToggleStep = (id: string, status: 'pending' | 'in_progress' | 'completed') => {
    const nextStatus = status === 'pending' ? 'in_progress' : status === 'in_progress' ? 'completed' : 'pending';
    updateBackwardStep(id, { status: nextStatus });
  };

  const handleDeleteStep = (id: string) => {
    deleteBackwardStep(id);
  };

  const getStepsByQuarter = (quarter: string) => {
    return backwardSteps.filter(s => s.visionId === selectedVisionId && s.quarter === quarter);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-medium text-gray-900 mb-4">我的愿景</h2>

        {visions.length > 0 ? (
          <div className="space-y-3 mb-4">
            {visions.map(vision => (
              <div
                key={vision.id}
                onClick={() => setSelectedVisionId(vision.id)}
                className={`p-4 rounded-xl cursor-pointer transition border-2 ${
                  selectedVisionId === vision.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{vision.title}</div>
                    {vision.description && (
                      <div className="text-xs text-gray-500 mt-1">{vision.description}</div>
                    )}
                    {vision.targetDate && (
                      <div className="text-xs text-gray-400 mt-1">目标: {vision.targetDate}</div>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteVision(vision.id); }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400 mb-4">还没有愿景，添加你的第一个愿景吧</div>
        )}

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <input
            type="text"
            value={newVisionTitle}
            onChange={e => setNewVisionTitle(e.target.value)}
            placeholder="愿景标题..."
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={newVisionDesc}
            onChange={e => setNewVisionDesc(e.target.value)}
            placeholder="描述（可选）..."
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={newVisionDate}
              onChange={e => setNewVisionDate(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddVision}
              disabled={!newVisionTitle.trim()}
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              添加愿景
            </button>
          </div>
        </div>
      </div>

      {selectedVision && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-medium text-gray-900 mb-4">逆向规划 - {selectedVision.title}</h2>

          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {quarters.map(q => (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                  selectedQuarter === q
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          <div className="space-y-3 mb-4">
            {getStepsByQuarter(selectedQuarter).length > 0 ? (
              getStepsByQuarter(selectedQuarter).map(step => (
                <div key={step.id} className="flex items-center gap-3 group">
                  <button
                    onClick={() => handleToggleStep(step.id, step.status)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                      step.status === 'completed'
                        ? 'bg-green-500'
                        : step.status === 'in_progress'
                        ? 'bg-blue-500'
                        : 'border-2 border-gray-300'
                    }`}
                  >
                    {step.status === 'completed' && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {step.status === 'in_progress' && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${
                    step.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-700'
                  }`}>
                    {step.content}
                  </span>
                  <button
                    onClick={() => handleDeleteStep(step.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400 py-4 text-center">
                还没有{selectedQuarter}的行动步骤
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newStepContent}
              onChange={e => setNewStepContent(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddStep()}
              placeholder="添加行动步骤..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddStep}
              disabled={!newStepContent.trim()}
              className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              添加
            </button>
          </div>
        </div>
      )}

      {visions.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <div className="text-sm text-gray-500">添加你的第一个愿景，开启逆向规划</div>
        </div>
      )}
    </div>
  );
}
